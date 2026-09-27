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

type DesignServiceResponse = {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
};

function cleanRequiredText(
  value: unknown
) {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value.trim();
}

function cleanOptionalText(
  value: unknown
) {
  const cleaned =
    cleanRequiredText(
      value
    );

  return cleaned || null;
}

function parsePriceInPence(
  value: unknown
) {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const priceInPounds =
    Number(value);

  if (
    !Number.isFinite(
      priceInPounds
    ) ||
    priceInPounds < 0
  ) {
    return null;
  }

  return Math.round(
    priceInPounds * 100
  );
}

function containsCloudinaryConsoleUrl(
  value: string | null
) {
  return Boolean(
    value?.includes(
      "res-console.cloudinary.com"
    )
  );
}

function formatService(
  service: {
    id: string;
    title: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    category: string;
    createdAt: Date;
    updatedAt: Date;
  }
): DesignServiceResponse {
  return {
    id: service.id,
    title: service.title,
    description:
      service.description ||
      "",
    price:
      service.price / 100,
    imageUrl:
      service.imageUrl || "",
    category:
      service.category,
    createdAt:
      service.createdAt,
    updatedAt:
      service.updatedAt,
  };
}

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

export async function GET() {
  const authorization =
    await authorizeAdminApi();

  if (
    !authorization.authorized
  ) {
    return authorization.response;
  }

  try {
    const services =
      await prisma.designService.findMany({
        orderBy: {
          createdAt:
            "desc",
        },
      });

    return jsonResponse({
      services:
        services.map(
          formatService
        ),
    });
  } catch (error) {
    console.error(
      "GET /api/admin/designservices error:",
      error
    );

    return jsonResponse(
      {
        error:
          "Failed to fetch design services",
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

    const id =
      cleanOptionalText(
        body.id
      );

    const title =
      cleanRequiredText(
        body.title
      );

    const description =
      cleanOptionalText(
        body.description
      );

    const imageUrl =
      cleanOptionalText(
        body.imageUrl
      );

    const category =
      cleanRequiredText(
        body.category
      ) || "Design";

    const price =
      parsePriceInPence(
        body.price
      );

    if (!title) {
      return jsonResponse(
        {
          error:
            "Service title is required.",
        },
        400
      );
    }

    if (
      title.length > 150
    ) {
      return jsonResponse(
        {
          error:
            "Service title is too long.",
        },
        400
      );
    }

    if (price === null) {
      return jsonResponse(
        {
          error:
            "Enter a valid service price.",
        },
        400
      );
    }

    if (
      containsCloudinaryConsoleUrl(
        imageUrl
      )
    ) {
      return jsonResponse(
        {
          error:
            "Use a public Cloudinary delivery URL, not a Cloudinary console URL.",
        },
        400
      );
    }

    if (id) {
      const existingService =
        await prisma.designService.findUnique({
          where: {
            id,
          },

          select: {
            id: true,
          },
        });

      if (
        !existingService
      ) {
        return jsonResponse(
          {
            error:
              "Design service not found.",
          },
          404
        );
      }

      const updatedService =
        await prisma.designService.update({
          where: {
            id,
          },

          data: {
            title,
            description,
            price,
            imageUrl,
            category,
          },
        });

      return jsonResponse({
        service:
          formatService(
            updatedService
          ),
      });
    }

    const newService =
      await prisma.designService.create({
        data: {
          title,
          description,
          price,
          imageUrl,
          category,
        },
      });

    return jsonResponse(
      {
        service:
          formatService(
            newService
          ),
      },
      201
    );
  } catch (error) {
    console.error(
      "POST /api/admin/designservices error:",
      error
    );

    return jsonResponse(
      {
        error:
          "Failed to save design service",
      },
      500
    );
  }
}