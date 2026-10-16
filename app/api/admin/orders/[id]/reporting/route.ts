import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeAdminApi } from "@/lib/adminApi";

export const dynamic = "force-dynamic";
const json = (body: unknown, status = 200) => NextResponse.json(body, {
  status, headers: { "Cache-Control": "private, no-store" },
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeAdminApi();
  if (!authorization.authorized) return authorization.response;

  const { id } = await params;
  if (!id?.trim()) return json({ error: "Order ID is required" }, 400);
  let body;
  try { body = await request.json(); }
  catch { return json({ error: "Invalid JSON" }, 400); }
  if (!body || typeof body.excludedFromReports !== "boolean") {
    return json({ error: "excludedFromReports must be true or false" }, 400);
  }

  try {
    const result = await prisma.order.updateMany({
      where: { id }, data: { excludedFromReports: body.excludedFromReports },
    });
    if (!result.count) return json({ error: "Order not found" }, 404);
    return json({ id, excludedFromReports: body.excludedFromReports });
  } catch (error) {
    console.error("Unable to change order reporting", error);
    return json({ error: "Unable to update reporting" }, 500);
  }
}
