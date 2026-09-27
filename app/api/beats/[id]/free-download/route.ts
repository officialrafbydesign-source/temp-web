import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  prisma,
} from "@/lib/prisma";

import {
  getPresignedDownloadUrl,
} from "@/lib/r2";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

const MAX_FREE_DOWNLOADS =
  3;

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FreeDownloadContext = {
  params: Promise<{
    id: string;
  }>;
};

function getClientIp(
  req: NextRequest
) {
  const forwardedFor =
    req.headers.get(
      "x-forwarded-for"
    );

  return (
    forwardedFor
      ?.split(",")[0]
      ?.trim() ||
    req.headers.get(
      "x-real-ip"
    ) ||
    null
  );
}

function getSafeRemoteUrl(
  value: string
) {
  try {
    const url =
      new URL(value);

    if (
      url.protocol !==
      "https:" &&
      url.protocol !==
      "http:"
    ) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

function getSafeObjectKey(
  value: string
) {
  const cleaned =
    value
      .trim()
      .replace(
        /^\/+/,
        ""
      );

  if (
    !cleaned ||
    cleaned.includes(
      ".."
    ) ||
    cleaned.includes(
      "\\"
    )
  ) {
    return null;
  }

  return cleaned;
}

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

      headers: {
        "Cache-Control":
          "private, no-store",
      },
    }
  );
}

export async function POST(
  req: NextRequest,
  {
    params,
  }: FreeDownloadContext
) {
  try {
    const {
      id: beatId,
    } = await params;

    const body =
      await req.json();

    const email =
      typeof body?.email ===
      "string"
        ? body.email
            .trim()
            .toLowerCase()
        : "";

    if (
      !email ||
      !EMAIL_PATTERN.test(
        email
      )
    ) {
      return errorResponse(
        "A valid email address is required",
        400
      );
    }

    const beat =
      await prisma.beat.findUnique({
        where: {
          id: beatId,
        },

        select: {
          id: true,
          title: true,
          audioUrl: true,
          freeDownload:
            true,
          isAvailable:
            true,
        },
      });

    if (!beat) {
      return errorResponse(
        "Beat not found",
        404
      );
    }

    if (
      !beat.isAvailable
    ) {
      return errorResponse(
        "This beat is no longer available",
        410
      );
    }

    if (
      !beat.freeDownload
    ) {
      return errorResponse(
        "Free download is not available for this beat",
        403
      );
    }

    if (
      !beat.audioUrl
    ) {
      return errorResponse(
        "The tagged MP3 is not available",
        404
      );
    }

    const existingDownloads =
      await prisma.downloadLog.count({
        where: {
          beatId:
            beat.id,

          userEmail:
            email,

          type:
            "free",
        },
      });

    if (
      existingDownloads >=
      MAX_FREE_DOWNLOADS
    ) {
      return errorResponse(
        "Free download limit reached. Please purchase a licence to continue.",
        403
      );
    }

    let downloadUrl:
      | string
      | null = null;

    const remoteUrl =
      getSafeRemoteUrl(
        beat.audioUrl
      );

    if (remoteUrl) {
      downloadUrl =
        remoteUrl.toString();
    } else {
      const objectKey =
        getSafeObjectKey(
          beat.audioUrl
        );

      if (!objectKey) {
        return errorResponse(
          "The tagged MP3 location is invalid",
          500
        );
      }

      try {
        downloadUrl =
          await getPresignedDownloadUrl(
            objectKey,
            300
          );
      } catch (error) {
        console.error(
          "Free beat R2 signing error:",
          error
        );

        return errorResponse(
          "The download could not be prepared",
          500
        );
      }
    }

    await prisma.downloadLog.create({
      data: {
        beatId:
          beat.id,

        userEmail:
          email,

        ip:
          getClientIp(
            req
          ),

        type:
          "free",
      },
    });

    const response =
      NextResponse.redirect(
        downloadUrl,
        303
      );

    response.headers.set(
      "Cache-Control",
      "private, no-store"
    );

    return response;
  } catch (error) {
    console.error(
      "POST /api/beats/[id]/free-download error:",
      error
    );

    return errorResponse(
      "The free download could not be prepared",
      500
    );
  }
}