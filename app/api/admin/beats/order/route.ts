import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeAdminApi } from "@/lib/adminApi";
import { beatStoreOrderStatement, type BeatStoreOrderSaveResult } from "@/lib/beatStoreOrderSave";

export const dynamic = "force-dynamic";
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });

export async function PATCH(request: Request) {
  const authorization = await authorizeAdminApi();
  if (!authorization.authorized) return authorization.response;
  let body;
  try { body = await request.json(); }
  catch { return json({ error: "Invalid JSON" }, 400); }
  const ids: unknown = body?.ids;
  if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string" || !id.trim()) || new Set(ids).size !== ids.length) {
    return json({ error: "Supply each beat ID once in the desired order." }, 400);
  }
  try {
    const [result] = await prisma.$queryRaw<BeatStoreOrderSaveResult[]>(beatStoreOrderStatement(ids as string[]));
    if (!result || result.catalogueMatches !== true) {
      return json({ error: "The beat catalogue changed. Refresh the page before saving its order." }, 409);
    }
    return json({ success: true, items: result.items });
  } catch (error) {
    console.error("Unable to save Beat Store order", error);
    const value = error && typeof error === "object" ? error as { code?: unknown; meta?: { code?: unknown } } : {};
    const code = typeof value.code === "string" && /^P\d{4}$/.test(value.code) ? value.code : "ORDER_SAVE_FAILED";
    const databaseCode = typeof value.meta?.code === "string" ? value.meta.code : "";
    const retryable = ["P1001", "P1002", "P1008", "P1017", "P2024", "P2028", "P2034"].includes(code)
      || ["40001", "40P01", "55P03", "57014"].includes(databaseCode);
    return json({ error: retryable
      ? `The database was busy or timed out. Your draft is still here; try Save store order again. (${code})`
      : `Unable to save the Beat Store order. Your draft is still here. (${code})`, code }, retryable ? 503 : 500);
  }
}
