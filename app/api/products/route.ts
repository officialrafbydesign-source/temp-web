import { NextResponse } from "next/server";
import * as prismaModule from "@/lib/prisma";

// Handles whether lib/prisma exports 'prisma' or 'db' as a named or default export
const db = (prismaModule as any).db || (prismaModule as any).prisma || (prismaModule as any).default;

function cleanCloudinaryUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  // Intercept and rewrite Cloudinary dashboard links
  if (url.includes("res-console.cloudinary.com")) {
    const segments = url.split("/");
    const cloudName = segments[3]; // Extract 'dcrkpsnn9'

    // Grab the actual asset identifier before /drilldown
    const drilldownIndex = segments.indexOf("drilldown");
    const assetIdentifier = drilldownIndex > 1 ? segments[drilldownIndex - 1] : "";

    if (cloudName) {
      return `https://res.cloudinary.com/${cloudName}/image/upload/${assetIdentifier}`;
    }
  }

  return url.trim();
}

// ========================================================
// GET HANDLER (Fetches all products for Home & Clothing pages)
// ========================================================
export async function GET() {
  try {
    const products = await db.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    // Sanitize image links on the fly before returning to frontend
    const cleanedProducts = products.map((product: any) => ({
      ...product,
      imageUrl: cleanCloudinaryUrl(product.imageUrl),
    }));

    return NextResponse.json(cleanedProducts);
  } catch (error) {
    console.error("[PRODUCTS_GET]", error);
    return NextResponse.json([], { status: 500 });
  }
}

// ========================================================
// POST HANDLER (Admin creation)
// ========================================================
export async function POST(req: Request) {
  try {
    const data = await req.formData();

    const name = data.get("name")?.toString().trim();
    const price = data.get("price") ? parseFloat(data.get("price")!.toString()) : 0;

    // Target the single imageUrl string property
    const rawImageUrl = data.get("imageUrl")?.toString() || "";
    const imageUrl = cleanCloudinaryUrl(rawImageUrl);

    if (!name || !price) {
      return new NextResponse("Missing required product fields", { status: 400 });
    }

    const product = await db.product.create({
      data: {
        name,
        price,
        imageUrl, // Saves the clean, safe delivery link
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("[ADMIN_PRODUCTS_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}