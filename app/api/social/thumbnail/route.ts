import { NextResponse } from "next/server";
import { getPlatformPosts, type SocialPlatform } from "@/lib/social-feed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const IMAGE_LIMIT = 5 * 1024 * 1024;
const CDN_HOSTS: Record<SocialPlatform, string[]> = {
  YOUTUBE: ["ytimg.com"],
  INSTAGRAM: ["cdninstagram.com", "fbcdn.net"],
  TIKTOK: [
    "tiktokcdn.com", "tiktokcdn-us.com", "tiktokcdn-eu.com", "tiktokcdn-eu.net",
    "byteoversea.com", "ibytedtos.com", "ibyteimg.com", "byteimg.com",
  ],
};

function trustedImageUrl(value: string, platform: SocialPlatform): URL | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
    if (!CDN_HOSTS[platform].some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))) return null;
    return url;
  } catch { return null; }
}

function unavailable(status = 404) {
  return new NextResponse(null, {
    status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const platform = (params.get("platform") || "").toUpperCase() as SocialPlatform;
  const id = params.get("id") || "";
  if (!Object.prototype.hasOwnProperty.call(CDN_HOSTS, platform)) return unavailable(400);
  const validId = platform === "YOUTUBE"
    ? /^youtube-[\w-]{11}$/.test(id)
    : new RegExp(`^${platform.toLowerCase()}-\\d{1,30}$`).test(id);
  if (!validId) return unavailable(400);

  try {
    // A visitor supplies a post ID, never an arbitrary remote URL.
    const posts = await getPlatformPosts(platform);
    const post = posts.find((item) => item.id === id);
    if (!post?.sourceImageUrl) return unavailable();
    let url = trustedImageUrl(post.sourceImageUrl, platform);
    if (!url) return unavailable();

    const signal = AbortSignal.timeout(10000);
    let response: Response | undefined;
    for (let redirectCount = 0; redirectCount < 4; redirectCount++) {
      response = await fetch(url, {
        redirect: "manual", signal, next: { revalidate: 300 },
        headers: { Accept: "image/avif,image/webp,image/jpeg,image/png,image/*;q=0.8" },
      });
      if (![301, 302, 303, 307, 308].includes(response.status)) break;
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (!location) return unavailable();
      url = trustedImageUrl(new URL(location, url).toString(), platform);
      if (!url) return unavailable();
      response = undefined;
    }
    if (!response?.ok || !response.body) return unavailable();
    const contentType = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
    if (!contentType || !["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"].includes(contentType)) {
      await response.body.cancel();
      return unavailable();
    }
    if (Number(response.headers.get("content-length") || 0) > IMAGE_LIMIT) {
      await response.body.cancel();
      return unavailable();
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let length = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        length += value.byteLength;
        if (length > IMAGE_LIMIT) {
          await reader.cancel();
          return unavailable();
        }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
    if (!length) return unavailable();
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=300, s-maxage=900, stale-while-revalidate=900",
        "X-Content-Type-Options": "nosniff",
        "Cross-Origin-Resource-Policy": "same-origin",
      },
    });
  } catch { return unavailable(502); }
}
