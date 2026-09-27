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

export async function GET() {
  const authorization =
    await authorizeAdminApi();

  if (
    !authorization.authorized
  ) {
    return authorization.response;
  }

  try {
    const beats =
      await prisma.beat.findMany({
        include: {
          licenses:
            true,
          downloadLogs:
            true,
        },

        orderBy: {
          createdAt:
            "desc",
        },
      });

    const formattedBeats =
      beats.map(
        (beat) => {
          const stdLic =
            beat.licenses.find(
              (license) =>
                license.name
                  .toLowerCase()
                  .includes(
                    "standard"
                  )
            );

          const premLic =
            beat.licenses.find(
              (license) => {
                const name =
                  license.name.toLowerCase();

                return (
                  name.includes(
                    "premium"
                  ) ||
                  name.includes(
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
              stdLic
                ? stdLic.price /
                  100
                : 29.99,

            pricePremium:
              premLic
                ? premLic.price /
                  100
                : 79.99,

            mp3Url:
              beat.audioUrl ||
              "",

            standardFileUrl:
              stdLic?.fileUrl ||
              "",

            zipUrl:
              premLic?.fileUrl ||
              beat.fileUrl ||
              "",

            artworkUrl:
              beat.artworkUrl ||
              "",

            mascotImage:
              beat.mascotImage ||
              "",

            backgroundImage:
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
        headers: {
          "Cache-Control":
            "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "GET /api/admin/beats error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch beats",
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
    const body =
      await req.json();

    const standardFileUrl =
      cleanOptionalUrl(
        body.standardFileUrl
      );

    const premiumFileUrl =
      cleanOptionalUrl(
        body.zipUrl ||
          body.fileUrl
      );

    const newBeat =
      await prisma.beat.create({
        data: {
          title:
            body.title,

          bpm:
            body.bpm
              ? Number(
                  body.bpm
                )
              : null,

          genre:
            body.genre ||
            null,

          key:
            body.musicalKey ||
            body.key ||
            null,

          freeDownload:
            Boolean(
              body.freeDownload
            ),

          tags:
            body.tags ||
            [],

          audioUrl:
            cleanOptionalUrl(
              body.mp3Url ||
                body.audioUrl
            ),

          fileUrl:
            premiumFileUrl,

          artworkUrl:
            body.artworkUrl ||
            null,

          mascotImage:
            body.mascotImage ||
            null,

          backgroundImage:
            body.backgroundImage ||
            null,

          licenses: {
            create: [
              {
                name:
                  "Standard Lease",

                price:
                  Math.round(
                    (Number(
                      body.priceStandard
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
                      body.pricePremium
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

    const stdLic =
      newBeat.licenses.find(
        (license) =>
          license.name
            .toLowerCase()
            .includes(
              "standard"
            )
      );

    const premLic =
      newBeat.licenses.find(
        (license) => {
          const name =
            license.name.toLowerCase();

          return (
            name.includes(
              "premium"
            ) ||
            name.includes(
              "exclusive"
            )
          );
        }
      );

    const formattedBeat = {
      id:
        newBeat.id,

      title:
        newBeat.title,

      bpm:
        newBeat.bpm ||
        0,

      genre:
        newBeat.genre ||
        "",

      freeDownload:
        newBeat.freeDownload,

      musicalKey:
        newBeat.key ||
        "",

      tags:
        newBeat.tags ||
        [],

      priceStandard:
        stdLic
          ? stdLic.price /
            100
          : 29.99,

      pricePremium:
        premLic
          ? premLic.price /
            100
          : 79.99,

      mp3Url:
        newBeat.audioUrl ||
        "",

      standardFileUrl:
        stdLic?.fileUrl ||
        "",

      zipUrl:
        premLic?.fileUrl ||
        newBeat.fileUrl ||
        "",

      artworkUrl:
        newBeat.artworkUrl ||
        "",

      mascotImage:
        newBeat.mascotImage ||
        "",

      backgroundImage:
        newBeat.backgroundImage ||
        "",

      plays: 0,
      downloads: 0,
    };

    return NextResponse.json(
      {
        beat:
          formattedBeat,
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
      "POST /api/admin/beats error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Database save error",
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