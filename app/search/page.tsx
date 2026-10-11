import Link from "next/link";
import PageBanner from "@/components/layout/PageBanner";
import { searchSite, type SiteSearchResult } from "@/lib/siteSearch";
import { sanitizeCloudinaryUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Search | RAF By Design" };

export default async function SearchPage({ searchParams }: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const value = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = (value || "").trim().slice(0, 100);
  const { results, incomplete } = await searchSite(query);
  const kinds: SiteSearchResult["kind"][] = ["Beats", "Music", "Clothing", "Pages & Services"];
  return (
    <main className="min-h-screen bg-zinc-950 pb-24 pt-24 text-white">
      <PageBanner title="Search RAF" description="Find beats, music, clothing and creative services." />
      <div className="mx-auto max-w-7xl space-y-8 px-4 pt-8 sm:px-6">
        <form action="/search" method="get" className="flex gap-2" role="search">
          <label htmlFor="raf-search" className="sr-only">Search RAF By Design</label>
          <input id="raf-search" name="q" type="search" defaultValue={query} maxLength={100} placeholder="Search beats, music, clothing or services…" required className="min-w-0 flex-1 rounded-lg border-2 border-zinc-700 bg-black px-4 py-3 text-sm outline-none focus:border-red-500" />
          <button className="rounded-lg bg-red-600 px-4 py-3 text-sm font-bold hover:bg-red-500" type="submit">Search</button>
        </form>
        {!query && <p className="text-sm text-white/75">Enter a title, artist, product or service to get started.</p>}
        {query && <p className="break-words text-sm text-white/75">Results for “{query}”</p>}
        {incomplete && <p role="status" className="rounded-lg border border-amber-600 bg-amber-950/40 p-3 text-sm text-amber-200">Some products couldn’t be loaded. Please try again.</p>}
        {query && !results.length && !incomplete && <p className="text-white/80">No results found. Try another title or a broader search.</p>}
        {kinds.map((kind) => {
          const matches = results.filter((result) => result.kind === kind);
          if (!matches.length) return null;
          return (
            <section key={kind} className="space-y-4" aria-label={`${kind} search results`}>
              <h2 className="font-raf text-2xl">{kind}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {matches.map((result) => (
                  <Link key={result.id} href={result.href} className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-zinc-700 bg-black transition hover:border-red-500">
                    {result.image && <div className="h-36 bg-zinc-900"><img src={sanitizeCloudinaryUrl(result.image, "/images/logo.png")} alt="" loading="lazy" className="h-full w-full object-contain p-2" /></div>}
                    <div className="space-y-2 p-4">
                      <h3 className="break-words text-sm font-bold">{result.title}</h3>
                      <p className="break-words text-xs text-white/70">{result.description}</p>
                      <p className="text-xs text-red-300">View →</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
