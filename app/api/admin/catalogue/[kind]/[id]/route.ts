import { catalogueAdminAction } from "@/lib/catalogueAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ kind: string; id: string }> };

export async function PATCH(req: Request, context: Context) {
  const { kind, id } = await context.params;
  return catalogueAdminAction(req, kind, id);
}

export async function DELETE(req: Request, context: Context) {
  const { kind, id } = await context.params;
  return catalogueAdminAction(req, kind, id);
}
