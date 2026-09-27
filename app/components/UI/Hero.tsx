import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center text-white overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />

      {/* Glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          Music. Design.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            Culture.
          </span>
        </h1>

        <p className="text-gray-300 max-w-2xl mx-auto mb-8 text-lg">
          Beats, digital products, graphic design, and fashion — crafted under
          one creative brand.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/music"
            className="px-8 py-3 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition"
          >
            Explore Music
          </Link>

          <Link
            href="/shop"
            className="px-8 py-3 rounded-lg border border-white/30 hover:bg-white/10 transition"
          >
            Visit Store
          </Link>
        </div>
      </div>
    </section>
  );
}
