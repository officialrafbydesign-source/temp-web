import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orders = await prisma.beatOrder.findMany({
      include: {
        beat: true,
        license: true,
        user: true,
      },
    });

    return NextResponse.json({ orders });
  } catch (err: any) {
    console.error("API fetch beat orders error:", err);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
