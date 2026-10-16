import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeAdminApi } from "@/lib/adminApi";

export const dynamic = "force-dynamic";
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
class CatalogueChanged extends Error {}

export async function PATCH(request: Request) {
  const authorization = await authorizeAdminApi();
  if (!authorization.authorized) return authorization.response;
  let body;
  try { body = await request.json(); }
  catch { return json({ error: "Invalid JSON" }, 400); }
  const ids: unknown = body?.ids;
  if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string" || !id.trim()) || new Set(ids).size !== ids.length) {
    return json({ error: "Supply each beat ID once in the desired order." }, 400);
  }
  try {
    const items = await prisma.$transaction(async (tx) => {
      const existing = await tx.beat.findMany({ where: { deletedAt: null }, select: { id: true } });
      const requested = new Set(ids);
      if (existing.length !== ids.length || existing.some((item) => !requested.has(item.id))) throw new CatalogueChanged();
      const result = [];
      for (const [index, id] of (ids as string[]).entries()) {
        const storeOrder = index + 1;
        const updated = await tx.beat.updateMany({ where: { id, deletedAt: null }, data: { storeOrder } });
        if (updated.count !== 1) throw new CatalogueChanged();
        result.push({ id, storeOrder });
      }
      return result;
    });
    return json({ success: true, items });
  } catch (error) {
    if (error instanceof CatalogueChanged) return json({ error: "The beat catalogue changed. Refresh the page before saving its order." }, 409);
    console.error("Unable to save Beat Store order", error);
    return json({ error: "Unable to save the Beat Store order." }, 500);
  }
}
