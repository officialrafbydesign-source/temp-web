import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Set your dedicated Cloudinary folder name here
    // Replace 'design/gallery' with whatever your folder path is in Cloudinary (e.g., 'gallery_assets' or 'website/gallery')
    const GALLERY_ROOT_FOLDER = "design/gallery";

    // 1. Search STRICTLY inside the dedicated gallery folder and its sub-folders
    const results = await cloudinary.search
      .expression(`folder:${GALLERY_ROOT_FOLDER}/* AND resource_type:image`)
      .sort_by("created_at", "desc")
      .max_results(500) // Increase cap so large galleries aren't truncated
      .execute();

    // 2. Map only the validated gallery assets
    const images = results.resources.map((resource: any) => {
      // Extract sub-folder name relative to your gallery root
      // e.g. "design/gallery/logos/my-logo" -> sub-folder is "logos"
      const folderParts = resource.folder ? resource.folder.split("/") : [];
      const subFolder = folderParts.length > 2 ? folderParts[folderParts.length - 1] : "general";

      return {
        publicId: resource.public_id,
        url: resource.secure_url,
        format: resource.format,
        width: resource.width,
        height: resource.height,
        createdAt: resource.created_at,
        category: subFolder,
      };
    });

    return NextResponse.json({ images });
  } catch (error: any) {
    console.error("Cloudinary Dedicated Gallery Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dedicated gallery images" },
      { status: 500 }
    );
  }
}