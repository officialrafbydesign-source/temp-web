import {
  NextRequest,
  NextResponse,
} from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

type BeatDownloadRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  req: NextRequest,
  { params }: BeatDownloadRouteContext
) {
  try {
    const currentUser =
      await getCurrentUser();

    if (!currentUser) {
      const loginUrl =
        new URL(
          "/login",
          req.url
        );

      loginUrl.searchParams.set(
        "returnTo",
        req.nextUrl.pathname
      );

      return NextResponse.redirect(
        loginUrl
      );
    }

    const { id: beatId } =
      await params;

    const order =
      await prisma.order.findFirst({
        where: {
          userId:
            currentUser.id,

          status: {
            in: [
              "paid",
              "shipped",
              "delivered",
            ],
          },

          items: {
            some: {
              productType:
                "beat",

              OR: [
                {
                  beatId,
                },
                {
                  productId:
                    beatId,
                },
              ],
            },
          },
        },

        include: {
          items: {
            where: {
              productType:
                "beat",

              OR: [
                {
                  beatId,
                },
                {
                  productId:
                    beatId,
                },
              ],
            },

            take: 1,
          },
        },

        orderBy: {
          createdAt:
            "desc",
        },
      });

    const orderItem =
      order?.items[0];

    if (
      !order ||
      !orderItem
    ) {
      return NextResponse.json(
        {
          error:
            "Purchase required",
        },
        {
          status: 403,
          headers: {
            "Cache-Control":
              "private, no-store",
          },
        }
      );
    }

    const secureDownloadUrl =
      new URL(
        `/api/account/orders/${encodeURIComponent(
          order.id
        )}/items/${encodeURIComponent(
          orderItem.id
        )}/download`,
        req.url
      );

    const response =
      NextResponse.redirect(
        secureDownloadUrl,
        307
      );

    response.headers.set(
      "Cache-Control",
      "private, no-store"
    );

    return response;
  } catch (error) {
    console.error(
      "GET /api/beats/[id]/download error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to prepare this download",
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