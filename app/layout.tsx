import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CookieConsent from "@/components/layout/CookieConsent";
import BottomPlayer from "@/components/player/BottomPlayer";

import {
  CartProvider,
} from "@/app/context/CartContext";

import "./globals.css";

export const metadata: Metadata = {
  title:
    "RAF By Design",

  description:
    "Music, clothing, and digital products",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="min-h-screen text-white flex flex-col bg-black antialiased selection:bg-red-600 selection:text-black">
        <CartProvider>
          <Navbar />

          <main className="relative z-10 flex-grow w-full">
            {children}
          </main>

          <Footer />

          <BottomPlayer />

          <CookieConsent />
        </CartProvider>
      </body>
    </html>
  );
}