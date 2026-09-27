import "server-only";

import {
  NextResponse,
} from "next/server";

import {
  requireAdmin,
} from "@/lib/auth";

export async function authorizeAdminApi() {
  const authorization =
    await requireAdmin();

  if (
    !authorization.authorized
  ) {
    const response =
      NextResponse.json(
        {
          error:
            authorization.error,
        },
        {
          status:
            authorization.status,
        }
      );

    response.headers.set(
      "Cache-Control",
      "private, no-store"
    );

    return {
      authorized:
        false as const,

      response,
    };
  }

  return {
    authorized:
      true as const,

    user:
      authorization.user,
  };
}