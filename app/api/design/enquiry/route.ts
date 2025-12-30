// app/api/design/enquiry/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, title, details } = body;

    // Create user if not exists
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name },
    });

    // Create design enquiry
    const enquiry = await prisma.designEnquiry.create({
      data: {
        userId: user.id,
        title,
        details,
      },
    });

    return NextResponse.json({ success: true, enquiry });
  } catch (err) {
    console.error("Design enquiry creation error:", err);
    return NextResponse.json({ error: "Failed to create enquiry" }, { status: 500 });
  }
}
