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

function jsonResponse(
  body: unknown,
  status = 200
) {
  return NextResponse.json(
    body,
    {
      status,

      headers: {
        "Cache-Control":
          "private, no-store",
      },
    }
  );
}

function isConsoleUrl(
  value: unknown
): boolean {
  if (!value) {
    return false;
  }

  return value
    .toString()
    .trim()
    .includes(
      "res-console.cloudinary.com"
    );
}

function safeNumber(
  value: unknown
): number | null {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const numberValue =
    Number(value);

  return Number.isFinite(
    numberValue
  )
    ? numberValue
    : null;
}

function toDecimalNumber(
  value: unknown
): number | null {
  const numberValue =
    safeNumber(value);

  if (
    numberValue === null
  ) {
    return null;
  }

  return (
    Math.round(
      numberValue * 100
    ) / 100
  );
}

function cleanRequiredString(
  value: unknown
): string {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value.trim();
}

function cleanOptionalString(
  value: unknown
): string | null {
  const cleaned =
    cleanRequiredString(
      value
    );

  return cleaned || null;
}

function extractArtistName(
  artist: unknown
): string {
  if (
    typeof artist ===
    "string"
  ) {
    return artist.trim();
  }

  if (
    artist &&
    typeof artist ===
      "object" &&
    "name" in artist &&
    typeof artist.name ===
      "string"
  ) {
    return artist.name.trim();
  }

  return "";
}

function parseReleaseDate(
  value: unknown
): Date | null {
  if (!value) {
    return null;
  }

  const parsed =
    new Date(
      String(value)
    );

  return Number.isNaN(
    parsed.getTime()
  )
    ? null
    : parsed;
}

function normaliseMusicType(
  value: unknown
) {
  const musicType =
    cleanRequiredString(
      value
    ).toLowerCase();

  const allowedTypes =
    new Set([
      "album",
      "ep",
      "mixtape",
      "single",
      "compilation",
    ]);

  return allowedTypes.has(
    musicType
  )
    ? musicType
    : null;
}

function normaliseItemType(
  value: unknown
) {
  const itemType =
    cleanRequiredString(
      value
    ).toUpperCase();

  if (
    itemType !==
      "DIGITAL" &&
    itemType !==
      "PHYSICAL"
  ) {
    return null;
  }

  return itemType;
}

function getTrackUrls(
  track: any
) {
  const hasSeparateAudioField =
    Object.prototype.hasOwnProperty.call(
      track,
      "audioUrl"
    );

  const audioUrl =
    hasSeparateAudioField
      ? cleanOptionalString(
          track.audioUrl
        )
      : cleanOptionalString(
          track.fileUrl
        );

  const fileUrl =
    hasSeparateAudioField
      ? cleanOptionalString(
          track.fileUrl
        )
      : null;

  return {
    audioUrl,
    fileUrl,
  };
}

function normaliseTracks(
  tracks: unknown,
  artistId: string
) {
  if (
    !Array.isArray(
      tracks
    )
  ) {
    return [];
  }

  return tracks
    .filter(
      (track: any) =>
        track &&
        (
          track.title ||
          track.audioUrl ||
          track.fileUrl
        )
    )
    .map(
      (
        track: any,
        index: number
      ) => {
        const {
          audioUrl,
          fileUrl,
        } =
          getTrackUrls(
            track
          );

        const duration =
          safeNumber(
            track.duration
          );

        const trackNo =
          safeNumber(
            track.trackNo
          );

        const price =
          toDecimalNumber(
            track.price
          );

        return {
          id:
            typeof track.id ===
              "string" &&
            track.id.trim()
              ? track.id.trim()
              : null,

          data: {
            title:
              cleanRequiredString(
                track.title
              ) ||
              `Track ${
                index + 1
              }`,

            audioUrl,
            fileUrl,

            isrc:
              cleanOptionalString(
                track.isrc
              ),

            trackNo:
              trackNo !== null
                ? Math.max(
                    1,
                    Math.round(
                      trackNo
                    )
                  )
                : index + 1,

            duration:
              duration !== null
                ? Math.max(
                    0,
                    Math.round(
                      duration
                    )
                  )
                : null,

            price:
              price !== null &&
              price >= 0
                ? price
                : null,

            sellIndividually:
              Boolean(
                track.sellIndividually
              ),

            artist: {
              connect: {
                id:
                  artistId,
              },
            },
          },
        };
      }
    );
}

