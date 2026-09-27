import {
  NextResponse,
} from "next/server";
import {
  prisma,
} from "@/lib/prisma";
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
    const orders =
      await prisma.beatOrder.findMany({
        include: {
          beat: true,

          license:
            true,

          user: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt:
                true,
            },
          },
        },

        orderBy: {
          createdAt:
            "desc",
        },
      });

    return NextResponse.json(
      {
        orders,
      },
      {
        headers: {
          "Cache-Control":
            "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "GET /api/admin/beats/orders error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch orders",
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