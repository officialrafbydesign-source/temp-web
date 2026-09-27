"use client";

export default function Footer() {
  const openCookieSettings = () => {
    window.dispatchEvent(new Event("raf-open-cookie-settings"));
  };

  return (
    <footer
      className="border-t border-red-950 mt-16"
      style={{ backgroundColor: "#1a0000" }} // darker than navbar
    >
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* TOP SECTION */}
        <div className="flex flex-col md:flex-row justify-between gap-10">

          {/* BRAND */}
          <div>
            <div className="text-white font-semibold text-sm mb-2 tracking-wide">
              RAF By Design
            </div>

            <div className="text-white/50 text-xs">
              Music • Design • Clothing
            </div>
          </div>

          {/* SOCIALS */}
          <div>
            <div className="text-white text-sm mb-3 font-medium">
              Follow
            </div>

            <div className="flex gap-5 text-white/70 text-sm">
              <a href="#" className="hover:text-white transition">
                Instagram
              </a>

              <a href="#" className="hover:text-white transition">
                YouTube
              </a>

              <a href="#" className="hover:text-white transition">
                TikTok
              </a>

              <a href="#" className="hover:text-white transition">
                Twitter
              </a>
            </div>
          </div>

          {/* EMAIL SIGNUP */}
          <div>
            <div className="text-white text-sm mb-3 font-medium">
              Join mailing list
            </div>

            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="
                  bg-black/50
                  border border-red-800
                  text-white
                  px-3 py-2
                  text-xs
                  rounded-md
                  outline-none
                  focus:border-red-600
                  transition
                "
              />

              <button
                className="
                  bg-red-800
                  hover:bg-red-700
                  text-white
                  px-4
                  py-2
                  text-xs
                  rounded-md
                  transition
                "
              >
                Join
              </button>
            </div>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="mt-10 border-t border-red-950 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/30 text-xs">
          <div>
            © 2026 RAF By Design. All rights reserved.
          </div>

          <button
            type="button"
            onClick={openCookieSettings}
            className="text-white/50 hover:text-white underline underline-offset-4 transition"
          >
            Cookie Settings
          </button>
        </div>

      </div>
    </footer>
  );
}
