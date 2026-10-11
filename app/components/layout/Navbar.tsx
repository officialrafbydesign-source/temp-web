"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { UserRound } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

const beatsLinks = [
  { label: "Beat Store", href: "/beats/store" },
  { label: "Beat Services", href: "/beats/services" },
  { label: "Audio Examples", href: "/beats/services/examples" },
  { label: "Booking", href: "/beats/services/book" },
  { label: "How It Works", href: "/beats/services/how-it-works" },
];

const clothingLinks = [
  { label: "HipHop100", href: "/clothing/hiphop100" },
];

const designLinks = [
  { label: "Design Services", href: "/design/services" },
  { label: "Gallery", href: "/design/gallery" },
  { label: "Booking", href: "/design/book" },
  { label: "How It Works", href: "/design/services/how-it-works" },
];

const aboutRafLinks = [
  { label: "About Us", href: "/about" },
  { label: "What We Offer", href: "/what-we-offer" },
  { label: "Showcase", href: "/showcase" },
  { label: "How It Works", href: "/how-it-works" },
];

const HIPHOP100_LOGO_URL =
  "https://res.cloudinary.com/dcrkpsnn9/image/upload/v1787679478/hiphop100_logo_salvage_uibqte.png";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const { cart } = useCart();
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const isHipHop100 = pathname.startsWith("/clothing/hiphop100");

  const linkClasses = (href?: string) =>
    `text-white text-sm font-mono tracking-wider uppercase font-bold transition duration-200 hover:text-red-500 ${
      href && pathname === href ? "text-red-500" : ""
    }`;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 border-b-4 border-black shadow-md backdrop-blur-md bg-black/90">
      <div className="w-full mx-auto px-3 sm:px-4 xl:px-6 h-24 flex items-center justify-between relative">
        {/* LEFT SIDE: Mascot */}
        <div className="flex items-center shrink-0 z-20">
          <Link href="/" onClick={() => setMobileOpen(false)}>
            <img
              src="/images/mascot.png"
              alt="RAF Mascot"
              className="h-6 sm:h-12 xl:h-16 w-auto object-contain transition hover:scale-105"
            />
          </Link>

          {/* Desktop search opens beneath the header without moving the wordmark or links. */}
          <div className="relative hidden xl:flex items-center ml-4">
            <button
              type="button"
              onClick={() => setSearchOpen((current) => !current)}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 border-2 border-black rounded-md transition text-white/70 hover:text-white"
              title="Search Site"
              aria-label="Search site"
              aria-expanded={searchOpen}
            >
              🔍
            </button>
            {searchOpen && (
              <form onSubmit={handleSearchSubmit} className="absolute left-0 top-[calc(100%+2rem)] z-30 flex items-center w-72 rounded-md border-2 border-zinc-700 bg-black p-2 shadow-xl">
                <input type="text" placeholder="SEARCH RAF..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="min-w-0 flex-1 bg-zinc-900 border-2 border-black px-3 py-2 text-xs font-mono text-white rounded-l-md focus:outline-none focus:border-red-500" autoFocus />
                <button type="submit" className="bg-red-600 border-2 border-l-0 border-black px-3 py-2 text-xs font-mono font-bold text-black rounded-r-md uppercase hover:bg-red-500 transition">GO</button>
                <button type="button" onClick={() => setSearchOpen(false)} className="ml-2 px-1 text-zinc-400 text-xs hover:text-white" aria-label="Close search">✕</button>
              </form>
            )}
          </div>
        </div>

        {/* RAF / HIPHOP100 logo keeps its own space in the header row. */}
        <div className="flex flex-1 xl:flex-none min-w-0 items-center justify-center gap-2 mx-2 z-10 xl:ml-6 xl:mr-auto xl:shrink-0">
          {isHipHop100 ? (
            <Link
              href="/clothing/hiphop100"
              onClick={() => setMobileOpen(false)}
              className="block relative w-16 h-14 sm:w-28 sm:h-16 bg-black border-2 border-white/10 rounded-md transition hover:scale-105"
            >
              <img
                src={HIPHOP100_LOGO_URL}
                alt="HipHop100"
                className="w-full h-full object-contain p-1"
              />
            </Link>
          ) : (
            <Link href="/" onClick={() => setMobileOpen(false)} className="flex flex-col xl:flex-row items-center gap-1 xl:gap-3 transition hover:opacity-80" aria-label="RAF By Design home">
              <span className="relative block w-9 h-12 sm:w-12 sm:h-14 xl:w-14 xl:h-16 shrink-0">
                <Image src="/images/logo.png" alt="RAF By Design logo" fill priority sizes="(max-width: 639px) 36px, (max-width: 1279px) 48px, 56px" className="object-contain" />
              </span>
              <span className="font-raf whitespace-nowrap text-[10px] sm:text-xs xl:text-xl leading-tight text-white">RAF BY DESIGN</span>
            </Link>
          )}
          <button
            type="button"
            onClick={() => {
              setSearchOpen((current) => !current);
              setMobileOpen(false);
            }}
            className="xl:hidden shrink-0 p-1.5 sm:p-2 bg-zinc-900 hover:bg-zinc-800 border-2 border-black rounded-md transition text-white"
            title="Search Site"
            aria-label="Search site"
            aria-expanded={searchOpen}
          >
            🔍
          </button>

        </div>

        {/* MOBILE CONTROLS */}
        <div className="flex xl:hidden shrink-0 items-center gap-1 z-20">
          <Link
            href="/account/orders"
            onClick={() => setMobileOpen(false)}
            className={`p-1.5 sm:p-2 bg-zinc-900 hover:bg-zinc-800 border-2 border-black rounded-md transition ${
              pathname.startsWith("/account")
                ? "text-red-500"
                : "text-white"
            }`}
            title="My Account"
            aria-label="Open my account"
          >
            <UserRound className="h-4 w-4" strokeWidth={2.5} />
          </Link>

          <Link
            href="/cart"
            onClick={() => setMobileOpen(false)}
            className="relative p-1.5 sm:p-2 bg-zinc-900 hover:bg-zinc-800 border-2 border-black rounded-md transition"
            aria-label="Open cart"
          >
            <span className="text-sm">🛒</span>

            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-black text-[10px] font-mono font-black border-2 border-black w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => {
              setMobileOpen((current) => !current);
              setSearchOpen(false);
            }}
            className="p-1.5 sm:p-2 bg-zinc-900 hover:bg-zinc-800 border-2 border-black rounded-md transition text-white font-black"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* DESKTOP NAVIGATION */}
        <div className="ml-auto hidden xl:flex items-center gap-4 2xl:gap-6 shrink-0 z-10">
          {/* BEATS DROPDOWN */}
          <div className="relative group">
            <Link
              href="/beats"
              className={`${linkClasses("/beats")} flex items-center gap-1`}
            >
              Beats <span className="text-[10px]">▼</span>
            </Link>

            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute right-0 top-full pt-4 z-50">
              <div className="w-52 border-4 border-black bg-black rounded-xl shadow-[4px_4px_0px_0px_rgba(239,68,68,1)] overflow-hidden">
                {beatsLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-2.5 text-xs font-mono font-bold text-white/80 hover:bg-red-600 hover:text-white transition"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link href="/music" className={linkClasses("/music")}>
            Music
          </Link>

          {/* CLOTHING DROPDOWN */}
          <div className="relative group">
            <Link
              href="/clothing"
              className={`${linkClasses("/clothing")} flex items-center gap-1`}
            >
              Clothing <span className="text-[10px]">▼</span>
            </Link>

            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute right-0 top-full pt-4 z-50">
              <div className="w-52 border-4 border-black bg-black rounded-xl shadow-[4px_4px_0px_0px_rgba(239,68,68,1)] overflow-hidden">
                {clothingLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-2.5 text-xs font-mono font-bold text-white/80 hover:bg-red-600 hover:text-white transition"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* DESIGN DROPDOWN */}
          <div className="relative group">
            <Link
              href="/design"
              className={`${linkClasses("/design")} flex items-center gap-1`}
            >
              Design <span className="text-[10px]">▼</span>
            </Link>

            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute right-0 top-full pt-4 z-50">
              <div className="w-52 border-4 border-black bg-black rounded-xl shadow-[4px_4px_0px_0px_rgba(239,68,68,1)] overflow-hidden">
                {designLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-2.5 text-xs font-mono font-bold text-white/80 hover:bg-red-600 hover:text-white transition"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ALL ABOUT RAF DROPDOWN */}
          <div className="relative group">
            <Link
              href="/all-about-raf"
              className={`${linkClasses("/all-about-raf")} flex items-center gap-1`}
            >
              All About RAF <span className="text-[10px]">▼</span>
            </Link>

            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute right-0 top-full pt-4 z-50">
              <div className="w-52 border-4 border-black bg-black rounded-xl shadow-[4px_4px_0px_0px_rgba(239,68,68,1)] overflow-hidden">
                {aboutRafLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-2.5 text-xs font-mono font-bold text-white/80 hover:bg-red-600 hover:text-white transition"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link href="/contact" className={linkClasses("/contact")}>
            Contact
          </Link>

          {/* CUSTOMER ACCOUNT TRIGGER */}
          <Link
            href="/account/orders"
            className={`p-2 bg-zinc-900 hover:bg-zinc-800 border-2 border-black rounded-md transition ml-2 ${
              pathname.startsWith("/account")
                ? "text-red-500"
                : "text-white"
            }`}
            title="My Account"
            aria-label="Open my account"
          >
            <UserRound className="h-4 w-4" strokeWidth={2.5} />
          </Link>

          {/* SHOPPING CART TRIGGER */}
          <Link
            href="/cart"
            className="relative p-2 bg-zinc-900 hover:bg-zinc-800 border-2 border-black rounded-md transition group"
          >
            <span className="text-sm">🛒</span>

            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-black text-[10px] font-mono font-black border-2 border-black w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* MOBILE SEARCH PANEL */}
        {searchOpen && (
          <div className="xl:hidden absolute left-0 right-0 top-full border-t-2 border-black bg-black/95 p-3 shadow-lg">
            <form onSubmit={handleSearchSubmit} className="flex items-center w-full">
              <input
                type="text"
                placeholder="SEARCH RAF..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="min-w-0 flex-1 bg-zinc-900 border-2 border-black px-3 py-2 text-sm font-mono text-white rounded-l-md focus:outline-none focus:border-red-500"
                autoFocus
              />

              <button
                type="submit"
                className="bg-red-600 border-2 border-l-0 border-black px-4 py-2 text-sm font-mono font-bold text-black rounded-r-md uppercase hover:bg-red-500 transition"
              >
                GO
              </button>

              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="ml-2 px-2 py-2 text-zinc-400 hover:text-white font-bold"
                aria-label="Close search"
              >
                ✕
              </button>
            </form>
          </div>
        )}

        {/* MOBILE NAVIGATION MENU */}
        {mobileOpen && (
          <div className="xl:hidden absolute left-0 right-0 top-full max-h-[calc(100vh-6rem)] overflow-y-auto border-t-2 border-black bg-black/95 shadow-xl">
            <div className="p-4 space-y-5">
              <div>
                <Link
                  href="/beats"
                  onClick={() => setMobileOpen(false)}
                  className="block text-base font-mono font-black uppercase text-red-500"
                >
                  Beats
                </Link>
                <div className="mt-2 grid grid-cols-1 gap-1 border-l-2 border-red-600 pl-3">
                  {beatsLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="py-2 text-sm font-mono font-bold uppercase text-white/80 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                href="/music"
                onClick={() => setMobileOpen(false)}
                className="block py-1 text-base font-mono font-black uppercase text-white hover:text-red-500"
              >
                Music
              </Link>

              <div>
                <Link
                  href="/clothing"
                  onClick={() => setMobileOpen(false)}
                  className="block text-base font-mono font-black uppercase text-white hover:text-red-500"
                >
                  Clothing
                </Link>
                <div className="mt-2 grid grid-cols-1 gap-1 border-l-2 border-red-600 pl-3">
                  {clothingLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="py-2 text-sm font-mono font-bold uppercase text-white/80 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <Link
                  href="/design"
                  onClick={() => setMobileOpen(false)}
                  className="block text-base font-mono font-black uppercase text-white hover:text-red-500"
                >
                  Design
                </Link>
                <div className="mt-2 grid grid-cols-1 gap-1 border-l-2 border-red-600 pl-3">
                  {designLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="py-2 text-sm font-mono font-bold uppercase text-white/80 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <Link
                  href="/all-about-raf"
                  onClick={() => setMobileOpen(false)}
                  className="block text-base font-mono font-black uppercase text-white hover:text-red-500"
                >
                  All About RAF
                </Link>
                <div className="mt-2 grid grid-cols-1 gap-1 border-l-2 border-red-600 pl-3">
                  {aboutRafLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="py-2 text-sm font-mono font-bold uppercase text-white/80 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="block py-1 text-base font-mono font-black uppercase text-white hover:text-red-500"
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );

}
