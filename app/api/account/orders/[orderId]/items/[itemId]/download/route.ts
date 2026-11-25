import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getPresignedDownloadUrl } from "@/lib/r2";
import { chooseMusicFile } from "@/lib/musicDownloadFiles";

export const dynamic = "force-dynamic";

type DownloadRouteContext = {
  params: Promise<{
    orderId: string;
    itemId: string;
  }>;
};

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

  // Paid files must be stored as private R2 object keys,
  // not public or permanently accessible URLs.
  if (/^https?:\/\//i.test(objectKey)) {
    return null;
  }

  return objectKey;
}

export async function GET(
  req: Request,
  { params }: DownloadRouteContext
) {
  try {
    const format = new URL(req.url).searchParams.get("format");
    if (format && !["mp3", "wav", "original"].includes(format)) return NextResponse.json({ error: "Choose MP3 or WAV." }, { status: 400, headers: { "Cache-Control": "private, no-store" } });
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "You must be signed in to download this purchase",
        },
        {
          status: 401,
        }
      );
    }

    const { orderId, itemId } = await params;

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id,

        status: {
          in: [
            "paid",
            "processing",
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

    const item = order?.items[0];

    if (!order || !item) {
      return NextResponse.json(
        {
          error: "Download not found",
        },
        {
          status: 404,
        }
      );
    }

    let storedFileReference:
      | string
      | null = null;

    let downloadBeatId:
      | string
      | null = null;

    if (item.productType === "beat") {
      if (!item.licenseId) {
        return NextResponse.json(
          {
            error:
              "This beat order does not have a valid licence",
          },
          {
            status: 404,
          }
        );
      }

      const license =
        await prisma.license.findUnique({
          where: {
            id: item.licenseId,
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

      const expectedBeatId =
        item.beatId ||
        item.productId;

      if (
        !license ||
        !expectedBeatId ||
        license.beatId !==
          expectedBeatId
      ) {
        return NextResponse.json(
          {
            error:
              "This beat licence is no longer valid",
          },
          {
            status: 404,
          }
        );
      }

      const licenceName =
        license.name.toLowerCase();

      const isStandardLicence =
        licenceName.includes(
          "standard"
        );

      storedFileReference =
        isStandardLicence
          ? license.fileUrl
          : license.fileUrl ||
            license.beat.fileUrl;

      downloadBeatId =
        license.beat.id;
    } else if (
      item.productType === "music"
    ) {
      if (!item.productId) {
        return NextResponse.json(
          {
            error:
              "This music order is missing its product reference",
          },
          {
            status: 404,
          }
        );
      }

      const song =
        await prisma.song.findUnique({
          where: {
            id: item.productId,
          },

          select: {
            fileUrl: true,
            downloadFiles: true,
          },
        });

      if (song) {
        storedFileReference = chooseMusicFile(song.downloadFiles, song.fileUrl, "track", format);
      } else {
        const musicProduct =
          await prisma.musicProduct.findUnique(
            {
              where: {
                id: item.productId,
              },

              select: {
                fileUrl: true,
                itemType: true,
                downloadFiles: true,
              },
            }
          );

        if (
          musicProduct &&
          musicProduct.itemType
            .toUpperCase() !==
            "PHYSICAL"
        ) {
          storedFileReference = chooseMusicFile(musicProduct.downloadFiles, musicProduct.fileUrl, "release", format);
        }
      }
    } else {
      return NextResponse.json(
        {
          error:
            "This item is not a digital download",
        },
        {
          status: 400,
        }
      );
    }

    const privateObjectKey =
      getPrivateObjectKey(
        storedFileReference
      );

    if (!privateObjectKey) {
      return NextResponse.json(
        {
          error:
            "The secure download file has not been added yet",
        },
        {
          status: 404,
        }
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
              "paid_order",
          },
        })
        .catch((error) => {
          console.error(
            "Failed to record beat download:",
            error
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
      "GET /api/account/orders/[orderId]/items/[itemId]/download error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to prepare this download",
      },
      {
        status: 500,
      }
    );
  }
}
