import { NextRequest } from "next/server";

export function requireAdmin(req: NextRequest) {
  const adminSecret = req.headers.get("x-admin-secret");

  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    throw new Error("Unauthorized");
  }
}
