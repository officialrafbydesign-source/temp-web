import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { objectInput, requiredText, text, submissionInput, MusicInputError } from "@/lib/musicHub";
import { hubJson, hubError, getArtistAccess, validateArtistFiles } from "@/lib/musicHubServer";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return hubJson({ error: "Sign in to open your artist dashboard." }, 401);
    if (!user.emailVerifiedAt) return hubJson({ error: "Verify your account email first." }, 403);
    const access = await prisma.artistAccess.findMany({
      where: { userId: user.id, isActive: true },
      include: {
        artist: { select: { id: true, name: true, slug: true, releases: { where: { product: { is: { deletedAt: null } } }, select: { id: true, title: true } } } },
        submissions: { orderBy: { updatedAt: "desc" }, take: 100 },
      }, orderBy: { createdAt: "asc" },
    });
    return hubJson(access);
  } catch (error) { return hubError(error); }
}

export async function POST(request: Request) {
  try {
    const body = objectInput(await request.json());
    const artistId = requiredText(body.artistId, "Artist");
    const authorization = await getArtistAccess(artistId, body.action !== "accept");
    if (authorization.response) return authorization.response;
    const { access } = authorization;
    if (body.action === "accept") {
      if (body.accepted !== true || body.agreementVersion !== access.agreementVersion || body.agreementUrl !== access.agreementUrl) throw new MusicInputError("Read the current agreement and confirm acceptance.");
      const result = await prisma.artistAccess.updateMany({ where: { id: access.id, isActive: true, agreementVersion: access.agreementVersion, agreementUrl: access.agreementUrl }, data: { agreementAcceptedAt: new Date() } });
      if (result.count !== 1) throw new MusicInputError("Your agreement changed. Refresh the page before accepting.");
      return hubJson({ success: true });
    }
    if (body.action !== "save") throw new MusicInputError("Unknown action.");
    const data = submissionInput(body.data, body.submit !== true);
    const targetReleaseId = text(body.targetReleaseId, 200) || null;
    const id = text(body.id, 200);
    const status = body.submit === true ? "submitted" : "draft";
    const result = await prisma.$transaction(async tx => {
      const currentAccess = await tx.artistAccess.findUnique({ where: { id: access.id } });
      if (!currentAccess?.isActive || !currentAccess.agreementAcceptedAt || currentAccess.agreementVersion !== access.agreementVersion) throw new MusicInputError("Artist access or the agreement changed. Refresh the page.");
      await validateArtistFiles(data, access.id, tx);
      if (targetReleaseId && !await tx.release.findFirst({ where: { id: targetReleaseId, artistId, product: { is: { deletedAt: null } } }, select: { id: true } })) throw new MusicInputError("Choose one of your own releases.");
      if (id) {
        const previous = await tx.artistSubmission.findFirst({ where: { id, artistId, accessId: access.id } });
        if (!previous || !["draft", "rejected"].includes(previous.status)) throw new MusicInputError("Only your own drafts and returned submissions can be edited.");
        const updated = await tx.artistSubmission.updateMany({ where: { id, accessId: access.id, status: previous.status, updatedAt: previous.updatedAt }, data: { data: data as unknown as Prisma.InputJsonValue, targetReleaseId, status, reviewNote: null } });
        if (updated.count !== 1) throw new MusicInputError("This draft changed. Refresh before saving.");
        return { id, status };
      }
      return tx.artistSubmission.create({ data: { artistId, accessId: access.id, targetReleaseId, status, data: data as unknown as Prisma.InputJsonValue }, select: { id: true, status: true } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return hubJson(result);
  } catch (error) { return hubError(error); }
}
