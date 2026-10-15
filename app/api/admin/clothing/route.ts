import { catalogueAdminAction } from "@/lib/catalogueAdmin";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeAdminApi } from "@/lib/adminApi";
import { normaliseTags } from "@/lib/catalogueTags";

const ALLOWED_RANGES = new Set([
  "originals",
  "state-of-mind",
  "4-elements",
  "keepit100",
  "accessories-merch",
]);

function safeNumber(value: any): number | null {
  if (value === undefined || value === null || value === "") return null;

  const num = Number(value);

  return Number.isNaN(num) ? null : num;
}

function parseList(value: any): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  return value
    .toString()
    .split(",")
    .map((item: string) => item.trim())
    .filter(Boolean);
}

function containsConsoleUrl(values: any): boolean {
  if (!values) return false;

  const checkString = Array.isArray(values)
    ? values.join(" ")
    : values.toString();

  return checkString.includes("res-console.cloudinary.com");
}

function normaliseVariants(variants: any[]) {
  if (!Array.isArray(variants)) return [];

  return variants
    .filter((v) => v.size || v.color || v.stock)
    .map((v) => ({
      size: v.size || "",
      color: v.color || "",
      stock: safeNumber(v.stock) ?? 0,
      sku: v.sku || null,
    }));
}

function normaliseRange(value: any): string | null {
  if (!value) return null;

  const range = String(value).trim().toLowerCase();

  if (!ALLOWED_RANGES.has(range)) {
    return null;
  }

  return range;
}

export async function GET() {
  const authorization = await authorizeAdminApi();
  if (!authorization.authorized) return authorization.response;

  try {
    const products = await prisma.product.findMany({
        where: { deletedAt: null },
      include: {
        variants: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (err) {
    console.error("GET clothing error:", err);

    return NextResponse.json(
      { error: "Failed to fetch clothing data" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const authorization = await authorizeAdminApi();
  if (!authorization.authorized) return authorization.response;

  try {
    const {
      name,
      brand,
      range,
      category,
      description,
      price,
      salePrice,
      imageUrls,
      sku,
      tags,
      variants,
    } = await req.json();

    if (containsConsoleUrl(imageUrls)) {
      return NextResponse.json(
        {
          error:
            "Invalid Image Asset Array: Use public Cloudinary Delivery URLs (res.cloudinary.com), not Console preview links.",
        },
        { status: 400 }
      );
    }

    const parsedPrice = safeNumber(price);

    if (!name || parsedPrice === null) {
      return NextResponse.json(
        {
          error: "Missing required fields: name, price",
        },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        brand: brand || null,
        range: normaliseRange(range),
        category: category || null,
        description: description || null,
        price: parsedPrice,
        salePrice: safeNumber(salePrice),
        imageUrls: parseList(imageUrls),
        sku: sku || null,
        tags: parseList(tags),

        variants: {
          create: normaliseVariants(variants),
        },
      },

      include: {
        variants: true,
      },
    });

    return NextResponse.json(product);
  } catch (err) {
    console.error("POST clothing error:", err);

    return NextResponse.json(
      { error: "Failed to create clothing item" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const authorization = await authorizeAdminApi();
  if (!authorization.authorized) return authorization.response;

  try {
    const {
      id,
      name,
      brand,
      range,
      category,
      description,
      price,
      salePrice,
      imageUrls,
      sku,
      tags,
      variants,
    } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Missing clothing item id" },
        { status: 400 }
      );
    }

    if (containsConsoleUrl(imageUrls)) {
      return NextResponse.json(
        {
          error:
            "Invalid Image Asset Array: Use public Cloudinary Delivery URLs (res.cloudinary.com), not Console preview links.",
        },
        { status: 400 }
      );
    }

    const parsedPrice = safeNumber(price);

    if (!name || parsedPrice === null) {
      return NextResponse.json(
        {
          error: "Missing required fields: name, price",
        },
        { status: 400 }
      );
    }

    const updatedProduct = await prisma.$transaction(async (tx) => {
      await tx.productVariant.deleteMany({
        where: {
          productId: id,
        },
      });

      return tx.product.update({
        where: {
          id,
        },

        data: {
          name,
          brand: brand || null,
          range: normaliseRange(range),
          category: category || null,
          description: description || null,
          price: parsedPrice,
          salePrice: safeNumber(salePrice),
          imageUrls: parseList(imageUrls),
          sku: sku || null,
          tags: parseList(tags),

          variants: {
            create: normaliseVariants(variants),
          },
        },

        include: {
          variants: true,
        },
      });
    });

    return NextResponse.json(updatedProduct);
  } catch (err) {
    console.error("PUT clothing error:", err);

    return NextResponse.json(
      { error: "Failed to update clothing item" },
      { status: 500 }
    );
  }
}

// Tag-only edits must preserve variant IDs, stock, prices and purchased references.
export async function PATCH(req: Request) {
  const authorization = await authorizeAdminApi();
  if (!authorization.authorized) return authorization.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid tag update" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid tag update" }, { status: 400 });
  }
  const { id, tags } = body as { id?: unknown; tags?: unknown };
  if (typeof id !== "string" || !id.trim() || !Array.isArray(tags) || tags.some((tag) => typeof tag !== "string")) {
    return NextResponse.json({ error: "Provide a clothing item ID and a list of tags." }, { status: 400 });
  }

  try {
    const cleanedTags = normaliseTags(tags);
    const result = await prisma.product.updateMany({
      where: { id, deletedAt: null },
      data: { tags: cleanedTags },
    });
    if (!result.count) {
      return NextResponse.json({ error: "Clothing item not found" }, { status: 404 });
    }
    return NextResponse.json({ id, tags: cleanedTags });
  } catch (error) {
    console.error("PATCH clothing tags error:", error);
    return NextResponse.json({ error: "Unable to save clothing tags" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  return catalogueAdminAction(req, "clothing", new URL(req.url).searchParams.get("id") || "");
}
