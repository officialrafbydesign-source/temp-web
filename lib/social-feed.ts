// Server-side feed data. Only the public fields are returned by /api/social.
export type SocialPlatform = "YOUTUBE" | "INSTAGRAM" | "TIKTOK";

export type SocialFeedPost = {
  id: string;
  platform: SocialPlatform;
  handle: string;
  headline: string;
  url: string;
  timestamp: string;
  publishedAt: string;
  imageUrl?: string;
};

export type ServerSocialPost = SocialFeedPost & { sourceImageUrl?: string };

const POST_LIMIT = 6;
const RAF_YOUTUBE_CHANNEL_ID = "UCg5KTOaIObIR587_BhlHGlg";

function relativeTime(iso: string): string {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return "Recent";
  const seconds = Math.max(0, (Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function newestFirst(posts: ServerSocialPost[]): ServerSocialPost[] {
  return posts
    .filter((post) => post.id && post.url && post.publishedAt)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, POST_LIMIT)
    .map((post) => ({ ...post, timestamp: relativeTime(post.publishedAt) }));
}

function handle(value: string | undefined, fallback: string): string {
  return `@${(value || fallback).replace(/^@/, "").trim()}`;
}

async function fetchFeed(url: URL | string, revalidate: number, init: RequestInit = {}) {
  return fetch(url, {
    ...init,
    signal: AbortSignal.timeout(10000),
    next: { revalidate },
  });
}

type YouTubePlaylistItem = {
  snippet?: {
    title?: string;
    publishedAt?: string;
    resourceId?: { videoId?: string };
    thumbnails?: Record<string, { url?: string }>;
  };
  contentDetails?: { videoId?: string; videoPublishedAt?: string };
};

async function youtubeApiPosts(): Promise<ServerSocialPost[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];
  const channelHandle = handle(process.env.YOUTUBE_HANDLE, "rafbydesign");
  const channelsUrl = new URL("https://www.googleapis.com/youtube/v3/channels");
  channelsUrl.searchParams.set("part", "contentDetails");
  channelsUrl.searchParams.set("forHandle", channelHandle);
  channelsUrl.searchParams.set("key", apiKey);
  const channelResponse = await fetchFeed(channelsUrl, 3600);
  if (!channelResponse.ok) return [];
  const channels = await channelResponse.json();
  const playlistId = channels.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (typeof playlistId !== "string") return [];

  const playlistUrl = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
  playlistUrl.searchParams.set("part", "snippet,contentDetails");
  playlistUrl.searchParams.set("playlistId", playlistId);
  playlistUrl.searchParams.set("maxResults", String(POST_LIMIT));
  playlistUrl.searchParams.set("key", apiKey);
  const response = await fetchFeed(playlistUrl, 300);
  if (!response.ok) return [];
  const data = await response.json();
  if (!Array.isArray(data.items)) return [];
  return newestFirst((data.items as YouTubePlaylistItem[]).flatMap((item) => {
    const snippet = item.snippet;
    const videoId = item.contentDetails?.videoId || snippet?.resourceId?.videoId;
    const publishedAt = item.contentDetails?.videoPublishedAt || snippet?.publishedAt;
    if (!videoId || !publishedAt || !snippet?.title || !/^[\w-]{11}$/.test(videoId)) return [];
    if (["Private video", "Deleted video"].includes(snippet.title)) return [];
    const thumbnails = snippet.thumbnails;
    const sourceImageUrl = thumbnails?.high?.url || thumbnails?.medium?.url || thumbnails?.default?.url;
    return [{
      id: `youtube-${videoId}`, platform: "YOUTUBE" as const,
      handle: channelHandle, headline: snippet.title,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      timestamp: "", publishedAt, sourceImageUrl,
    }];
  }));
}

function xmlText(value: string): string {
  return value.replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, "$1")
    .replace(/&#(x[\da-f]+|\d+);/gi, (entity, code: string) => {
      const point = code.toLowerCase().startsWith("x")
        ? Number.parseInt(code.slice(1), 16) : Number.parseInt(code, 10);
      return point >= 0 && point <= 0x10ffff ? String.fromCodePoint(point) : entity;
    })
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
}

async function youtubePublicPosts(): Promise<ServerSocialPost[]> {
  const channelHandle = handle(process.env.YOUTUBE_HANDLE, "rafbydesign");
  const channelId = process.env.YOUTUBE_CHANNEL_ID ||
    (channelHandle.toLowerCase() === "@rafbydesign" ? RAF_YOUTUBE_CHANNEL_ID : "");
  if (!/^UC[\w-]{22}$/.test(channelId)) return [];
  const url = new URL("https://www.youtube.com/feeds/videos.xml");
  url.searchParams.set("channel_id", channelId);
  const response = await fetchFeed(url, 300);
  if (!response.ok) return [];
  const xml = await response.text();
  if (xml.length > 1024 * 1024) return [];
  const posts: ServerSocialPost[] = [];
  for (const entry of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const body = entry[1];
    const videoId = body.match(/<yt:videoId>([\w-]{11})<\/yt:videoId>/)?.[1];
    const title = body.match(/<title>([\s\S]*?)<\/title>/)?.[1];
    const publishedAt = body.match(/<published>([^<]+)<\/published>/)?.[1];
    if (!videoId || !title || !publishedAt) continue;
    posts.push({
      id: `youtube-${videoId}`, platform: "YOUTUBE", handle: channelHandle,
      headline: xmlText(title), url: `https://www.youtube.com/watch?v=${videoId}`,
      timestamp: "", publishedAt,
      sourceImageUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    });
  }
  return newestFirst(posts);
}

