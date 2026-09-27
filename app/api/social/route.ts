import {
  NextResponse,
} from "next/server";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

type SocialPost = {
  id: string;
  platform: string;
  handle: string;
  headline: string;
  url: string;
  timestamp: string;
  status?: string;
  imageUrl?: string;
  publishedAt?: string;
};

function relativeTime(
  dateString?: string
) {
  if (!dateString) {
    return "RECENT";
  }

  const date =
    new Date(
      dateString
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "RECENT";
  }

  const diff =
    Date.now() -
    date.getTime();

  const minutes =
    Math.max(
      1,
      Math.floor(
        diff / 60000
      )
    );

  if (minutes < 60) {
    return `${minutes}M AGO`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  if (hours < 24) {
    return `${hours}H AGO`;
  }

  const days =
    Math.floor(
      hours / 24
    );

  if (days < 7) {
    return `${days}D AGO`;
  }

  const weeks =
    Math.floor(
      days / 7
    );

  if (weeks < 5) {
    return `${weeks}W AGO`;
  }

  return date.toLocaleDateString(
    "en-GB",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",
    }
  );
}

async function getLatestYouTubeVideos(): Promise<
  SocialPost[]
> {
  const apiKey =
    process.env
      .YOUTUBE_API_KEY;

  const handle =
    process.env
      .YOUTUBE_HANDLE ||
    "@rafbydesign";

  if (!apiKey) {
    return [];
  }

  try {
    const channelUrl =
      new URL(
        "https://www.googleapis.com/youtube/v3/channels"
      );

    channelUrl.searchParams.set(
      "part",
      "snippet,contentDetails"
    );

    channelUrl.searchParams.set(
      "forHandle",
      handle
    );

    channelUrl.searchParams.set(
      "key",
      apiKey
    );

    const channelResponse =
      await fetch(
        channelUrl,
        {
          next: {
            revalidate:
              3600,
          },
        }
      );

    if (
      !channelResponse.ok
    ) {
      console.error(
        "YouTube channel request failed:",
        channelResponse.status,
        await channelResponse.text()
      );

      return [];
    }

    const channelData =
      await channelResponse.json();

    const channel =
      channelData
        ?.items?.[0];

    const uploadsPlaylistId =
      channel
        ?.contentDetails
        ?.relatedPlaylists
        ?.uploads;

    if (
      !uploadsPlaylistId
    ) {
      console.error(
        `No YouTube uploads playlist found for ${handle}.`
      );

      return [];
    }

    const channelTitle =
      channel
        ?.snippet
        ?.title ||
      "RAF By Design";

    const uploadsUrl =
      new URL(
        "https://www.googleapis.com/youtube/v3/playlistItems"
      );

    uploadsUrl.searchParams.set(
      "part",
      "snippet,contentDetails"
    );

    uploadsUrl.searchParams.set(
      "playlistId",
      uploadsPlaylistId
    );

    uploadsUrl.searchParams.set(
      "maxResults",
      "6"
    );

    uploadsUrl.searchParams.set(
      "key",
      apiKey
    );

    const uploadsResponse =
      await fetch(
        uploadsUrl,
        {
          next: {
            revalidate:
              300,
          },
        }
      );

    if (
      !uploadsResponse.ok
    ) {
      console.error(
        "YouTube uploads request failed:",
        uploadsResponse.status,
        await uploadsResponse.text()
      );

      return [];
    }

    const uploadsData =
      await uploadsResponse.json();

    return (
      uploadsData
        ?.items || []
    )
      .map(
        (
          item: any
        ): SocialPost | null => {
          const snippet =
            item?.snippet;

          const videoId =
            item
              ?.contentDetails
              ?.videoId ||
            snippet
              ?.resourceId
              ?.videoId;

          if (
            !snippet ||
            !videoId
          ) {
            return null;
          }

          const publishedAt =
            snippet
              ?.publishedAt ||
            item
              ?.contentDetails
              ?.videoPublishedAt;

          return {
            id:
              `youtube-${videoId}`,

            platform:
              "YOUTUBE",

            handle,

            headline:
              snippet
                ?.title ||
              `Latest upload from ${channelTitle}`,

            url:
              `https://www.youtube.com/watch?v=${videoId}`,

            timestamp:
              relativeTime(
                publishedAt
              ),

            status:
              "LATEST UPLOAD",

            imageUrl:
              snippet
                ?.thumbnails
                ?.maxres
                ?.url ||
              snippet
                ?.thumbnails
                ?.standard
                ?.url ||
              snippet
                ?.thumbnails
                ?.high
                ?.url ||
              snippet
                ?.thumbnails
                ?.medium
                ?.url ||
              snippet
                ?.thumbnails
                ?.default
                ?.url,

            publishedAt,
          };
        }
      )
      .filter(
        Boolean
      ) as SocialPost[];
  } catch (error) {
    console.error(
      "YouTube social feed error:",
      error
    );

    return [];
  }
}

