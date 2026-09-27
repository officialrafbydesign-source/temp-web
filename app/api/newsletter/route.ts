import { NextResponse } from "next/server";
import * as prismaModule from "@/lib/prisma";

const db = (prismaModule as any).db || (prismaModule as any).prisma || (prismaModule as any).default;

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Save to DB (Ensure subscriber / email model exists, or log/pass to external CRM)
    if (db?.newsletterSubscriber) {
      await db.newsletterSubscriber.upsert({
        where: { email },
        update: {},
        create: { email },
      });
    }

    // If using Resend / Mailchimp API, trigger list addition here
    console.log(`[NEWSLETTER_SUB] Registered: ${email}`);

    return NextResponse.json({ success: true, message: "Subscribed to Matrix updates." });
  } catch (error) {
    console.error("[NEWSLETTER_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}