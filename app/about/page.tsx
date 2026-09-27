"use client";

import Link from "next/link";
import RafAboutBackground from "@/components/raf/RafAboutBackground";

export default function AboutPage() {
  return (
    <main className="all-about-raf-page min-h-screen relative text-black">
      <style jsx global>{`
        .all-about-raf-page {
          font-family: Arial, Helvetica, sans-serif;
        }

        .all-about-raf-page .font-mono,
        .all-about-raf-page .font-clarity {
          font-family: Arial, Helvetica, sans-serif !important;
        }

        .all-about-raf-page .font-raf {
          font-family: "RAF Font Demo", sans-serif;
        }
      `}</style>

      <RafAboutBackground />

      <div className="relative z-10 pt-28 pb-20 space-y-12">
        {/* HEADER */}
        <section className="w-screen relative left-1/2 -translate-x-1/2 bg-black border-y-4 border-black shadow-[0_4px_0_0_rgba(0,0,0,0.35)]">
          <div className="w-full px-6 py-10 text-center">
            <h1 className="font-raf text-4xl sm:text-6xl lg:text-7xl text-white uppercase">
              About Us
            </h1>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/all-about-raf"
                className="rounded-xl border-2 border-white bg-black px-7 py-3 text-center font-mono text-base font-black text-white hover:bg-zinc-900 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.14)] transition active:translate-y-0.5"
              >
                All About RAF
              </Link>

              <Link
                href="/what-we-offer"
                className="rounded-xl border-2 border-white bg-white px-7 py-3 text-center font-mono text-sm font-black text-black hover:bg-zinc-200 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.16)] transition active:translate-y-0.5"
              >
                What We Offer
              </Link>

              <Link
                href="/showcase"
                className="rounded-xl border-2 border-white bg-white px-7 py-3 text-center font-mono text-sm font-black text-black hover:bg-zinc-200 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.16)] transition active:translate-y-0.5"
              >
                Showcase
              </Link>

              <Link
                href="/how-it-works"
                className="rounded-xl border-2 border-white bg-white px-7 py-3 text-center font-mono text-sm font-black text-black hover:bg-zinc-200 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.16)] transition active:translate-y-0.5"
              >
                How It Works
              </Link>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 space-y-8">
          {/* 01 // THE BEGINNING */}
          <article className="overflow-hidden rounded-2xl border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="bg-black px-5 py-5 sm:px-8 sm:py-6 lg:px-10">
              <h2 className="font-raf text-3xl sm:text-5xl uppercase text-white text-center">
                The Beginning
              </h2>
            </div>

            <div className="p-5 sm:p-8 lg:p-10">
              <p className="font-mono text-base sm:text-lg leading-8 text-zinc-800">
                RAF by Design or RAF for short was first formed in February
                2020 but its origin can be traced back to its creator. Known
                for saying "that's that RAF", Trexx was an artist in various
                artistic fields. Coming from a diverse influence of not only
                hip-hop but also British music culture, different forms of art
                from drawing, canvases to tags and graphic designs. Wanting to
                provide his skillset for others, RAF was launched with a single
                goal and mission in mind. To be a one-stop shop for all things
                art. From clothing to animation. To editing to music. From
                posters to one-off exclusive prints, RAF wants to be the go to
                place for artists to get what they need to up their skillset.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-black p-2 sm:gap-3 sm:p-3">
              {[
                "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788103982/vlcsnap-2026-08-30-16h23m55s332_diyrwi.png",
                "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788097776/vlcsnap-2026-08-29-17h56m32s968_e7krtt.png",
                "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788097659/vlcsnap-2026-08-29-17h52m58s468_lwhbkq.png",
              ].map((imageUrl, index) => (
                <div
                  key={imageUrl}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg"
                >
                  <img
                    src={imageUrl}
                    alt={`RAF By Design - The Beginning ${index + 1}`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </article>

          {/* 02 // WHAT WE DO NOW */}
          <article className="overflow-hidden rounded-2xl border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="bg-black px-5 py-5 sm:px-8 sm:py-6">
              <h2 className="font-raf text-3xl sm:text-5xl text-white uppercase text-center">
                What We Do Now
              </h2>
            </div>

            <div className="p-5 sm:p-8">
              <p className="text-zinc-800 font-mono text-base sm:text-lg leading-8">
                We function quite uniquely as a business as we provide both
                products and services in music with our Beat Store with Custom
                Beats and Full Production services for music production and our
                recording/editing services for music or any other type of audio.
                We also have a music shop that house all our releases from our
                artists. For design we offer a ever-growing list of services for
                graphic design from logos to banners to photo editing. We also
                provide services that suit businesses such as business cards,
                menus and social media images. Finally we have our own clothing
                sub-brand: HipHop100. Rep The Culture. Simple streetwear at
                reasonable rates check out the ever growing range.
              </p>

              <div className="mt-7 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Link
                  href="/beats"
                  className="rounded border-2 border-black bg-black px-5 py-3 text-center font-mono text-base font-black text-white hover:bg-zinc-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition"
                >
                  Beats & Audio
                </Link>

                <Link
                  href="/music"
                  className="rounded border-2 border-black bg-zinc-100 px-5 py-3 text-center font-mono text-base font-black text-zinc-800 hover:bg-zinc-200 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition"
                >
                  Music
                </Link>

                <Link
                  href="/design"
                  className="rounded border-2 border-black bg-zinc-100 px-5 py-3 text-center font-mono text-base font-black text-zinc-800 hover:bg-zinc-200 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition"
                >
                  Design
                </Link>

                <Link
                  href="/clothing/hiphop100"
                  className="rounded border-2 border-black bg-zinc-100 px-5 py-3 text-center font-mono text-base font-black text-zinc-800 hover:bg-zinc-200 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition"
                >
                  HipHop100
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-black p-2 sm:gap-3 sm:p-3">
              {[
                "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788098193/vlcsnap-2026-08-29-18h09m41s279_guflns.png",
                "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788103902/vlcsnap-2026-08-30-16h28m11s313_aq0sy7.png",
                "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788103898/vlcsnap-2026-08-30-16h22m05s577_qeemr8.png",
              ].map((imageUrl, index) => (
                <div
                  key={imageUrl}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg"
                >
                  <img
                    src={imageUrl}
                    alt={`RAF By Design - What We Do Now ${index + 1}`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </article>

          {/* 03 // THE FUTURE */}
          <article className="overflow-hidden rounded-2xl border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="bg-black px-5 py-5 sm:px-8 sm:py-6 lg:px-10">
              <h2 className="font-raf text-3xl sm:text-5xl text-white uppercase text-center">
                The Future
              </h2>
            </div>

            <div className="p-5 sm:p-8 lg:p-10">
              <p className="text-zinc-800 font-mono text-base sm:text-lg leading-8">
                We are looking to not only expand our services but to have a
                physical impact. We are looking to return to market stalls by
                January 2027, bringing an improved experience with more products
                and services but not only that, we will be looking to travel the
                UK and be a part of festivals and other events, bringing the
                brand to new places and also continuing community events. We also
                aim to expand our range of services, most notably video editing
                which will be ready in the first part of next year, to add to our
                existing services allowing us to provide more options for
                everyone. We have further long-term goals including expanding
                this website, adding apps to aid the experience as well.
                Animation and other art forms we are also looking to slowly add.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-black p-2 sm:gap-3 sm:p-3">
              {[
                "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788098220/vlcsnap-2026-08-29-18h12m50s718_roeklv.png",
                "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788098071/vlcsnap-2026-08-29-18h00m08s271_cousie.png",
                "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1788097968/vlcsnap-2026-08-30-14h35m17s053_sha6fp.png",
              ].map((imageUrl, index) => (
                <div
                  key={imageUrl}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg"
                >
                  <img
                    src={imageUrl}
                    alt={`RAF By Design - The Future ${index + 1}`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </article>
        </div>

        <footer className="mt-14 w-full border-t-4 border-black bg-black text-white">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-6 py-8 text-center sm:flex-row sm:text-left">
            <div>
              <p className="font-raf text-2xl sm:text-3xl uppercase">
                RAF BY DESIGN
              </p>
              <p className="mt-2 font-mono text-base text-zinc-200">
                One Stop Shop For All Things Art
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 sm:justify-end">
              <Link
                href="/"
                className="rounded-lg border-2 border-white/30 px-4 py-2 font-mono text-sm font-black uppercase text-white transition hover:border-white hover:bg-white hover:text-black"
              >
                Home
              </Link>

              <Link
                href="/all-about-raf"
                className="rounded-lg border-2 border-white/30 px-4 py-2 font-mono text-sm font-black uppercase text-white transition hover:border-white hover:bg-white hover:text-black"
              >
                All About RAF
              </Link>

              <Link
                href="/contact"
                className="rounded-lg border-2 border-white/30 px-4 py-2 font-mono text-sm font-black uppercase text-white transition hover:border-white hover:bg-white hover:text-black"
              >
                Contact
              </Link>
            </div>
          </div>

          <div className="border-t border-white/15 px-6 py-4 text-center">
            <p className="font-mono text-base text-zinc-300">
              © {new Date().getFullYear()} RAF By Design
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
