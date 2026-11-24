import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getMusicTrackPurchase } from "@/lib/musicTracksServer";
import { musicTrackPath } from "@/lib/musicTrackLinks";
import { getPresignedDownloadUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";

function privateRedirect(url: URL | string) {
  const response = NextResponse.redirect(url, 302);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trackUrl = new URL(musicTrackPath(id), request.url);
  try {
    const user = await getCurrentUser();
    if (!user) {
      const login = new URL("/login", request.url);
      login.searchParams.set("returnTo", trackUrl.pathname);
      return privateRedirect(login);
    }
    // Recheck ownership on every click, including for hidden previously bought releases.
    const purchase = await getMusicTrackPurchase(user.id, id);
    if (purchase?.trackFileKey) {
      return privateRedirect(await getPresignedDownloadUrl(purchase.trackFileKey));
    }
    if (purchase?.releaseDownloadHref) {
      return privateRedirect(new URL(purchase.releaseDownloadHref, request.url));
    }
    trackUrl.searchParams.set("download", purchase ? "pending" : "purchase-required");
    return privateRedirect(trackUrl);
  } catch (error) {
    console.error("Unable to prepare track download:", error instanceof Error ? error.name : "UnknownError");
    trackUrl.searchParams.set("download", "unavailable");
    return privateRedirect(trackUrl);
  }
}
