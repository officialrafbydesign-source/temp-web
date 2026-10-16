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

import { reportingPeriod } from "@/lib/adminReporting";

export async function GET(request: Request) {
  const authorization =
    await authorizeAdminApi();

  if (
    !authorization.authorized
  ) {
    return authorization.response;
  }

  try {
    const analytics =
      await getAdminAnalytics(reportingPeriod(new URL(request.url).searchParams.get("period")));

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