function hasInvalidTrackUrl(
  tracks: unknown
) {
  if (
    !Array.isArray(
      tracks
    )
  ) {
    return false;
  }

  return tracks.some(
    (track) => {
      const {
        audioUrl,
        fileUrl,
      } =
        getTrackUrls(
          track
        );

      return (
        isConsoleUrl(
          audioUrl
        ) ||
        isConsoleUrl(
          fileUrl
        )
      );
    }
  );
}

function validateProductInput(
  body: any
) {
  const title =
    cleanRequiredString(
      body.title
    );

  const artistName =
    extractArtistName(
      body.artist
    );

  const price =
    toDecimalNumber(
      body.price
    );

  const coverUrl =
    cleanRequiredString(
      body.coverUrl
    );

  const itemType =
    normaliseItemType(
      body.type
    );

  const musicType =
    normaliseMusicType(
      body.musicType ||
        "mixtape"
    );

  if (
    !title ||
    !artistName ||
    price === null ||
    price < 0 ||
    !coverUrl ||
    !itemType
  ) {
    return {
      valid:
        false as const,

      error:
        "Title, artist, valid price, cover image and product type are required.",
    };
  }

  if (!musicType) {
    return {
      valid:
        false as const,

      error:
        "Select a valid music release type.",
    };
  }

  if (
    isConsoleUrl(
      coverUrl
    )
  ) {
    return {
      valid:
        false as const,

      error:
        "Use a public Cloudinary delivery URL for the cover image, not a Cloudinary console URL.",
    };
  }

  if (
    hasInvalidTrackUrl(
      body.tracks
    )
  ) {
    return {
      valid:
        false as const,

      error:
        "One or more tracks use a Cloudinary console URL instead of a public delivery URL.",
    };
  }

  const stockValue =
    safeNumber(
      body.stock
    );

  const stock =
    itemType ===
    "PHYSICAL"
      ? Math.max(
          0,
          Math.round(
            stockValue ?? 0
          )
        )
      : null;

  return {
    valid:
      true as const,

    data: {
      title,
      artistName,
      price,
      coverUrl,
      itemType,
      musicType,
      stock,

      description:
        cleanOptionalString(
          body.description
        ),

      genre:
        cleanOptionalString(
          body.genre
        ),

      upc:
        cleanOptionalString(
          body.upc
        ),

      tuneCode:
        cleanOptionalString(
          body.tuneCode
        ),

      catalogNo:
        cleanOptionalString(
          body.catalogNo
        ),

      releaseDate:
        parseReleaseDate(
          body.releaseDate
        ),

      albumZipUrl:
        cleanOptionalString(
          body.albumZipUrl
        ),

      tracks:
        body.tracks,
    },
  };
}

const releaseInclude = {
  artist: true,

  songs: {
    orderBy: {
      trackNo:
        "asc" as const,
    },
  },
};

