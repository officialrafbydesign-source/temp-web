import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, email, title, details } = body;

    // create user if not exists
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name },
    });

    const enquiry = await prisma.designEnquiry.create({
      data: {
        userId: user.id,
        title,
        details,
      },
    });

    return NextResponse.json({ success: true, enquiry });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create enquiry" }, { status: 500 });
  }
}
