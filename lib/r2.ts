import "server-only";

import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getRequiredEnvironmentVariable(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `Missing required Cloudflare R2 environment variable: ${name}`
    );
  }

  return value;
}

const accountId =
  getRequiredEnvironmentVariable("R2_ACCOUNT_ID");

const accessKeyId =
  getRequiredEnvironmentVariable("R2_ACCESS_KEY_ID");

const secretAccessKey =
  getRequiredEnvironmentVariable("R2_SECRET_ACCESS_KEY");

export const publicBucketName =
  getRequiredEnvironmentVariable("R2_BUCKET_NAME");

export const privateBucketName =
  getRequiredEnvironmentVariable("R2_PRIVATE_BUCKET_NAME");

export const r2Client = new S3Client({
  region: "auto",
  // Presigned PUTs are created before the browser supplies the body. Avoid
  // attaching the SDK's optional CRC32 checksum for an empty signing body.
  requestChecksumCalculation: "WHEN_REQUIRED",

  endpoint:
    `https://${accountId}.r2.cloudflarestorage.com`,

  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

function cleanPrivateObjectKey(value: string) {
  const objectKey = value.trim().replace(/^\/+/, "");

  if (!objectKey) {
    throw new Error(
      "A private R2 object key is required."
    );
  }

  if (/^https?:\/\//i.test(objectKey)) {
    throw new Error(
      "Expected a private R2 object key, but received a complete URL."
    );
  }

  return objectKey;
}

function getDownloadFileName(objectKey: string) {
  const fileName =
    objectKey.split("/").pop()?.trim();

  return fileName || "raf-by-design-download";
}

/**
 * Creates a temporary download URL for an object stored in the
 * private paid-download bucket.
 *
 * The customer's purchase entitlement does not expire. A new URL
 * should be generated whenever they click Download from their order.
 */
export async function getPresignedDownloadUrl(
  fileKey: string,
  expiresInSeconds: number = 300
): Promise<string> {
  const objectKey =
    cleanPrivateObjectKey(fileKey);

  const fileName =
    getDownloadFileName(objectKey);

  // Never allow a download link to remain valid for longer than
  // five minutes, even if an older route requests a longer period.
  const safeExpiry = Math.min(
    Math.max(
      Math.floor(expiresInSeconds),
      60
    ),
    300
  );

  const command = new GetObjectCommand({
    Bucket: privateBucketName,
    Key: objectKey,

    ResponseContentDisposition:
      `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
  });

  return getSignedUrl(
    r2Client,
    command,
    {
      expiresIn: safeExpiry,
    }
  );
}

/** Media access is checked by the caller before signing. Keep the bucket
 * private; inline disposition lets authorised audio/video players stream it. */
export async function getPresignedMediaUrl(fileKey: string, download = false): Promise<string> {
  if (download) return getPresignedDownloadUrl(fileKey);
  const command = new GetObjectCommand({ Bucket: privateBucketName, Key: cleanPrivateObjectKey(fileKey) });
  return getSignedUrl(r2Client, command, { expiresIn: 300 });
}

export async function getArtistUploadUrl(fileKey: string, contentType: string, byteSize: number): Promise<string> {
  const command = new PutObjectCommand({ Bucket: privateBucketName, Key: cleanPrivateObjectKey(fileKey), ContentType: contentType, ContentLength: byteSize });
  return getSignedUrl(r2Client, command, { expiresIn: 600, signableHeaders: new Set(["content-type", "content-length"]) });
}
