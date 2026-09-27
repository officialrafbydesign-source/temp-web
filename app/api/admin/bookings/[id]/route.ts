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

type BookingRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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

function isRecordNotFoundError(
  error: unknown
) {
  return (
    error !== null &&
    typeof error ===
      "object" &&
    "code" in error &&
    error.code ===
      "P2025"
  );
}

export async function PATCH(
  req: Request,
  {
    params,
  }: BookingRouteContext
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
      id,
    } =
      await params;

    const body =
      await req.json();

    const status =
      typeof body.status ===
        "string"
        ? body.status.trim()
        : "";

    if (
      !id ||
      !status ||
      status.length > 50
    ) {
      return jsonResponse(
        {
          error:
            "A valid booking status is required",
        },
        400
      );
    }

    const updatedBooking =
      await prisma.booking.update({
        where: {
          id,
        },

        data: {
          status,
        },
      });

    return jsonResponse(
      updatedBooking
    );
  } catch (error) {
    console.error(
      "PATCH /api/admin/bookings/[id] error:",
      error
    );

    if (
      isRecordNotFoundError(
        error
      )
    ) {
      return jsonResponse(
        {
          error:
            "Booking not found",
        },
        404
      );
    }

    return jsonResponse(
      {
        error:
          "Failed to update booking",
      },
      500
    );
  }
}

export async function DELETE(
  _req: Request,
  {
    params,
  }: BookingRouteContext
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
      id,
    } =
      await params;

    if (!id) {
      return jsonResponse(
        {
          error:
            "Booking ID is required",
        },
        400
      );
    }

    await prisma.booking.delete({
      where: {
        id,
      },
    });

    return jsonResponse({
      success: true,
    });
  } catch (error) {
    console.error(
      "DELETE /api/admin/bookings/[id] error:",
      error
    );

    if (
      isRecordNotFoundError(
        error
      )
    ) {
      return jsonResponse(
        {
          error:
            "Booking not found",
        },
        404
      );
    }

    return jsonResponse(
      {
        error:
          "Failed to delete booking",
      },
      500
    );
  }
}