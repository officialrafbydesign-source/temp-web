import {
  NextRequest,
  NextResponse,
} from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

type MusicDownloadRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  req: NextRequest,
  { params }: MusicDownloadRouteContext
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

    const { id: releaseId } =
      await params;

    const musicProduct =
      await prisma.musicProduct.findUnique({
        where: {
          releaseId,
        },

        select: {
          id: true,
          itemType: true,
        },
      });

    if (!musicProduct) {
      return NextResponse.json(
        {
          error:
            "Music product not found",
        },
        {
          status: 404,
        }
      );
    }

    if (
      String(
        musicProduct.itemType
      ).toUpperCase() ===
      "PHYSICAL"
    ) {
      return NextResponse.json(
        {
          error:
            "Physical music products do not have a digital download",
        },
        {
          status: 400,
        }
      );
    }

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
                "music",

              productId:
                musicProduct.id,
            },
          },
        },

        include: {
          items: {
            where: {
              productType:
                "music",

              productId:
                musicProduct.id,
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
      "GET /api/music/[id]/download error:",
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