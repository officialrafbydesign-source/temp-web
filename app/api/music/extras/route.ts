import { prisma } from "@/lib/prisma";
import { hubJson, hubError, getHubExtras } from "@/lib/musicHubServer";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const artistId = params.get("artistId");
    const release = params.get("releaseId");
    if (release) {
      const product = await prisma.musicProduct.findFirst({ where: { OR: [{ id: release }, { releaseId: release }], isPublished: true, deletedAt: null }, select: { releaseId: true } });
      return hubJson(product ? await getHubExtras({ releaseId: product.releaseId }) : []);
    }
    if (!artistId) return hubJson({ error: "Choose an artist or release." }, 400);
    return hubJson(await getHubExtras({ artistId }));
  } catch (error) { return hubError(error); }
}
