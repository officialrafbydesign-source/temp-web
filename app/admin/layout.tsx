import type {
  ReactNode,
} from "react";
import {
  redirect,
} from "next/navigation";
import {
  requireAdmin,
} from "@/lib/auth";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const authorization =
    await requireAdmin();

  if (
    !authorization.authorized
  ) {
    if (
      authorization.status ===
      401
    ) {
      redirect(
        `/login?returnTo=${encodeURIComponent(
          "/admin"
        )}`
      );
    }

    redirect(
      "/account/orders"
    );
  }

  return (
    <main className="w-full min-h-screen bg-white text-zinc-900 antialiased">
      {children}
    </main>
  );
}