// app/components/layout/header.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-black/40 backdrop-blur-md text-white px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      
      <Link href="/" className="text-2xl font-bold">
        RAF By Design
      </Link>

      {/* Desktop Menu */}
      <nav className="hidden md:flex gap-8 text-gray-300">
        <Link href="/">Home</Link>
        <Link href="/admin/music-management">Music Management</Link>
        <Link href="/cart">Cart</Link>
        <Link href="/checkout">Checkout</Link>
        <Link href="/orders">Orders</Link>
      </nav>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-gray-300"
        onClick={() => setOpen(!open)}
      >
        ☰
      </button>

      {/* Mobile Dropdown */}
      {open && (
        <nav className="absolute top-16 right-6 bg-gray-800 text-white rounded-lg p-4 flex flex-col gap-4 md:hidden shadow-xl">
          <Link href="/" onClick={() => setOpen(false)}>Home</Link>
          <Link href="/admin/music-management" onClick={() => setOpen(false)}>Music Management</Link>
          <Link href="/cart" onClick={() => setOpen(false)}>Cart</Link>
          <Link href="/checkout" onClick={() => setOpen(false)}>Checkout</Link>
          <Link href="/orders" onClick={() => setOpen(false)}>Orders</Link>
        </nav>
      )}
    </header>
  );
}
