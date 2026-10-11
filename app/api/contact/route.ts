import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { isEmail, limitPublicForm, PublicFormError, publicFormFailure, readPublicForm } from "@/lib/publicForms";

export const runtime = "nodejs";
const enquiryTypes = new Set(["General", "Beats", "Design", "Music", "Clothing"]);
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]!);

export async function POST(req: Request) {
  try {
    const body = await readPublicForm(req);
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const inquiryType = typeof body.inquiryType === "string" ? body.inquiryType : "General";
    if (!name || name.length > 120 || /[\x00-\x1f\x7f]/.test(name)) {
      throw new PublicFormError("Please enter your name (up to 120 characters).");
    }
    if (!isEmail(email)) throw new PublicFormError("Please enter a valid email address.");
    if (!message || message.length > 5000) throw new PublicFormError("Please enter a message of up to 5,000 characters.");
    if (!enquiryTypes.has(inquiryType)) throw new PublicFormError("Please choose an enquiry type.");
    if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
      throw new PublicFormError("We couldn’t send your message right now. Please try again later.", 503);
    }
    const limited = await limitPublicForm(req, "contact");
    if (limited) return limited;
    const result = await sendEmail({
      to: process.env.CONTACT_TO_EMAIL || process.env.RESEND_REPLY_TO_EMAIL || "officialrafbydesign@gmail.com",
      replyTo: email,
      subject: `RAF website enquiry: ${inquiryType}`,
      text: `Name: ${name}\nEmail: ${email}\nEnquiry: ${inquiryType}\n\n${message}`,
      html: `<h2>RAF website enquiry</h2><p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Enquiry:</strong> ${escapeHtml(inquiryType)}</p><p>${escapeHtml(message).replace(/\r?\n/g, "<br />")}</p>`,
    });
    if (result.error || !result.data?.id) {
      console.error("Contact email rejected:", result.error?.name || "missing_message_id");
      throw new PublicFormError("We couldn’t send your message right now. Please try again later.", 502);
    }
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return publicFormFailure(error, "We couldn’t send your message right now. Please try again later.");
  }
}
