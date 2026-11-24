import Link from "next/link";
export default function TrackNotFound() {
  return <div className="min-h-screen bg-black px-5 pb-32 pt-36 text-center text-white">
    <h1 className="text-3xl font-black">Track unavailable</h1>
    <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-zinc-300">This track may no longer be published, or the link may be incorrect.</p>
    <Link href="/music" className="mt-6 inline-flex rounded-xl bg-emerald-400 px-5 py-3 font-bold text-black">Browse music</Link>
  </div>;
}
