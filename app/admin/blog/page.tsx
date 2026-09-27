// File: app/admin/blog/page.tsx
"use client";

import AdminLogout from "@/components/AdminLogout";

export default function BlogAdminPage() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">📝 Blog Admin</h1>
        <AdminLogout />
      </div>

      <p className="mt-6">No blog posts found.</p>
    </div>
  );
}
