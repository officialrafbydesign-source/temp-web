import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe"; // your stripe setup

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // handle stripe logic here...
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Stripe POST failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // optional PATCH logic
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Stripe PATCH failed" }, { status: 500 });
  }
}
