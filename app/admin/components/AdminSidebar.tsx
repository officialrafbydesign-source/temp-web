"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "🎵 Music Admin", href: "/admin/music" },
    { name: "👕 Clothing Admin", href: "/admin/products" },
    { name: "📅 Bookings Admin", href: "/admin/bookings" },
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white flex-shrink-0 min-h-screen">
      <div className="p-6 text-2xl font-bold border-b border-gray-700">
        Admin Dashboard
      </div>

      <nav className="mt-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-6 py-3 rounded-lg mx-2 my-1 hover:bg-gray-700 transition-colors ${
              pathname === item.href ? "bg-gray-700 font-semibold" : ""
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
