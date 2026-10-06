import {
  NextResponse,
} from "next/server";

import { uploadPrivateReference } from "@/lib/privateReference";

import {
  prisma,
} from "@/lib/prisma";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_REFERENCE_FILE_SIZE =
  3 * 1024 * 1024;

const ALLOWED_AUDIO_EXTENSIONS =
  /\.(mp3|wav|flac|m4a|aac|ogg)$/i;

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
} as const;

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

function clean(
  value: unknown
): string {
  return String(
    value ?? ""
  ).trim();
}

function optional(
  value: unknown
): string | null {
  const result =
    clean(value);

  return (
    !result ||
    result === "N/A" ||
    result === "None"
  )
    ? null
    : result;
}

function parseDate(
  value: unknown
): Date | null {
  const raw =
    clean(value);

  if (
    !raw ||
    raw === "N/A" ||
    raw ===
      "Confirmed via Email"
  ) {
    return null;
  }

  const dateOnly =
    raw.match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );

  if (dateOnly) {
    const parsed =
      new Date(
        Date.UTC(
          Number(
            dateOnly[1]
          ),
          Number(
            dateOnly[2]
          ) - 1,
          Number(
            dateOnly[3]
          )
        )
      );

    return Number.isNaN(
      parsed.getTime()
    )
      ? null
      : parsed;
  }

  const parsed =
    new Date(raw);

  return Number.isNaN(
    parsed.getTime()
  )
    ? null
    : parsed;
}

function stringArray(
  value: unknown
) {
  if (
    Array.isArray(value)
  ) {
    return value
      .map((item) =>
        clean(item)
      )
      .filter(Boolean);
  }

  return clean(value)
    .split(",")
    .map((item) =>
      item.trim()
    )
    .filter(Boolean);
}

function isAllowedAudioFile(
  file: File
) {
  return (
    file.type.startsWith(
      "audio/"
    ) ||
    ALLOWED_AUDIO_EXTENSIONS.test(
      file.name
    )
  );
}

async function uploadToCloudinary(
  file: File
): Promise<string> {
  if (
    !isAllowedAudioFile(
      file
    )
  ) {
    throw new Error(
      "INVALID_REFERENCE_FILE"
    );
  }

  return uploadPrivateReference(file, "raf-by-design/music-booking-references", MAX_REFERENCE_FILE_SIZE);
}

async function readPayload(
  request: Request
) {
  if (Number(request.headers.get("content-length") || 0) > 4 * 1024 * 1024) {
    throw new Error("REFERENCE_FILE_TOO_LARGE");
  }
  const contentType =
    request.headers.get(
      "content-type"
    ) || "";

  if (
    contentType.includes(
      "multipart/form-data"
    )
  ) {
    const formData =
      await request.formData();

    const payload: Record<
      string,
      unknown
    > = {};

    formData.forEach(
      (
        value,
        key
      ) => {
        if (
          !(
            value instanceof
            File
          ) &&
          key !==
            "referenceFileName" &&
          key !==
            "referenceFileUrl"
        ) {
          payload[key] =
            value;
        }
      }
    );

    const referenceFile =
      formData.get(
        "referenceFile"
      );

    if (
      referenceFile instanceof
        File &&
      referenceFile.size > 0
    ) {
      payload.referenceFile = referenceFile;
    }

    return payload;
  }

  const payload =
    await request.json();

  if (
    !payload ||
    typeof payload !==
      "object" ||
    Array.isArray(payload)
  ) {
    return {};
  }

  // Only the server's upload response can supply a stored file URL.
  const {
    referenceFileName: _ignoredName,
    referenceFileUrl: _ignoredUrl,
    ...fields
  } = payload;

  return fields;
}

async function getOrCreateMusicService(
  serviceName: string
) {
  const existing =
    await prisma.musicService.findFirst({
      where: {
        name: {
          equals:
            serviceName,

          mode:
            "insensitive",
        },
      },
    });

  if (existing) {
    return existing;
  }

  return prisma.musicService.create({
    data: {
      name:
        serviceName,

      description:
        "Created automatically from a music service enquiry.",

      price: 0,
    },
  });
}

