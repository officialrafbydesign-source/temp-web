import {
  NextResponse,
} from "next/server";
import {
  prisma,
} from "@/lib/prisma";
import {
  authorizeAdminApi,
} from "@/lib/adminApi";

function cleanOptionalUrl(
  value: unknown
) {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const cleaned =
    value.trim();

  return cleaned || null;
}

export async function PUT(
  req: Request
) {
  const authorization =
    await authorizeAdminApi();

  if (
    !authorization.authorized
  ) {
    return authorization.response;
  }

  try {
    const {
      beats,
    } =
      await req.json();

    if (
      !Array.isArray(
        beats
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid beat list",
        },
        {
          status: 400,
          headers: {
            "Cache-Control":
              "private, no-store",
          },
        }
      );
    }

    await prisma.$transaction(
      beats.map(
        (beat) => {
          const standardFileUrl =
            cleanOptionalUrl(
              beat.standardFileUrl
            );

          const premiumFileUrl =
            cleanOptionalUrl(
              beat.zipUrl ||
                beat.fileUrl
            );

          return prisma.beat.update({
            where: {
              id:
                beat.id,
            },

            data: {
              title:
                beat.title,

              bpm:
                beat.bpm
                  ? Number(
                      beat.bpm
                    )
                  : null,

              genre:
                beat.genre ||
                null,

              key:
                beat.musicalKey ||
                beat.key ||
                null,

              freeDownload:
                Boolean(
                  beat.freeDownload
                ),

              tags:
                beat.tags ||
                [],

              audioUrl:
                beat.mp3Url ||
                beat.audioUrl ||
                null,

              fileUrl:
                premiumFileUrl,

              artworkUrl:
                beat.artworkUrl ||
                null,

              mascotImage:
                beat.mascotImage ||
                null,

              backgroundImage:
                beat.backgroundImage ||
                null,

              licenses: {
                updateMany: [
                  {
                    where: {
                      name: {
                        contains:
                          "Standard",

                        mode:
                          "insensitive",
                      },
                    },

                    data: {
                      price:
                        Math.round(
                          (Number(
                            beat.priceStandard
                          ) ||
                            29.99) *
                            100
                        ),

                      fileUrl:
                        standardFileUrl,
                    },
                  },
                  {
                    where: {
                      OR: [
                        {
                          name: {
                            contains:
                              "Premium",

                            mode:
                              "insensitive",
                          },
                        },
                        {
                          name: {
                            contains:
                              "Exclusive",

                            mode:
                              "insensitive",
                          },
                        },
                      ],
                    },

                    data: {
                      price:
                        Math.round(
                          (Number(
                            beat.pricePremium
                          ) ||
                            79.99) *
                            100
                        ),

                      fileUrl:
                        premiumFileUrl,
                    },
                  },
                ],
              },
            },
          });
        }
      )
    );

    return NextResponse.json(
      {
        success: true,
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
      "PUT /api/admin/beats/bulk-update error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Bulk update failed",
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