import { prisma } from "./prisma";

export async function logDownload(params: {
  beatId?: string;          // for beats or music products
  userEmail?: string;       // optional, defaults to "anonymous"
  ip?: string;              // optional, captured from request headers
  type: "beat" | "music";   // distinguishes beat vs music
}) {
  const { beatId, userEmail = "anonymous", ip = "unknown", type } = params;

  if (!beatId) return;

  await prisma.downloadLog.create({
    data: {
      beatId,
      userEmail,
      ip,
      type,
    },
  });
}
