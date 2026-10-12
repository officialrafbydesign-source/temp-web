import "server-only";
import { createHash } from "node:crypto";
import { PublicFormError } from "@/lib/publicForms";

export async function subscribeToNewsletter(email: string) {
  const apiKey = process.env.MAILCHIMP_API_KEY?.trim();
  const listId = process.env.MAILCHIMP_LIST_ID?.trim();
  const server = apiKey?.split("-").at(-1);
  if (!apiKey || !listId || !server || !/^us\d+$/.test(server)) {
    throw new PublicFormError("Newsletter signup is temporarily unavailable. Please try again later.", 503);
  }
  const hash = createHash("md5").update(email.toLowerCase()).digest("hex");
  const url = `https://${server}.api.mailchimp.com/3.0/lists/${encodeURIComponent(listId)}/members/${hash}?skip_merge_validation=true`;

  async function update(method: "PUT" | "PATCH", body: Record<string, string>) {
    const response = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    const member: { status?: string } = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("Newsletter provider rejected signup:", response.status);
      throw new PublicFormError(
        response.status === 400
          ? "We couldn’t subscribe this address. Please check your email or try another address."
          : "Newsletter signup is temporarily unavailable. Please try again later.",
        response.status === 400 ? 400 : 503,
      );
    }
    return member;
  }

  // A visitor explicitly submitting the newsletter form opts in immediately.
  // Existing subscribers keep their profile data; only this address is updated.
  let member = await update("PUT", { email_address: email, status_if_new: "subscribed" });
  if (member.status === "pending" || member.status === "unsubscribed" || member.status === "transactional") {
    member = await update("PATCH", { status: "subscribed" });
  }
  if (member.status === "subscribed") {
    return { status: "subscribed" as const, message: "You’re subscribed to RAF. Thanks for joining." };
  }
  if (member.status === "pending") {
    throw new PublicFormError("We couldn’t complete your subscription right now. Please try again later.", 503);
  }
  throw new PublicFormError("We couldn’t subscribe this address. Please try another email or contact us.", 400);
}