async function getLatestInstagramPosts(): Promise<
  SocialPost[]
> {
  const userId =
    process.env
      .INSTAGRAM_USER_ID;

  const accessToken =
    process.env
      .INSTAGRAM_ACCESS_TOKEN;

  const handle =
    process.env
      .INSTAGRAM_HANDLE ||
    "@rafbydesign";

  if (
    !userId ||
    !accessToken
  ) {
    return [];
  }

  try {
    const instagramUrl =
      new URL(
        `https://graph.instagram.com/v23.0/${userId}/media`
      );

    instagramUrl.searchParams.set(
      "fields",
      "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp"
    );

    instagramUrl.searchParams.set(
      "limit",
      "6"
    );

    instagramUrl.searchParams.set(
      "access_token",
      accessToken
    );

    const response =
      await fetch(
        instagramUrl,
        {
          next: {
            revalidate:
              900,
          },
        }
      );

    if (!response.ok) {
      console.error(
        "Instagram media request failed:",
        response.status,
        await response.text()
      );

      return [];
    }

    const data =
      await response.json();

    return (
      data?.data || []
    ).map(
      (
        item: any
      ): SocialPost => {
        const caption =
          typeof item
            ?.caption ===
            "string" &&
          item.caption.trim()
            ? item.caption.trim()
            : "Latest Instagram post";

        return {
          id:
            `instagram-${item.id}`,

          platform:
            "INSTAGRAM",

          handle,

          headline:
            caption,

          url:
            item
              ?.permalink ||
            "https://www.instagram.com/rafbydesign",

          timestamp:
            relativeTime(
              item?.timestamp
            ),

          status:
            "LATEST POST",

          imageUrl:
            item
              ?.thumbnail_url ||
            item
              ?.media_url,

          publishedAt:
            item?.timestamp,
        };
      }
    );
  } catch (error) {
    console.error(
      "Instagram social feed error:",
      error
    );

    return [];
  }
}

function getSocialLinks(): SocialPost[] {
  return [
    {
      id:
        "instagram-link",

      platform:
        "INSTAGRAM",

      handle:
        "@rafbydesign",

      headline:
        "Follow RAF By Design on Instagram.",

      url:
        "https://www.instagram.com/rafbydesign",

      timestamp:
        "SOCIAL LINK",

      status:
        "INSTAGRAM",
    },
    {
      id:
        "tiktok-link",

      platform:
        "TIKTOK",

      handle:
        "@rafbydesignmusic",

      headline:
        "Watch RAF By Design and HipHop100 on TikTok.",

      url:
        "https://www.tiktok.com/@rafbydesignmusic",

      timestamp:
        "SOCIAL LINK",

      status:
        "TIKTOK",
    },
  ];
}

export async function GET() {
  try {
    const [
      youtubePosts,
      instagramPosts,
    ] =
      await Promise.all([
        getLatestYouTubeVideos(),
        getLatestInstagramPosts(),
      ]);

    const youtubeFallback:
      SocialPost[] =
      youtubePosts.length >
      0
        ? []
        : [
            {
              id:
                "youtube-link",

              platform:
                "YOUTUBE",

              handle:
                "@rafbydesign",

              headline:
                "Visit the RAF By Design YouTube channel.",

              url:
                "https://www.youtube.com/@rafbydesign",

              timestamp:
                "SOCIAL LINK",

              status:
                "YOUTUBE",
            },
          ];

    const socialLinks =
      getSocialLinks();

    const instagramFallback =
      instagramPosts.length >
      0
        ? []
        : socialLinks.filter(
            (post) =>
              post.platform ===
              "INSTAGRAM"
          );

    const tiktokLink =
      socialLinks.filter(
        (post) =>
          post.platform ===
          "TIKTOK"
      );

    const socialFeed = [
      ...youtubePosts,
      ...youtubeFallback,
      ...instagramPosts,
      ...instagramFallback,
      ...tiktokLink,
    ];

    return NextResponse.json(
      socialFeed,
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=300, stale-while-revalidate=900",
        },
      }
    );
  } catch (error) {
    console.error(
      "Social feed error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Social feed error",
      },
      {
        status: 500,

        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  }
}