async function youtubePosts(): Promise<ServerSocialPost[]> {
  // Keep the existing API configuration, with a public-feed fallback.
  try {
    const posts = await youtubeApiPosts();
    if (posts.length) return posts;
  } catch { /* The public feed below does not need an API key. */ }
  return youtubePublicPosts();
}

type InstagramMedia = {
  id?: string; caption?: string; permalink?: string; timestamp?: string;
  media_type?: string; media_url?: string; thumbnail_url?: string;
};

async function instagramPosts(): Promise<ServerSocialPost[]> {
  const userId = process.env.INSTAGRAM_USER_ID;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!userId || !accessToken || !/^\d+$/.test(userId)) return [];
  const channelHandle = handle(process.env.INSTAGRAM_HANDLE, "rafbydesign");
  const apiVersion = process.env.INSTAGRAM_API_VERSION || "v23.0";
  if (!/^v\d+\.\d+$/.test(apiVersion)) return [];
  const url = new URL(`https://graph.instagram.com/${apiVersion}/${userId}/media`);
  url.searchParams.set("fields", "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp");
  url.searchParams.set("limit", String(POST_LIMIT));
  url.searchParams.set("access_token", accessToken);
  const response = await fetchFeed(url, 900);
  if (!response.ok) {
    console.warn(`Instagram feed unavailable (${response.status}).`);
    return [];
  }
  const data = await response.json();
  if (!Array.isArray(data.data)) return [];
  return newestFirst((data.data as InstagramMedia[]).flatMap((item) => {
    if (!item.id || !item.permalink || !item.timestamp) return [];
    return [{
      id: `instagram-${item.id}`, platform: "INSTAGRAM" as const,
      handle: channelHandle, headline: item.caption?.trim() || "Latest Instagram post",
      url: item.permalink, publishedAt: item.timestamp, timestamp: "",
      // Video URLs are not image files: use the API's still cover instead.
      sourceImageUrl: item.media_type === "VIDEO" ? item.thumbnail_url : item.media_url,
    }];
  }));
}

type TikTokVideo = {
  id?: string; title?: string; video_description?: string;
  create_time?: number; cover_image_url?: string; share_url?: string;
};

async function tiktokPosts(): Promise<ServerSocialPost[]> {
  // Requires the account's authorised Display API token with video.list scope.
  // A refresh-token integration must persist rotated tokens before production use.
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN;
  if (!accessToken) return [];
  const channelHandle = handle(process.env.TIKTOK_HANDLE, "rafbydesignmusic");
  const url = new URL("https://open.tiktokapis.com/v2/video/list/");
  url.searchParams.set("fields", "id,title,video_description,create_time,cover_image_url,share_url");
  const response = await fetchFeed(url, 300, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ max_count: POST_LIMIT }),
  });
  if (!response.ok) {
    console.warn(`TikTok feed unavailable (${response.status}).`);
    return [];
  }
  const data = await response.json();
  if (data.error?.code !== "ok" || !Array.isArray(data.data?.videos)) return [];
  return newestFirst((data.data.videos as TikTokVideo[]).flatMap((video) => {
    if (!video.id || !/^\d+$/.test(video.id) || !video.create_time) return [];
    return [{
      id: `tiktok-${video.id}`, platform: "TIKTOK" as const, handle: channelHandle,
      headline: video.video_description?.trim() || video.title?.trim() || "Latest TikTok post",
      url: video.share_url || `https://www.tiktok.com/${channelHandle}/video/${video.id}`,
      timestamp: "", publishedAt: new Date(video.create_time * 1000).toISOString(),
      sourceImageUrl: video.cover_image_url,
    }];
  }));
}

export async function getPlatformPosts(platform: SocialPlatform): Promise<ServerSocialPost[]> {
  try {
    if (platform === "YOUTUBE") return await youtubePosts();
    if (platform === "INSTAGRAM") return await instagramPosts();
    return await tiktokPosts();
  } catch {
    // Do not log upstream URLs or response bodies, which can contain credentials.
    console.warn(`${platform} feed temporarily unavailable.`);
    return [];
  }
}

export function publicPost(post: ServerSocialPost): SocialFeedPost {
  const { sourceImageUrl, ...fields } = post;
  if (!sourceImageUrl) return fields;
  const query = new URLSearchParams({ platform: post.platform.toLowerCase(), id: post.id });
  return { ...fields, imageUrl: `/api/social/thumbnail?${query}` };
}

export async function getPublicSocialFeed(): Promise<SocialFeedPost[]> {
  const platforms: SocialPlatform[] = ["YOUTUBE", "INSTAGRAM", "TIKTOK"];
  const feeds = await Promise.all(platforms.map(getPlatformPosts));
  return feeds.flat().map(publicPost);
}
