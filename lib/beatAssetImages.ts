export type BeatAssetFolder = "backgrounds" | "logos";
export type BeatAssetImage = { id: string; publicId: string; name: string; url: string; thumbnail: string };
export type BeatAssetPage = { images: BeatAssetImage[]; nextCursor: string | null; folderPath: string };

export function beatAssetThumbnail(url: string) {
  // Select the untouched source URL; only thumbnails use a smaller delivery size.
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:" && parsed.hostname === "res.cloudinary.com") {
      return url.replace("/image/upload/", "/image/upload/c_limit,w_240,h_160/f_auto,q_auto/");
    }
  } catch { /* Leave existing non-Cloudinary image links intact. */ }
  return url;
}
