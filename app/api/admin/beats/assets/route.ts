import { NextResponse } from "next/server";
import { authorizeAdminApi } from "@/lib/adminApi";
import { beatAssetThumbnail, type BeatAssetPage } from "@/lib/beatAssetImages";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
const cache = new Map<string, { expires: number; data: BeatAssetPage }>();
const pending = new Map<string, Promise<BeatAssetPage>>();
class AssetError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}
type Resource = { asset_id?: string; public_id: string; display_name?: string; secure_url?: string; resource_type?: string; type?: string; access_mode?: string; access_control?: unknown[] };
type ResourcePage = { resources: Resource[]; next_cursor?: string };

export async function GET(request: Request) {
  const auth = await authorizeAdminApi();
  if (!auth.authorized) return auth.response;
  const params = new URL(request.url).searchParams;
  const folder = params.get("folder");
  if (folder !== "backgrounds" && folder !== "logos") return json({ error: "Choose Background Beats or Logos." }, 400);
  const cursor = params.get("cursor") || "";
  const mode = params.get("mode") || "folder";
  if (cursor.length > 2048 || !["folder", "prefix"].includes(mode)) return json({ error: "Invalid image page. Refresh the folder." }, 400);
  const folderPath = (folder === "backgrounds" ? process.env.CLOUDINARY_BEAT_BACKGROUNDS_FOLDER || "Background Beats" : process.env.CLOUDINARY_BEAT_LOGOS_FOLDER || "Logos").trim().replace(/^\/+|\/+$/g, "");
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!folderPath || !cloudName || !apiKey || !apiSecret) {
    return json({ error: "Quick image folders need the Cloudinary cloud name, server API key and API secret configured in Vercel. You can still use the full library or paste an image URL." }, 503);
  }
  const key = JSON.stringify([cloudName, apiKey, folderPath, mode, cursor]);
  const cached = cache.get(key);
  if (params.get("refresh") !== "1" && cached && cached.expires > Date.now()) return json(cached.data);

  async function fetchPage(kind: string): Promise<ResourcePage> {
    const url = new URL(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName!)}/resources/${kind === "prefix" ? "image/upload" : "by_asset_folder"}`);
    url.searchParams.set(kind === "prefix" ? "prefix" : "asset_folder", kind === "prefix" ? `${folderPath}/` : folderPath);
    url.searchParams.set("max_results", "100");
    if (cursor) url.searchParams.set("next_cursor", cursor);
    const response = await fetch(url, {
      headers: { Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}` },
      cache: "no-store", signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new AssetError("Cloudinary image folder could not be loaded.", response.status);
    const data = await response.json();
    if (!Array.isArray(data.resources)) throw new AssetError("Cloudinary returned an invalid image page.", 502);
    return data;
  }
  async function load(): Promise<BeatAssetPage> {
    let usedMode = mode;
    let data: ResourcePage;
    try { data = await fetchPage(mode); }
    catch (error) {
      // Fixed-folder accounts use the public-ID prefix; never fall back on an
      // authentication, rate-limit or network error.
      if (mode !== "folder" || cursor || !(error instanceof AssetError) || ![400, 404].includes(error.status)) throw error;
      usedMode = "prefix"; data = await fetchPage("prefix");
    }
    if (mode === "folder" && !cursor && data.resources.length === 0 && !data.next_cursor) {
      usedMode = "prefix"; data = await fetchPage("prefix");
    }
    const images = data.resources.filter((asset) => asset.resource_type === "image" && asset.type === "upload"
      && asset.access_mode !== "authenticated" && !asset.access_control?.length && asset.secure_url?.startsWith("https://"))
      .map((asset) => ({ id: asset.asset_id || asset.public_id, publicId: asset.public_id,
        name: asset.display_name || asset.public_id.split("/").pop() || asset.public_id,
        url: asset.secure_url!, thumbnail: beatAssetThumbnail(asset.secure_url!) }));
    // Carry the successful folder mode with the cursor, so load-more cannot
    // accidentally switch API methods midway through a folder.
    return { images, nextCursor: data.next_cursor ? `${usedMode}:${data.next_cursor}` : null, folderPath };
  }
  try {
    let task = pending.get(key);
    if (!task) { task = load(); pending.set(key, task); }
    const data = await task;
    if (cache.size >= 64) cache.delete(cache.keys().next().value!);
    cache.set(key, { data, expires: Date.now() + 60000 });
    return json(data);
  } catch (error) {
    const status = error instanceof AssetError ? error.status : 502;
    return json({ error: status === 429 ? "Cloudinary is busy. Try again shortly, or use the full library."
      : [401, 403].includes(status) ? "Cloudinary rejected the server credentials. Check the API key and secret in Vercel, or use the full library."
      : "Unable to load this image folder. Try again, or use the full library." }, status === 429 ? 429 : 502);
  } finally { pending.delete(key); }
}
