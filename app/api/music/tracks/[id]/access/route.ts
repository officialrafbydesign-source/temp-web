import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getMusicTrackPurchase } from "@/lib/musicTracksServer";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;
    const purchase = user ? await getMusicTrackPurchase(user.id, id) : null;
    return NextResponse.json({
      signedIn: Boolean(user), owned: Boolean(purchase),
      downloadHref: purchase?.downloadHref || null,
      releaseDownloadHref: purchase?.releaseDownloadHref || null,
    }, { headers });
  } catch (error) {
    console.error("Unable to check track downloads:", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({ error: "Your downloads could not be checked. Open your account or try again." }, { status: 500, headers });
  }
}
