import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminBookingsLayout({ children }: { children: React.ReactNode }) {
  const authorization = await requireAdmin();
  if (!authorization.authorized) {
    redirect(authorization.status === 401
      ? "/login?returnTo=%2Fadmin%2Fbookings"
      : "/");
  }
  return children;
}