async function getOrCreateBookingUser(
  name: string,
  email: string
) {
  const existingUser =
    await prisma.user.findFirst({
      where: {
        email: {
          equals:
            email,

          mode:
            "insensitive",
        },
      },

      select:
        safeUserSelect,
    });

  if (existingUser) {
    // Never overwrite an existing customer's name
    // from a public booking form.
    return existingUser;
  }

  return prisma.user.create({
    data: {
      name,
      email,
    },

    select:
      safeUserSelect,
  });
}

export async function POST(
  request: Request
) {
  try {
    const body =
      await readPayload(
        request
      );

    const name =
      clean(
        body.name
      );

    const email =
      clean(
        body.email
      ).toLowerCase();

    const serviceType =
      clean(
        body.serviceType
      );

    const projectDescription =
      clean(
        body.projectDescription ??
          body.projectDetails
      );

    if (
      !name ||
      !email ||
      !serviceType ||
      !projectDescription
    ) {
      return jsonResponse(
        {
          error:
            "Name, email, service type and project description are required.",
        },
        400
      );
    }

    if (
      !EMAIL_PATTERN.test(
        email
      )
    ) {
      return jsonResponse(
        {
          error:
            "Enter a valid email address.",
        },
        400
      );
    }

    if (
      name.length > 100
    ) {
      return jsonResponse(
        {
          error:
            "Name is too long.",
        },
        400
      );
    }

    if (
      serviceType.length >
      150
    ) {
      return jsonResponse(
        {
          error:
            "Service type is too long.",
        },
        400
      );
    }

    if (
      projectDescription.length >
      10000
    ) {
      return jsonResponse(
        {
          error:
            "Project description is too long.",
        },
        400
      );
    }

    if (body.referenceFile instanceof File) {
      body.referenceFileName = body.referenceFile.name.slice(0, 255);
      body.referenceFileUrl = await uploadToCloudinary(body.referenceFile);
    }

    const recordingDate =
      parseDate(
        body.recordingDate
      );

    const studioSessionDate =
      parseDate(
        body.studioSessionDate
      );

    const deadlineDate =
      parseDate(
        body.deadlineDate ??
          body.deadline
      );

    const primaryDate =
      recordingDate ||
      studioSessionDate ||
      deadlineDate ||
      null;

    const [
      user,
      service,
    ] =
      await Promise.all([
        getOrCreateBookingUser(
          name,
          email
        ),

        getOrCreateMusicService(
          serviceType
        ),
      ]);

    const booking =
      await prisma.booking.create({
        data: {
          userId:
            user.id,

          serviceId:
            service.id,

          date:
            primaryDate,

          status:
            "pending",

          companyBrand:
            optional(
              body.companyBrand
            ),

          projectType:
            optional(
              body.projectType
            ),

          musicTypes:
            stringArray(
              body.musicTypes
            ),

          referenceLinks:
            optional(
              body.referenceLinks
            ),

          referenceFileName:
            optional(
              body.referenceFileName
            ),

          referenceFileUrl:
            optional(
              body.referenceFileUrl
            ),

          deadlineText:
            optional(
              body.deadlineDate ??
                body.deadline
            ),

          recordingHours:
            optional(
              body.recordingHours
            ),

          recordingDate,

          editOptions:
            optional(
              body.editOptions
            ),

          editDetails:
            optional(
              body.editDetails
            ),

          inStudioSession:
            optional(
              body.inStudioSession
            ),

          studioSessionDate,

          otherAudioService:
            optional(
              body.otherAudioService
            ),

          projectDescription,
        },

        select: {
          id: true,
        },
      });

    return jsonResponse(
      {
        success: true,

        message:
          "Booking request received successfully.",

        bookingId: booking.id,
      },
      201
    );
  } catch (error) {
    console.error(
      "POST /api/bookings error:",
      error
    );

    if (
      error instanceof
        Error &&
      error.message ===
        "REFERENCE_FILE_TOO_LARGE"
    ) {
      return jsonResponse(
        {
          error:
            "Reference audio file must be 3 MB or smaller. For a larger file, use the reference link field.",
        },
        400
      );
    }

    if (
      error instanceof
        Error &&
      error.message ===
        "INVALID_REFERENCE_FILE"
    ) {
      return jsonResponse(
        {
          error:
            "Reference file must be an MP3, WAV, FLAC, M4A, AAC or OGG audio file.",
        },
        400
      );
    }

    return jsonResponse(
      {
        error:
          "The booking request could not be submitted.",
      },
      500
    );
  }
}
