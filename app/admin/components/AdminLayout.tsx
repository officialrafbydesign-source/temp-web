"use client";

import React, { ReactNode, useState } from "react";
import Link from "next/link";
import AdminLogout from "./AdminLogout";

type AdminLayoutProps = {
  children: ReactNode;
  active?: string; // matches the active prop passed by pages to highlight navigation
};

export default function AdminLayout({ children, active }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/admin", key: "dashboard" },
    { name: "Beats", href: "/admin/beats", key: "beats" },
    { name: "Music Management", href: "/admin/music-management", key: "music" },
    { name: "Artists & Release Content", href: "/admin/music-hub", key: "music-hub" },
    { name: "Bookings & Enquiries", href: "/admin/bookings", key: "bookings" }, // <-- Updated path and key
    { name: "Orders", href: "/admin/orders", key: "orders" },
    { name: "Clothing Store", href: "/admin/clothing", key: "clothing" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-zinc-900 pt-24 text-white md:flex-row">
      {/* Sidebar Navigation */}
      <aside
        className="w-full bg-zinc-800 p-4 md:w-64 md:shrink-0 md:p-6"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Admin Portal</h2>
          <button
            type="button"
            aria-label="Toggle admin navigation"
            aria-expanded={sidebarOpen}
            aria-controls="admin-navigation"
            className="md:hidden text-white text-xl"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? "✖" : "☰"}
          </button>
        </div>

        <nav id="admin-navigation" className={`${sidebarOpen ? "block" : "hidden"} space-y-2 md:block`}>
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`block p-2.5 rounded font-medium transition-colors hover:bg-zinc-700 ${
                active === item.key ? "bg-red-600 text-white font-semibold" : "text-zinc-300"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Space */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Universal Topbar */}
        <header className="bg-zinc-800 p-4 flex justify-end items-center border-b border-zinc-700">
          <AdminLogout />
        </header>

        {/* Dynamic Viewport Layout */}
        <main className="flex-1 overflow-auto bg-zinc-100 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
