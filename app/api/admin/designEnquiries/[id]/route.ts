import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH: update design enquiry status
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    const updatedEnquiry = await prisma.designEnquiry.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedEnquiry);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update enquiry" },
      { status: 500 }
    );
  }
}

// DELETE: delete design enquiry
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.designEnquiry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete enquiry" },
      { status: 500 }
    );
  }
}
