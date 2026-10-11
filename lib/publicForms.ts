import "server-only";
import { NextResponse } from "next/server";
import { consumeAuthRateLimit, getRequestIp } from "@/lib/authRateLimit";

export class PublicFormError extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message);
    this.name = "PublicFormError";
  }
}

export function isEmail(value: string) {
  return value.length <= 254 && /^[^\s@<>\x00-\x1f\x7f]+@[^\s@<>\x00-\x1f\x7f]+\.[^\s@<>\x00-\x1f\x7f]+$/.test(value);
}

export async function readPublicForm(req: Request): Promise<Record<string, unknown>> {
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin) {
    throw new PublicFormError("Please submit this form from the RAF By Design website.", 403);
  }
  if (!req.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    throw new PublicFormError("Please submit the form again.", 415);
  }
  const maxBytes = 16000;
  if (Number(req.headers.get("content-length")) > maxBytes) {
    throw new PublicFormError("Your message is too long.", 413);
  }
  const raw = await req.text();
  if (Buffer.byteLength(raw, "utf8") > maxBytes) {
    throw new PublicFormError("Your message is too long.", 413);
  }
  let body: unknown;
  try { body = JSON.parse(raw); }
  catch { throw new PublicFormError("Please submit the form again."); }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new PublicFormError("Please submit the form again.");
  }
  const fields = body as Record<string, unknown>;
  if (fields.website) throw new PublicFormError("Please submit the form again.");
  return fields;
}

export async function limitPublicForm(req: Request, action: "contact" | "newsletter") {
  const result = await consumeAuthRateLimit({
    action: `public-${action}`,
    identifier: getRequestIp(req),
    maxAttempts: action === "contact" ? 5 : 8,
    windowMs: 15 * 60 * 1000,
    blockMs: 15 * 60 * 1000,
  });
  if (result.allowed) return null;
  return NextResponse.json(
    { error: "Too many attempts. Please wait a few minutes and try again." },
    { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds), "Cache-Control": "no-store" } },
  );
}

export function publicFormFailure(error: unknown, fallback: string) {
  if (error instanceof PublicFormError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error("Public form failed:", error instanceof Error ? error.name : "UnknownError");
  return NextResponse.json({ error: fallback }, { status: 503 });
}
