import { NextResponse } from "next/server";
import { authorizeAdminApi } from "@/lib/adminApi";
export const dynamic = "force-dynamic";
export async function PATCH() {
  const authorization = await authorizeAdminApi();
  if (!authorization.authorized) return authorization.response;
  return NextResponse.json({ error: "Use Beat Store order in Admin → Beats." }, { status: 410, headers: { "Cache-Control": "private, no-store" } });
}
