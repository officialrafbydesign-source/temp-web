import { NextResponse } from "next/server";
import { authorizeAdminApi } from "@/lib/adminApi";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await authorizeAdminApi();
  if (!auth.authorized) return auth.response;
  let body;
  try { body = await request.json(); }
  catch { return json({ error: "Invalid JSON." }, 400); }
  if (typeof body?.isEditorsPick !== "boolean") return json({ error: "Choose whether this beat is an editor's pick." }, 400);
  const { id } = await context.params;
  if (!id?.trim()) return json({ error: "Missing beat ID." }, 400);
  try {
    const result = await prisma.beat.updateMany({ where: { id, deletedAt: null }, data: { isEditorsPick: body.isEditorsPick } });
    if (!result.count) return json({ error: "Beat not found. Refresh the catalogue." }, 404);
    return json({ success: true, id, isEditorsPick: body.isEditorsPick });
  } catch {
    return json({ error: "Unable to save the editor's pick. Check the database update and deployment, then try again." }, 500);
  }
}
