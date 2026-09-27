import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getPresignedDownloadUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";

function errorResponse(
  message: string,
  status: number
) {
  return NextResponse.json(
    {
      error: message,
    },
    {
      status,
    }
  );
}

function getPrivateObjectKey(
  value: string | null | undefined
) {
  if (!value) {
    return null;
  }

  const objectKey = value
    .trim()
    .replace(/^\/+/, "");

  if (!objectKey) {
    return null;
  }

  // Paid files must be private R2 object keys,
  // not complete public URLs.
  if (/^https?:\/\//i.test(objectKey)) {
    return null;
  }

  return objectKey;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(
    req.url
  );

  const sessionId =
    searchParams.get("session_id");

  const itemId =
    searchParams.get("item_id");

  if (!sessionId || !itemId) {
    return errorResponse(
      "Missing session or order item",
      400
    );
  }

  try {
    const user =
      await getCurrentUser();

    if (!user) {
      return errorResponse(
        "You must be signed in to download this purchase",
        401
      );
    }

    const order =
      await prisma.order.findFirst({
        where: {
          stripeSessionId:
            sessionId,

          userId:
            user.id,

          status: {
            in: [
              "paid",
              "shipped",
              "delivered",
            ],
          },

          items: {
            some: {
              id: itemId,
            },
          },
        },

        include: {
          items: {
            where: {
              id: itemId,
            },
          },
        },
      });

    const orderItem =
      order?.items[0];

    if (!order || !orderItem) {
      return errorResponse(
        "Download not found",
        404
      );
    }

    let storedFileReference:
      | string
      | null = null;

    let downloadBeatId:
      | string
      | null = null;

    let downloadType =
      "paid_order";

    if (
      orderItem.productType ===
      "beat"
    ) {
      if (
        !orderItem.licenseId
      ) {
        return errorResponse(
          "Beat licence information is missing",
          404
        );
      }

      const license =
        await prisma.license.findUnique({
          where: {
            id:
              orderItem.licenseId,
          },

          include: {
            beat: {
              select: {
                id: true,
                fileUrl: true,
              },
            },
          },
        });

      if (!license) {
        return errorResponse(
          "Beat licence not found",
          404
        );
      }

      const purchasedBeatId =
        orderItem.beatId ||
        orderItem.productId;

      if (
        !purchasedBeatId ||
        license.beatId !==
          purchasedBeatId
      ) {
        return errorResponse(
          "Beat licence does not match this order",
          403
        );
      }

      const licenceName =
        license.name.toLowerCase();

      const isPremiumOrExclusive =
        licenceName.includes(
          "premium"
        ) ||
        licenceName.includes(
          "exclusive"
        ) ||
        licenceName.includes(
          "unlimited"
        ) ||
        licenceName.includes(
          "buyout"
        );

      storedFileReference =
        license.fileUrl ||
        (isPremiumOrExclusive
          ? license.beat.fileUrl
          : null);

      if (!storedFileReference) {
        return errorResponse(
          "The download file has not been added for this licence",
          404
        );
      }

      downloadBeatId =
        license.beatId;

      downloadType =
        license.name;
    } else if (
      orderItem.productType ===
      "music"
    ) {
      if (!orderItem.productId) {
        return errorResponse(
          "Music product information is missing",
          404
        );
      }

      const musicProduct =
        await prisma.musicProduct.findUnique({
          where: {
            id:
              orderItem.productId,
          },

          select: {
            itemType: true,
            fileUrl: true,
          },
        });

      if (musicProduct) {
        const isPhysical =
          String(
            musicProduct.itemType
          ).toUpperCase() ===
          "PHYSICAL";

        if (isPhysical) {
          return errorResponse(
            "Physical music products do not have a download",
            400
          );
        }

        storedFileReference =
          musicProduct.fileUrl;
      } else {
        const song =
          await prisma.song.findUnique({
            where: {
              id:
                orderItem.productId,
            },

            select: {
              fileUrl: true,
            },
          });

        storedFileReference =
          song?.fileUrl ||
          null;
      }

      if (!storedFileReference) {
        return errorResponse(
          "The music download file has not been added",
          404
        );
      }
    } else {
      return errorResponse(
        "This order item is not downloadable",
        400
      );
    }

    const privateObjectKey =
      getPrivateObjectKey(
        storedFileReference
      );

    if (!privateObjectKey) {
      return errorResponse(
        "The secure download file has not been added yet",
        404
      );
    }

    const signedDownloadUrl =
      await getPresignedDownloadUrl(
        privateObjectKey
      );

    if (downloadBeatId) {
      const forwardedFor =
        req.headers.get(
          "x-forwarded-for"
        );

      const ip =
        forwardedFor
          ?.split(",")[0]
          ?.trim() ||
        req.headers.get(
          "x-real-ip"
        ) ||
        null;

      await prisma.downloadLog
        .create({
          data: {
            beatId:
              downloadBeatId,

            userEmail:
              user.email,

            ip,

            type:
              downloadType,
          },
        })
        .catch((logError) => {
          console.error(
            "Beat download log error:",
            logError
          );
        });
    }

    const response =
      NextResponse.redirect(
        signedDownloadUrl,
        302
      );

    response.headers.set(
      "Cache-Control",
      "private, no-store"
    );

    return response;
  } catch (error) {
    console.error(
      "GET /api/checkout/download error:",
      error
    );

    return errorResponse(
      "Download could not be prepared",
      500
    );
  }
}