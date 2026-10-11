import { NextResponse } from "next/server";
import { subscribeToNewsletter } from "@/lib/newsletter";
import { isEmail, limitPublicForm, PublicFormError, publicFormFailure, readPublicForm } from "@/lib/publicForms";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await readPublicForm(req);
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!isEmail(email)) throw new PublicFormError("Please enter a valid email address.");
    const limited = await limitPublicForm(req, "newsletter");
    if (limited) return limited;
    const subscription = await subscribeToNewsletter(email);
    return NextResponse.json({ success: true, ...subscription }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return publicFormFailure(error, "Newsletter signup is temporarily unavailable. Please try again later.");
  }
}
