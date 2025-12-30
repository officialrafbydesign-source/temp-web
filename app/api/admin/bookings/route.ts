// app/api/admin/bookings/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: fetch all bookings and design enquiries
export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: true,
        service: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const designEnquiries = await prisma.designEnquiry.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookings, designEnquiries });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
