import { PUBLIC_CATALOGUE_WHERE, isPublicCatalogueItem } from "@/lib/catalogueVisibility";
import "server-only";
import { prisma } from "@/lib/prisma";

export type SiteSearchResult = {
  id: string;
  title: string;
  description: string;
  href: string;
  image?: string | null;
  kind: "Beats" | "Music" | "Clothing" | "Pages & Services";
};

const pages = [
  { title: "Beat Store", href: "/beats/store", description: "Browse instrumentals and beat licences.", keywords: "beats instrumentals buy shop licensing" },
  { title: "Music Store", href: "/music", description: "Browse albums, singles and music releases.", keywords: "music shop songs trexx albums singles" },
  { title: "Clothing Store", href: "/clothing", description: "Shop HipHop100 clothing and merchandise.", keywords: "clothing hiphop100 clothes hoodies shirts merchandise" },
  { title: "HipHop100", href: "/clothing/hiphop100", description: "Explore the HipHop100 brand and media.", keywords: "clothing hiphop100 campaigns cyphers" },
  { title: "Music Services", href: "/beats/services", description: "Recording, mixing, audio editing and custom beat production.", keywords: "music services mastering production studio" },
  { title: "Music Service Booking", href: "/beats/services/book", description: "Send a music project or recording booking request.", keywords: "music services booking recording mixing custom beats" },
  { title: "Audio Examples", href: "/beats/services/examples", description: "Hear before-and-after mixes and beat adjustments.", keywords: "music services audio examples demos mixing" },
  { title: "Design Services", href: "/design/services", description: "Branding, artwork, print and digital design.", keywords: "design services logo graphic flyers covers posters" },
  { title: "Design Booking", href: "/design/book", description: "Request a design project or quote.", keywords: "design services booking brief pricing quote" },
  { title: "Design Gallery", href: "/design/gallery", description: "Explore logos, artwork and completed design projects.", keywords: "design portfolio gallery examples artwork" },
  { title: "All About RAF", href: "/all-about-raf", description: "Learn about RAF By Design.", keywords: "about raf business studio" },
  { title: "What We Offer", href: "/what-we-offer", description: "Explore our products and creative services.", keywords: "services products offer" },
  { title: "How It Works", href: "/how-it-works", description: "Learn how to order and work with RAF.", keywords: "process help orders how it works" },
  { title: "Showcase", href: "/showcase", description: "View selected RAF By Design work.", keywords: "showcase portfolio work projects" },
  { title: "Contact RAF", href: "/contact", description: "Get in touch about a project or order.", keywords: "contact email enquiries support help" },
];

export async function searchSite(query: string) {
  if (!query) return { results: [] as SiteSearchResult[], incomplete: false };
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const results: SiteSearchResult[] = pages.filter((page) => {
    const text = `${page.title} ${page.description} ${page.keywords}`.toLowerCase();
    return words.every((word) => text.includes(word));
  }).map((page) => ({ ...page, id: page.href, kind: "Pages & Services" }));
  const contains = { contains: query, mode: "insensitive" as const };
  const groups = await Promise.allSettled([
    prisma.beat.findMany({
      where: { ...PUBLIC_CATALOGUE_WHERE, isAvailable: true, OR: [{ title: contains }, { genre: contains }, { description: contains }] },
      select: { id: true, title: true, genre: true, artworkUrl: true },
      orderBy: { createdAt: "desc" }, take: 24,
    }).then((beats): SiteSearchResult[] => beats.map((beat) => ({
      id: beat.id, title: beat.title, description: beat.genre || "Instrumental", href: `/beats/${encodeURIComponent(beat.id)}`, image: beat.artworkUrl, kind: "Beats",
    }))),
    prisma.musicProduct.findMany({
      where: { ...PUBLIC_CATALOGUE_WHERE, release: { OR: [{ title: contains }, { genre: contains }, { description: contains }, { artist: { name: contains } }, { songs: { some: { title: contains } } }] } },
      select: { id: true, release: { select: { id: true, title: true, coverUrl: true, artist: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" }, take: 24,
    }).then((products): SiteSearchResult[] => products.map((product) => ({
      id: product.id, title: product.release.title, description: product.release.artist.name, href: `/music/${encodeURIComponent(product.release.id)}`, image: product.release.coverUrl, kind: "Music",
    }))),
    prisma.product.findMany({
      where: { ...PUBLIC_CATALOGUE_WHERE, OR: [{ name: contains }, { brand: contains }, { category: contains }, { description: contains }, { range: contains }] },
      select: { id: true, name: true, category: true, imageUrls: true },
      orderBy: { createdAt: "desc" }, take: 24,
    }).then((products): SiteSearchResult[] => products.map((product) => ({
      id: product.id, title: product.name, description: product.category || "HipHop100 clothing", href: `/clothing/${encodeURIComponent(product.id)}`, image: product.imageUrls[0], kind: "Clothing",
    }))),
  ]);
  for (const group of groups) if (group.status === "fulfilled") results.push(...group.value);
  return { results, incomplete: groups.some((group) => group.status === "rejected") };
}
