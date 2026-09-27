import {
  NextResponse,
} from "next/server";
import {
  getAdminAnalytics,
} from "@/lib/analytics";
import {
  authorizeAdminApi,
} from "@/lib/adminApi";

export const dynamic =
  "force-dynamic";

export async function GET() {
  const authorization =
    await authorizeAdminApi();

  if (
    !authorization.authorized
  ) {
    return authorization.response;
  }

  try {
    const analytics =
      await getAdminAnalytics();

    return NextResponse.json(
      analytics,
      {
        headers: {
          "Cache-Control":
            "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "GET /api/admin/analytics error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load analytics",
      },
      {
        status: 500,
        headers: {
          "Cache-Control":
            "private, no-store",
        },
      }
    );
  }
}