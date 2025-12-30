// app/api/admin/design/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const enquiries = await prisma.designEnquiry.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(enquiries);
}
