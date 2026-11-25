import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import type { MusicFileKind, MusicFormat } from "@/lib/musicDownloadFiles";

export const MUSIC_UPLOAD_PART_BYTES = 16 * 1024 * 1024;
export type MusicUploadSession = { v: 1; userId: string; key: string; name: string; bytes: number; contentType: string; kind: MusicFileKind; format: MusicFormat; uploadId?: string; createdAt: number };
function secret() { const value = process.env.AUTH_SECRET; if (!value) throw new Error("Upload signing is not configured."); return value; }

export function newMusicUpload(userId: string, input: Record<string, unknown>): MusicUploadSession {
  const kind = input.kind;
  const format = input.format;
  if ((kind !== "track" && kind !== "release") || (format !== "mp3" && format !== "wav")) throw new Error("Choose a track or release and MP3 or WAV.");
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const extension = kind === "release" ? "zip" : format;
  if (!name || name.length > 250 || !name.toLowerCase().endsWith(`.${extension}`)) throw new Error(`Choose a .${extension} file for this upload.`);
  const bytes = Number(input.bytes);
  const maximum = kind === "release" ? 4 * 1024 ** 3 : 512 * 1024 ** 2;
  if (!Number.isSafeInteger(bytes) || bytes <= 0 || bytes > maximum) throw new Error(kind === "release" ? "Release ZIPs can be up to 4 GiB." : "Track files can be up to 512 MiB.");
  const safeName = name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-140);
  return { v: 1, userId, key: `music-downloads/${randomUUID()}/${safeName}`, name, bytes, kind, format, createdAt: Date.now(), contentType: kind === "release" ? "application/zip" : format === "mp3" ? "audio/mpeg" : "audio/wav" };
}

export function signMusicUpload(session: MusicUploadSession) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${createHmac("sha256", secret()).update(payload).digest("base64url")}`;
}

export function readMusicUpload(token: unknown, userId: string): MusicUploadSession {
  if (typeof token !== "string" || token.length > 6000) throw new Error("The upload session is invalid. Select the file again.");
  const [payload, signature, extra] = token.split(".");
  const expected = createHmac("sha256", secret()).update(payload || "").digest();
  const supplied = Buffer.from(signature || "", "base64url");
  if (extra || supplied.length !== expected.length || !timingSafeEqual(expected, supplied)) throw new Error("The upload session is invalid.");
  const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as MusicUploadSession;
  if (session.v !== 1 || session.userId !== userId || !session.key?.startsWith("music-downloads/") || !Number.isSafeInteger(session.bytes) || session.bytes <= 0 || session.bytes > 4 * 1024 ** 3 || !Number.isFinite(session.createdAt) || session.createdAt > Date.now() || Date.now() - session.createdAt > 24 * 60 * 60 * 1000) throw new Error("The upload session expired or belongs to another account. Select the file again.");
  return session;
}

export function musicUploadPartSize(session: MusicUploadSession, number: number) {
  const count = Math.ceil(session.bytes / MUSIC_UPLOAD_PART_BYTES);
  if (!Number.isInteger(number) || number < 1 || number > count) throw new Error("The upload part is invalid.");
  return Math.min(MUSIC_UPLOAD_PART_BYTES, session.bytes - (number - 1) * MUSIC_UPLOAD_PART_BYTES);
}
