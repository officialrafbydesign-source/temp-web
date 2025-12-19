import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PATCH: update booking status
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { status } = await req.json();
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: { status },
    });
    return NextResponse.json(updatedBooking);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}

// DELETE: delete booking
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.booking.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 });
  }
}
