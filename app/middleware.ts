import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/api/admin")) {
    const adminSecret = req.headers.get("x-admin-secret");

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
}

export const config = {
  matcher: ["/api/admin/:path*"],
};