export async function GET() {
  const authorization =
    await authorizeAdminApi();

  if (
    !authorization.authorized
  ) {
    return authorization.response;
  }

  try {
    const products =
      await prisma.musicProduct.findMany({
        include: {
          release: {
            include:
              releaseInclude,
          },
        },

        orderBy: {
          createdAt:
            "desc",
        },
      });

    return jsonResponse(
      products
    );
  } catch (error) {
    console.error(
      "GET /api/admin/music-products error:",
      error
    );

    return jsonResponse(
      {
        error:
          "Failed to fetch music products",
      },
      500
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

    const validation =
      validateProductInput(
        body
      );

    if (
      !validation.valid
    ) {
      return jsonResponse(
        {
          error:
            validation.error,
        },
        400
      );
    }

    const {
      title,
      artistName,
      price,
      coverUrl,
      itemType,
      musicType,
      stock,
      description,
      genre,
      upc,
      tuneCode,
      catalogNo,
      releaseDate,
      albumZipUrl,
      tracks,
    } = validation.data;

    const product =
      await prisma.$transaction(
        async (
          transaction
        ) => {
          const artistRecord =
            await transaction.artist.upsert({
              where: {
                name:
                  artistName,
              },

              update: {},

              create: {
                name:
                  artistName,
              },
            });

          const preparedTracks =
            normaliseTracks(
              tracks,
              artistRecord.id
            );

          const release =
            await transaction.release.create({
              data: {
                title,

                type:
                  musicType as any,

                coverUrl,
                description,
                genre,
                upc,
                tuneCode,
                catalogNo,
                releaseDate,

                artistId:
                  artistRecord.id,

                songs: {
                  create:
                    preparedTracks.map(
                      (
                        track
                      ) =>
                        track.data
                    ),
                },
              },
            });

          return transaction.musicProduct.create({
            data: {
              releaseId:
                release.id,

              price,

              itemType,

              stock,

              fileUrl:
                albumZipUrl,
            },

            include: {
              release: {
                include:
                  releaseInclude,
              },
            },
          });
        }
      );

    return jsonResponse(
      product,
      201
    );
  } catch (error) {
    console.error(
      "POST /api/admin/music-products error:",
      error
    );

    return jsonResponse(
      {
        error:
          "Failed to create music product",
      },
      500
    );
  }
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
    const body =
      await req.json();

    const id =
      cleanRequiredString(
        body.id
      );

    if (!id) {
      return jsonResponse(
        {
          error:
            "Missing product id",
        },
        400
      );
    }

    const validation =
      validateProductInput(
        body
      );

    if (
      !validation.valid
    ) {
      return jsonResponse(
        {
          error:
            validation.error,
        },
        400
      );
    }

    const {
      title,
      artistName,
      price,
      coverUrl,
      itemType,
      musicType,
      stock,
      description,
      genre,
      upc,
      tuneCode,
      catalogNo,
      releaseDate,
      albumZipUrl,
      tracks,
    } = validation.data;

    const existingProduct =
      await prisma.musicProduct.findUnique({
        where: {
          id,
        },

        include: {
          release: {
            include: {
              songs:
                true,
            },
          },
        },
      });

    if (
      !existingProduct
    ) {
      return jsonResponse(
        {
          error:
            "Product not found",
        },
        404
      );
    }

    const product =
      await prisma.$transaction(
        async (
          transaction
        ) => {
          const artistRecord =
            await transaction.artist.upsert({
              where: {
                name:
                  artistName,
              },

              update: {},

              create: {
                name:
                  artistName,
              },
            });

          const preparedTracks =
            normaliseTracks(
              tracks,
              artistRecord.id
            );

          const existingSongIds =
            new Set(
              existingProduct.release.songs.map(
                (
                  song
                ) =>
                  song.id
              )
            );

          const retainedSongIds =
            new Set(
              preparedTracks
                .map(
                  (
                    track
                  ) =>
                    track.id
                )
                .filter(
                  (
                    trackId
                  ): trackId is string =>
                    Boolean(
                      trackId
                    ) &&
                    existingSongIds.has(
                      trackId as string
                    )
                )
            );

          const removedSongIds =
            existingProduct.release.songs
              .map(
                (
                  song
                ) =>
                  song.id
              )
              .filter(
                (
                  songId
                ) =>
                  !retainedSongIds.has(
                    songId
                  )
              );

          if (
            removedSongIds.length >
            0
          ) {
            await transaction.song.deleteMany({
              where: {
                id: {
                  in:
                    removedSongIds,
                },
              },
            });
          }

          await transaction.release.update({
            where: {
              id:
                existingProduct.releaseId,
            },

            data: {
              title,

              type:
                musicType as any,

              coverUrl,
              description,
              genre,
              upc,
              tuneCode,
              catalogNo,
              releaseDate,

              artistId:
                artistRecord.id,
            },
          });

          for (
            const track of
            preparedTracks
          ) {
            if (
              track.id &&
              existingSongIds.has(
                track.id
              )
            ) {
              await transaction.song.update({
                where: {
                  id:
                    track.id,
                },

                data:
                  track.data,
              });
            } else {
              await transaction.song.create({
                data: {
                  ...track.data,

                  release: {
                    connect: {
                      id:
                        existingProduct.releaseId,
                    },
                  },
                },
              });
            }
          }

          return transaction.musicProduct.update({
            where: {
              id,
            },

            data: {
              price,
              itemType,
              stock,

              fileUrl:
                albumZipUrl,
            },

            include: {
              release: {
                include:
                  releaseInclude,
              },
            },
          });
        }
      );

    return jsonResponse(
      product
    );
  } catch (error) {
    console.error(
      "PUT /api/admin/music-products error:",
      error
    );

    return jsonResponse(
      {
        error:
          "Failed to update music product",
      },
      500
    );
  }
}

