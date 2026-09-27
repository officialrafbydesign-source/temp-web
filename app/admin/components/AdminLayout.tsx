"use client";

import React, { ReactNode, useState } from "react";
import Link from "next/link";
import AdminLogout from "./AdminLogout";

type AdminLayoutProps = {
  children: ReactNode;
  active?: string; // matches the active prop passed by pages to highlight navigation
};

export default function AdminLayout({ children, active }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { name: "Dashboard", href: "/admin", key: "dashboard" },
    { name: "Beats", href: "/admin/beats", key: "beats" },
    { name: "Music Management", href: "/admin/music-management", key: "music" },
    { name: "Bookings & Enquiries", href: "/admin/bookings", key: "bookings" }, // <-- Updated path and key
    { name: "Orders", href: "/admin/orders", key: "orders" },
    { name: "Clothing Store", href: "/admin/clothing", key: "clothing" },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-900 text-white">
      {/* Sidebar Navigation */}
      <aside
        className={`bg-zinc-800 w-64 p-6 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-64"
        }`}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Admin Portal</h2>
          <button
            className="md:hidden text-white text-xl"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? "✖" : "☰"}
          </button>
        </div>

        <nav className="space-y-2">
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
      <div className="flex-1 flex flex-col">
        {/* Universal Topbar */}
        <header className="bg-zinc-800 p-4 flex justify-end items-center border-b border-zinc-700">
          <AdminLogout />
        </header>

        {/* Dynamic Viewport Layout */}
        <main className="flex-1 p-6 overflow-auto bg-zinc-100">{children}</main>
      </div>
    </div>
  );
}