import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { objectInput, requiredText, text, integer, MusicInputError } from "@/lib/musicHub";
import { getArtistAccess, hubJson, hubError } from "@/lib/musicHubServer";
import { consumeAuthRateLimit } from "@/lib/authRateLimit";
export const dynamic = "force-dynamic";
const audioTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/flac", "audio/x-flac", "audio/ogg", "audio/mp4", "audio/aac"];
export async function POST(request: Request) {
  try {
    const body = objectInput(await request.json());
    const auth = await getArtistAccess(requiredText(body.artistId, "Artist"));
    if (auth.response) return auth.response;
    const purpose = text(body.purpose, 20);
    const mimeType = requiredText(body.contentType, "File type", 100).toLowerCase();
    const fileName = requiredText(body.fileName, "File name", 250);
    const types = purpose === "artwork" ? ["image/jpeg", "image/png", "image/webp", "image/gif"] : purpose === "preview" ? audioTypes : purpose === "download" ? [...audioTypes, "application/zip", "application/x-zip-compressed"] : [];
    if (!types.includes(mimeType)) throw new MusicInputError("Choose an audio file, a JPG/PNG/WebP/GIF image, or a ZIP download for the selected upload.");
    const limit = purpose === "artwork" ? 20 : purpose === "preview" ? 100 : 250;
    const byteSize = integer(body.byteSize, 1, limit * 1024 * 1024);
    const rate = await consumeAuthRateLimit({ action: "artist-upload", identifier: auth.access.id, maxAttempts: 40, windowMs: 3600000, blockMs: 3600000 });
    if (!rate.allowed) return hubJson({ error: "Upload limit reached. Please try again later." }, 429);
    const extension = fileName.match(/\.([a-z0-9]{1,8})$/i)?.[1]?.toLowerCase() || "bin";
    const fileKey = `artist-uploads/${auth.access.id}/${randomUUID()}.${extension}`;
    const { getArtistUploadUrl } = await import("@/lib/r2");
    const uploadUrl = await getArtistUploadUrl(fileKey, mimeType, byteSize);
    const upload = await prisma.artistUpload.create({ data: { accessId: auth.access.id, fileKey, fileName, mimeType, byteSize, purpose } });
    return hubJson({ uploadUrl, fileKey, mediaUrl: purpose !== "download" ? `/api/music/artist-media/${upload.id}` : null });
  } catch (error) { return hubError(error); }
}
