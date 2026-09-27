import {
  NextResponse,
  NextRequest,
} from "next/server";
import { prisma as db } from "@/lib/prisma";

// ========================================================
// CONFIGURATION: Cloudflare R2 Public Endpoint
// ========================================================
const R2_BASE_URL =
  "https://pub-xxxxxx.r2.dev"; // ← REPLACE WITH YOUR ACTUAL CLOUDFLARE R2 SUBDOMAIN

function generateR2AudioUrl(
  title: string
): string {
  return `${R2_BASE_URL}/${encodeURIComponent(
    title.trim()
  )}.mp3`;
}

// Utility to clean up messy Cloudinary image URLs
function cleanCloudinaryUrl(
  url: string | null | undefined
): string | null {
  if (!url) return null;

  if (
    url.includes(
      "res-console.cloudinary.com"
    )
  ) {
    const segments = url.split("/");
    const cloudName = segments[3];
    const drilldownIndex =
      segments.indexOf("drilldown");

    const assetIdentifier =
      drilldownIndex > 1
        ? segments[
            drilldownIndex - 1
          ]
        : "";

    if (cloudName) {
      return `https://res.cloudinary.com/${cloudName}/image/upload/${assetIdentifier}`;
    }
  }

  return url.trim();
}

// ========================================================
// ✅ GET: Fetches beats optimized for client store matching
// ========================================================
export async function GET(
  req: NextRequest
) {
  try {
    const { searchParams } =
      new URL(req.url);

    // Check if the frontend requested all tracks at once or a paginated subset
    const page = searchParams.get("page")
      ? parseInt(
          searchParams.get("page") ||
            "1",
          10
        )
      : null;

    const limit = searchParams.get(
      "limit"
    )
      ? parseInt(
          searchParams.get("limit") ||
            "12",
          10
        )
      : null;

    let beats;

    if (page && limit) {
      const skip =
        (page - 1) * limit;

      beats =
        await db.beat.findMany({
          where: {
            isAvailable: true,
          },
          skip,
          take: limit,
          include: {
            licenses: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });
    } else {
      // Fetch the full catalog if no explicit limits are provided
      beats =
        await db.beat.findMany({
          where: {
            isAvailable: true,
          },
          include: {
            licenses: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });
    }

    // Format fields inline so they map seamlessly to the client-side properties
    const formattedBeats =
      beats.map((beat) => {
        const baseLicense =
          beat.licenses.length > 0
            ? beat.licenses.reduce(
                (min, lic) =>
                  lic.price <
                  min.price
                    ? lic
                    : min,
                beat.licenses[0]
              )
            : null;

        const calculatedPrice =
          baseLicense
            ? baseLicense.price /
              100
            : 29.99;

        const publicAudioUrl =
          beat.audioUrl &&
          beat.audioUrl.trim() !==
            ""
            ? beat.audioUrl
            : generateR2AudioUrl(
                beat.title
              );

        return {
          id: beat.id,
          title: beat.title,
          genre:
            beat.genre ||
            "Instrumental",
          bpm: beat.bpm,
          key:
            beat.key ||
            "C Minor",

          artworkUrl:
            beat.artworkUrl ||
            "/images/mascotmonored.png",

          // Public tagged preview audio.
          audioUrl:
            publicAudioUrl,

          // Never expose the paid stems ZIP.
          // Promotional free downloads receive only the tagged MP3.
          fileUrl:
            beat.freeDownload
              ? publicAudioUrl
              : null,

          youtubeUrl:
            beat.youtubeUrl,

          tags: beat.tags,

          freeDownload:
            beat.freeDownload,

          price:
            calculatedPrice,
        };
      });

    // Directly returns the flat array expected by: Array.isArray(data)
    return NextResponse.json(
      formattedBeats
    );
  } catch (error) {
    console.error(
      "[BEATS_GET_ERROR]",
      error
    );

    return new NextResponse(
      "Internal Server Error",
      {
        status: 500,
      }
    );
  }
}

// ========================================================
// ✅ POST: Records new uploads securely into Supabase via Prisma
// ========================================================
export async function POST(
  req: Request
) {
  try {
    const body = await req.json();

    const title =
      body.title
        ?.toString()
        .trim();

    const genre =
      body.genre
        ?.toString()
        .trim() ||
      "Instrumental";

    const bpm = body.bpm
      ? parseInt(
          body.bpm.toString(),
          10
        )
      : null;

    const key =
      body.key
        ?.toString()
        .trim() ||
      "C Minor";

    const description =
      body.description
        ?.toString()
        .trim() || null;

    const youtubeUrl =
      body.youtubeUrl
        ?.toString()
        .trim() || null;

    const freeDownload =
      body.freeDownload === true;

    if (!title) {
      return new NextResponse(
        "Title field is required",
        {
          status: 400,
        }
      );
    }

    // Safely structure incoming tags
    let tags: string[] = [];

    if (
      Array.isArray(body.tags)
    ) {
      tags = body.tags
        .map((tag: any) =>
          tag
            .toString()
            .trim()
        )
        .filter(Boolean);
    } else if (body.tags) {
      tags = body.tags
        .split(",")
        .map((tag: string) =>
          tag.trim()
        )
        .filter(Boolean);
    }

    // Capture image assets using flexible field inputs from the admin form dashboard
    const rawArtworkUrl =
      body.artworkUrl ||
      body.imageUrl ||
      body.coverUrl ||
      "";

    const artworkUrl =
      cleanCloudinaryUrl(
        rawArtworkUrl
      ) ||
      "/images/mascotmonored.png";

    // Set explicit audio URL if provided, otherwise let it default dynamically to the R2 formula
    const audioUrl =
      body.audioUrl
        ?.toString()
        .trim() || null;

    const fileUrl =
      body.fileUrl
        ?.toString()
        .trim() || null;

    // Convert decimal numbers to cent values to match the DB Integer configuration
    const parsedPrice =
      body.price
        ? parseFloat(
            body.price.toString()
          )
        : 29.99;

    const priceInCents =
      Math.round(
        parsedPrice * 100
      );

    // Save transactional entity record into Supabase + initialize basic layout license
    const newBeat =
      await db.beat.create({
        data: {
          title,
          genre,
          bpm,
          key,
          description,
          artworkUrl,
          audioUrl,
          fileUrl,
          youtubeUrl,
          tags,
          freeDownload,

          licenses: {
            create: [
              {
                name:
                  "Standard Lease",
                price:
                  priceInCents,
              },
            ],
          },
        },
        include: {
          licenses: true,
        },
      });

    return NextResponse.json(
      newBeat
    );
  } catch (error) {
    console.error(
      "[ADMIN_BEATS_POST_ERROR]",
      error
    );

    return new NextResponse(
      "Internal Server Error",
      {
        status: 500,
      }
    );
  }
}