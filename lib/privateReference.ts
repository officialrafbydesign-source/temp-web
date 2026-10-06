import "server-only";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";

type Reference = { publicId: string; resourceType: "image" | "video" | "raw"; format: string };
const prefix = "cld-auth:";

function credentials() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) throw new Error("Cloudinary credentials are missing");
  return { cloudName, apiKey, apiSecret };
}

export async function uploadPrivateReference(file: File, folder: string, maximumBytes: number) {
  if (file.size > maximumBytes) throw new Error("REFERENCE_FILE_TOO_LARGE");
  const { cloudName, apiKey, apiSecret } = credentials();
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto.createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`).digest("hex");
  const upload = new FormData();
  upload.append("file", file);
  upload.append("api_key", apiKey);
  upload.append("timestamp", String(timestamp));
  upload.append("folder", folder);
  upload.append("signature", signature);
  // The delivery type is part of the REST endpoint, never the public /upload endpoint.
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/authenticated`, {
    method: "POST", body: upload,
  });
  const result = await response.json();
  if (!response.ok || result.type !== "authenticated" ||
      !result.public_id || !["image", "video", "raw"].includes(result.resource_type)) {
    throw new Error("PRIVATE_REFERENCE_UPLOAD_FAILED");
  }
  const format = result.format || file.name.split(".").pop()?.toLowerCase();
  if (!format || !/^[a-z0-9]{1,16}$/.test(format)) throw new Error("INVALID_REFERENCE_FORMAT");
  const reference: Reference = {
    publicId: result.public_id, resourceType: result.resource_type, format,
  };
  return prefix + Buffer.from(JSON.stringify(reference)).toString("base64url");
}

export function getAdminReferenceUrl(storedValue: string) {
  if (!storedValue.startsWith(prefix)) {
    // Already uploaded references used public Cloudinary URLs. They remain legacy assets.
    const legacy = new URL(storedValue);
    if (legacy.protocol !== "https:" || legacy.hostname !== "res.cloudinary.com") {
      throw new Error("Invalid legacy reference");
    }
    return legacy.toString();
  }
  const reference = JSON.parse(Buffer.from(storedValue.slice(prefix.length), "base64url").toString()) as Reference;
  if (!reference.publicId || !/^[\w./-]{1,500}$/.test(reference.publicId) ||
      !["image", "video", "raw"].includes(reference.resourceType) ||
      !/^[a-z0-9]{1,16}$/.test(reference.format)) throw new Error("Invalid private reference");
  const { cloudName, apiKey, apiSecret } = credentials();
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  return cloudinary.utils.private_download_url(reference.publicId, reference.format, {
    resource_type: reference.resourceType, type: "authenticated",
    expires_at: Math.floor(Date.now() / 1000) + 300,
  });
}
