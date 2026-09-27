export default function Hero() {
  return (
    <section className="w-full flex justify-center py-16 px-4">
      <div className="w-full max-w-3xl text-center">
        {/* Hero Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
          Welcome to RAF By Design
        </h1>

        {/* Hero Subheading */}
        <p className="text-gray-300 text-lg sm:text-xl mb-6">
          Music, design, digital products, clothing — all coming soon.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <a
            href="#"
            className="px-6 py-3 bg-yellow-500 text-black font-semibold rounded-md hover:bg-yellow-400 transition"
          >
            Learn More
          </a>
          <a
            href="#"
            className="px-6 py-3 border border-white text-white font-semibold rounded-md hover:bg-white hover:text-black transition"
          >
            Contact Us
          </a>
        </div>

        {/* Optional visual / accent image */}
        <div className="mt-6">
          <img
            src="/images/hero-accent.png"
            alt="Hero Visual"
            className="mx-auto max-w-sm w-full object-contain"
          />
        </div>

        {/* Optional supporting text */}
        <p className="text-gray-400 text-sm sm:text-base mt-4">
          Stay tuned for exclusive beats, design drops, and more.
        </p>
      </div>
    </section>
  );
}
