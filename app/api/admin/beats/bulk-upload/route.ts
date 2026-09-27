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

export async function POST(
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
      ) ||
      beats.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid or empty beat list",
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

    const createdBeats =
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

            return prisma.beat.create({
              data: {
                title:
                  typeof beat.title ===
                    "string" &&
                  beat.title.trim()
                    ? beat.title.trim()
                    : "Untitled",

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
                  Array.isArray(
                    beat.tags
                  )
                    ? beat.tags
                    : [],

                audioUrl:
                  cleanOptionalUrl(
                    beat.mp3Url ||
                      beat.audioUrl
                  ),

                fileUrl:
                  premiumFileUrl,

                artworkUrl:
                  cleanOptionalUrl(
                    beat.artworkUrl
                  ),

                mascotImage:
                  cleanOptionalUrl(
                    beat.mascotImage
                  ),

                backgroundImage:
                  cleanOptionalUrl(
                    beat.backgroundUrl ||
                      beat.backgroundImage
                  ),

                licenses: {
                  create: [
                    {
                      name:
                        "Standard Lease",

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
                    {
                      name:
                        "Premium Lease",

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
                  ],
                },
              },

              include: {
                licenses:
                  true,
                downloadLogs:
                  true,
              },
            });
          }
        )
      );

    const formattedBeats =
      createdBeats.map(
        (beat) => {
          const standardLicense =
            beat.licenses.find(
              (license) =>
                license.name
                  .toLowerCase()
                  .includes(
                    "standard"
                  )
            );

          const premiumLicense =
            beat.licenses.find(
              (license) => {
                const licenseName =
                  license.name.toLowerCase();

                return (
                  licenseName.includes(
                    "premium"
                  ) ||
                  licenseName.includes(
                    "exclusive"
                  )
                );
              }
            );

          return {
            id:
              beat.id,

            title:
              beat.title,

            bpm:
              beat.bpm ||
              0,

            genre:
              beat.genre ||
              "",

            freeDownload:
              beat.freeDownload,

            musicalKey:
              beat.key ||
              "",

            tags:
              beat.tags ||
              [],

            priceStandard:
              standardLicense
                ? standardLicense.price /
                  100
                : 29.99,

            pricePremium:
              premiumLicense
                ? premiumLicense.price /
                  100
                : 79.99,

            mp3Url:
              beat.audioUrl ||
              "",

            standardFileUrl:
              standardLicense?.fileUrl ||
              "",

            zipUrl:
              premiumLicense?.fileUrl ||
              beat.fileUrl ||
              "",

            artworkUrl:
              beat.artworkUrl ||
              "",

            backgroundUrl:
              beat.backgroundImage ||
              "",

            plays: 0,

            downloads:
              beat.downloadLogs
                .length,
          };
        }
      );

    return NextResponse.json(
      {
        beats:
          formattedBeats,
      },
      {
        status: 201,
        headers: {
          "Cache-Control":
            "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "POST /api/admin/beats/bulk-upload error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Bulk upload failed",
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