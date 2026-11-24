import { Prisma } from "@prisma/client";
import { authorizeAdminApi } from "@/lib/adminApi";
import { prisma } from "@/lib/prisma";
import { artistProfileInput, extraInput, hubLinks, objectInput, requiredText, text, webUrl, submissionInput, MusicInputError } from "@/lib/musicHub";
import { hubJson, hubError, validateArtistFiles } from "@/lib/musicHubServer";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await authorizeAdminApi();
  if (!auth.authorized) return auth.response;
  try {
    const [artists, releases, extras, access, submissions] = await Promise.all([
      prisma.artist.findMany({ orderBy: { name: "asc" } }),
      prisma.release.findMany({ where: { product: { is: { deletedAt: null } } }, select: { id: true, artistId: true, title: true, standardLinks: true, packageNote: true, product: { select: { id: true, isPublished: true } } }, orderBy: { createdAt: "desc" } }),
      prisma.musicExtra.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }),
      prisma.artistAccess.findMany({ include: { user: { select: { email: true } }, artist: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
      prisma.artistSubmission.findMany({ where: { status: { in: ["submitted", "rejected", "approved"] } }, include: { artist: { select: { name: true } } }, orderBy: { updatedAt: "desc" }, take: 100 }),
    ]);
    return hubJson({ artists, releases, extras, access, submissions });
  } catch (error) { return hubError(error); }
}

export async function POST(request: Request) {
  const auth = await authorizeAdminApi();
  if (!auth.authorized) return auth.response;
  try {
    const body = objectInput(await request.json());
    const action = requiredText(body.action, "Action");
    const id = text(body.id, 200);
    if (action === "artist") {
      const data = artistProfileInput(body);
      const artist = id ? await prisma.artist.update({ where: { id }, data }) : await prisma.artist.create({ data });
      return hubJson({ id: artist.id });
    }
    if (action === "release") {
      const releaseId = requiredText(body.releaseId, "Release");
      await prisma.release.update({ where: { id: releaseId }, data: { standardLinks: hubLinks(body.standardLinks), packageNote: text(body.packageNote, 10000) || null } });
      return hubJson({ success: true });
    }
    if (action === "extra") {
      const data = extraInput(body);
      const artist = await prisma.artist.findUnique({ where: { id: data.artistId }, select: { id: true } });
      if (!artist) return hubJson({ error: "Artist not found." }, 404);
      if (data.releaseId && !await prisma.release.findFirst({ where: { id: data.releaseId, artistId: data.artistId }, select: { id: true } })) throw new MusicInputError("The release must belong to the selected artist.");
      const extra = id ? await prisma.musicExtra.update({ where: { id }, data }) : await prisma.musicExtra.create({ data });
      return hubJson({ id: extra.id });
    }
    if (action === "removeExtra") {
      await prisma.musicExtra.delete({ where: { id: requiredText(body.id, "Content ID") } });
      return hubJson({ success: true });
    }
    if (action === "access") {
      const artistId = requiredText(body.artistId, "Artist");
      const email = requiredText(body.email, "Account email").toLowerCase();
      const agreementUrl = webUrl(body.agreementUrl);
      if (!agreementUrl) throw new MusicInputError("Link the artist's actual agreement before granting access.");
      const agreementVersion = requiredText(body.agreementVersion, "Agreement version", 100);
      const user = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } }, select: { id: true, emailVerifiedAt: true } });
      if (!user?.emailVerifiedAt) throw new MusicInputError("The artist must register and verify their account email first.");
      const previous = await prisma.artistAccess.findUnique({ where: { artistId_userId: { artistId, userId: user.id } } });
      const changed = previous?.agreementVersion !== agreementVersion || previous?.agreementUrl !== agreementUrl;
      await prisma.artistAccess.upsert({
        where: { artistId_userId: { artistId, userId: user.id } },
        create: { artistId, userId: user.id, agreementUrl, agreementVersion },
        update: { agreementUrl, agreementVersion, isActive: true, ...(changed ? { agreementAcceptedAt: null } : {}) },
      });
      return hubJson({ success: true });
    }
    if (action === "toggleAccess") {
      if (typeof body.isActive !== "boolean") throw new MusicInputError("Choose whether access is active.");
      await prisma.artistAccess.update({ where: { id: requiredText(body.id, "Access ID") }, data: { isActive: body.isActive } });
      return hubJson({ success: true });
    }
    if (action === "review") {
      const submissionId = requiredText(body.id, "Submission ID");
      const approve = body.decision === "approve";
      if (!approve && body.decision !== "reject") throw new MusicInputError("Choose approve or reject.");
      const reviewNote = text(body.reviewNote, 5000) || null;
      const result = await prisma.$transaction(async tx => {
        const submission = await tx.artistSubmission.findUnique({ where: { id: submissionId }, include: { access: true } });
        if (!submission || submission.status !== "submitted") throw new MusicInputError("Only submitted items can be reviewed. Refresh the page.");
        if (approve && (!submission.access.isActive || !submission.access.agreementAcceptedAt)) throw new MusicInputError("Restore artist access and accept the current agreement before approval.");
        const changed = await tx.artistSubmission.updateMany({ where: { id: submissionId, status: "submitted", updatedAt: submission.updatedAt }, data: { status: approve ? "approved" : "rejected", reviewNote } });
        if (changed.count !== 1) throw new MusicInputError("This submission changed. Refresh and review it again.");
        if (!approve) return { success: true };
        const data = submissionInput(submission.data);
        await validateArtistFiles(data, submission.access.id, tx);
        let releaseId = submission.targetReleaseId;
        let trackOffset = 0;
        if (releaseId) {
          const release = await tx.release.findFirst({ where: { id: releaseId, artistId: submission.artistId, product: { is: { deletedAt: null } } }, include: { songs: { select: { trackNo: true } } } });
          if (!release) throw new MusicInputError("The target release is no longer available.");
          trackOffset = Math.max(0, ...release.songs.map(song => song.trackNo || 0));
        } else {
          if (data.price > 0 && !data.fileUrl) throw new MusicInputError("A paid digital release needs its private full-release download key before approval.");
          const release = await tx.release.create({ data: { artistId: submission.artistId, title: data.title, type: data.type, description: data.description, coverUrl: data.coverUrl, product: { create: { price: data.price, itemType: "DIGITAL", fileUrl: data.fileUrl, isPublished: false } } } });
          releaseId = release.id;
        }
        await tx.song.createMany({ data: data.tracks.map((track, index) => ({ ...track, artistId: submission.artistId, releaseId: releaseId!, trackNo: trackOffset + index + 1 })) });
        return { success: true, releaseId };
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      return hubJson(result);
    }
    throw new MusicInputError("Unknown action.");
  } catch (error) { return hubError(error); }
}