export async function PATCH(
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

    const id =
      cleanRequiredString(
        body.id
      );

    if (!id) {
      return jsonResponse(
        {
          error:
            "Missing product id",
        },
        400
      );
    }

    const existingProduct =
      await prisma.musicProduct.findUnique({
        where: {
          id,
        },

        include: {
          release:
            true,
        },
      });

    if (
      !existingProduct
    ) {
      return jsonResponse(
        {
          error:
            "Product not found",
        },
        404
      );
    }

    const wantsFeatured =
      Boolean(
        body.featured
      );

    const releaseType =
      String(
        existingProduct.release
          .type || ""
      ).toLowerCase();

    if (
      wantsFeatured &&
      releaseType ===
        "single"
    ) {
      return jsonResponse(
        {
          error:
            "Singles cannot be used as the featured project release.",
        },
        400
      );
    }

    const updatedProduct =
      await prisma.$transaction(
        async (
          transaction
        ) => {
          if (
            wantsFeatured
          ) {
            await transaction.release.updateMany({
              where: {
                featured:
                  true,
              },

              data: {
                featured:
                  false,
              },
            });
          }

          await transaction.release.update({
            where: {
              id:
                existingProduct.releaseId,
            },

            data: {
              featured:
                wantsFeatured,
            },
          });

          return transaction.musicProduct.findUnique({
            where: {
              id,
            },

            include: {
              release: {
                include:
                  releaseInclude,
              },
            },
          });
        }
      );

    return jsonResponse(
      updatedProduct
    );
  } catch (error) {
    console.error(
      "PATCH /api/admin/music-products error:",
      error
    );

    return jsonResponse(
      {
        error:
          "Failed to update featured release",
      },
      500
    );
  }
}

export async function DELETE(
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
      searchParams,
    } =
      new URL(req.url);

    const id =
      cleanRequiredString(
        searchParams.get(
          "id"
        )
      );

    if (!id) {
      return jsonResponse(
        {
          error:
            "Missing product id",
        },
        400
      );
    }

    const product =
      await prisma.musicProduct.findUnique({
        where: {
          id,
        },
      });

    if (!product) {
      return jsonResponse(
        {
          error:
            "Product not found",
        },
        404
      );
    }

    await prisma.$transaction(
      async (
        transaction
      ) => {
        await transaction.musicProduct.delete({
          where: {
            id,
          },
        });

        const remainingProducts =
          await transaction.musicProduct.count({
            where: {
              releaseId:
                product.releaseId,
            },
          });

        if (
          remainingProducts ===
          0
        ) {
          await transaction.song.deleteMany({
            where: {
              releaseId:
                product.releaseId,
            },
          });

          await transaction.release.delete({
            where: {
              id:
                product.releaseId,
            },
          });
        }
      }
    );

    return jsonResponse({
      success: true,
    });
  } catch (error) {
    console.error(
      "DELETE /api/admin/music-products error:",
      error
    );

    return jsonResponse(
      {
        error:
          "Failed to delete music product",
      },
      500
    );
  }
}