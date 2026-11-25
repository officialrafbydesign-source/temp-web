import { NextResponse } from "next/server";
import { AbortMultipartUploadCommand, CompleteMultipartUploadCommand, CreateMultipartUploadCommand, HeadObjectCommand, ListPartsCommand, PutObjectCommand, UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { authorizeAdminApi } from "@/lib/adminApi";
import { consumeAuthRateLimit } from "@/lib/authRateLimit";
import { r2Client, privateBucketName, publicBucketName, getPresignedDownloadUrl } from "@/lib/r2";
import { musicDownloadFilesInput } from "@/lib/musicDownloadFiles";
import { MUSIC_UPLOAD_PART_BYTES, musicUploadPartSize, newMusicUpload, readMusicUpload, signMusicUpload, type MusicUploadSession } from "@/lib/musicUploadsServer";

export const dynamic = "force-dynamic";
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
async function uploadedFile(session: MusicUploadSession) {
  const result = await r2Client.send(new HeadObjectCommand({ Bucket: privateBucketName, Key: session.key }));
  if (result.ContentLength !== session.bytes || result.ContentType !== session.contentType) throw new Error("The uploaded file could not be verified. Select the file again.");
  return { key: session.key, name: session.name, bytes: result.ContentLength };
}
async function putUrl(session: MusicUploadSession) {
  return getSignedUrl(r2Client, new PutObjectCommand({ Bucket: privateBucketName, Key: session.key, ContentType: session.contentType, ContentLength: session.bytes }), { expiresIn: 900, signableHeaders: new Set(["content-type", "content-length"]) });
}

export async function POST(request: Request) {
  const auth = await authorizeAdminApi();
  if (!auth.authorized) return auth.response;
  if (privateBucketName === publicBucketName) return json({ error: "Configure a separate private paid-download bucket before uploading." }, 503);
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "Invalid upload request." }, 400);
    if (body.action === "check") {
      if ((body.kind !== "track" && body.kind !== "release") || (body.format !== "mp3" && body.format !== "wav")) return json({ error: "Choose a track or release and MP3 or WAV." }, 400);
      const file = musicDownloadFilesInput({ [body.format]: { key: body.key } }, body.kind)[body.format as "mp3" | "wav"]!;
      const head = await r2Client.send(new HeadObjectCommand({ Bucket: privateBucketName, Key: file.key }));
      return json({ file: { ...file, bytes: head.ContentLength || null }, downloadUrl: await getPresignedDownloadUrl(file.key) });
    }
    if (body.action === "start") {
      const session = newMusicUpload(auth.user.id, body);
      const rate = await consumeAuthRateLimit({ action: "admin-music-upload", identifier: auth.user.id, maxAttempts: 500, windowMs: 3600000, blockMs: 3600000 });
      if (!rate.allowed) return json({ error: "Upload limit reached. Please try again later." }, 429);
      if (session.bytes > 64 * 1024 ** 2) {
        const created = await r2Client.send(new CreateMultipartUploadCommand({ Bucket: privateBucketName, Key: session.key, ContentType: session.contentType }));
        if (!created.UploadId) throw new Error("The multipart upload could not be started.");
        session.uploadId = created.UploadId;
      }
      return json({ token: signMusicUpload(session), multipart: Boolean(session.uploadId), partBytes: MUSIC_UPLOAD_PART_BYTES, contentType: session.contentType, url: session.uploadId ? null : await putUrl(session) });
    }
    const session = readMusicUpload(body.token, auth.user.id);
    if (body.action === "part") {
      if (!session.uploadId) return json({ error: "This upload does not use parts." }, 400);
      const number = Number(body.number);
      const size = musicUploadPartSize(session, number);
      const url = await getSignedUrl(r2Client, new UploadPartCommand({ Bucket: privateBucketName, Key: session.key, UploadId: session.uploadId, PartNumber: number, ContentLength: size }), { expiresIn: 900, signableHeaders: new Set(["content-length"]) });
      return json({ url });
    }
    if (body.action === "put") {
      if (session.uploadId) return json({ error: "Resume this upload using its parts." }, 400);
      return json({ url: await putUrl(session), contentType: session.contentType });
    }
    if (body.action === "status") {
      if (!session.uploadId) {
        try { return json({ file: await uploadedFile(session), complete: true, parts: [] }); }
        catch { return json({ complete: false, parts: [] }); }
      }
      try {
        const result = await r2Client.send(new ListPartsCommand({ Bucket: privateBucketName, Key: session.key, UploadId: session.uploadId }));
        return json({ complete: false, parts: (result.Parts || []).filter(part => part.PartNumber && part.Size === musicUploadPartSize(session, part.PartNumber)).map(part => part.PartNumber) });
      } catch (error) {
        if ((error as { name?: string }).name !== "NoSuchUpload") throw error;
        return json({ complete: true, file: await uploadedFile(session), parts: [] });
      }
    }
    if (body.action === "complete") {
      if (session.uploadId) {
        try {
          const result = await r2Client.send(new ListPartsCommand({ Bucket: privateBucketName, Key: session.key, UploadId: session.uploadId }));
          const parts = result.Parts || [];
          if (parts.length !== Math.ceil(session.bytes / MUSIC_UPLOAD_PART_BYTES) || parts.some((part, index) => part.PartNumber !== index + 1 || part.Size !== musicUploadPartSize(session, index + 1) || !part.ETag)) return json({ error: "Some upload parts are missing. Select the same file to resume." }, 400);
          await r2Client.send(new CompleteMultipartUploadCommand({ Bucket: privateBucketName, Key: session.key, UploadId: session.uploadId, MultipartUpload: { Parts: parts.map(part => ({ ETag: part.ETag, PartNumber: part.PartNumber })) } }));
        } catch (error) { if ((error as { name?: string }).name !== "NoSuchUpload") throw error; }
      }
      return json({ file: await uploadedFile(session), complete: true });
    }
    if (body.action === "discard") {
      if (session.uploadId) await r2Client.send(new AbortMultipartUploadCommand({ Bucket: privateBucketName, Key: session.key, UploadId: session.uploadId }));
      return json({ discarded: true });
    }
    return json({ error: "Unknown upload action." }, 400);
  } catch (error) {
    const name = error instanceof Error ? error.name : "UnknownError";
    console.error("Admin music upload failed:", name);
    const message = error instanceof SyntaxError ? "The upload request was invalid." : error instanceof Error && !(error as { $metadata?: unknown }).$metadata && !["AccessDenied", "CredentialsProviderError", "UnknownEndpoint", "TimeoutError"].includes(name) ? error.message : "The upload could not be completed. Check the R2 connection and try again.";
    return json({ error: message }, 400);
  }
}
