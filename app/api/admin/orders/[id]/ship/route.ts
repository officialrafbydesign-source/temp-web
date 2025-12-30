// app/api/admin/orders/[id]/ship/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { sendEmail } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify admin access
  try {
    requireAdmin(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { trackingNumber, carrier } = await req.json();

  if (!trackingNumber || !carrier) {
    return NextResponse.json(
      { error: "Tracking number and carrier required" },
      { status: 400 }
    );
  }

  // Update order status in DB
  const order = await prisma.order.update({
    where: { id },
    data: {
      status: "shipped",
      trackingNumber,
      carrier,
      shippedAt: new Date(),
    },
  });

  // Send shipping email
  await sendEmail({
    to: order.email,
    subject: "Your order has shipped",
    html: `
      <h2>Your order is on the way 🚚</h2>
      <p><strong>Carrier:</strong> ${order.carrier}</p>
      <p><strong>Tracking number:</strong> ${order.trackingNumber}</p>
    `,
  });

  return NextResponse.json({ success: true, order });
}


