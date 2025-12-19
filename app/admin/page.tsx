// app/admin/page.tsx
"use client";

export default function AdminHome() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <p className="text-gray-600">
        Select a section from the sidebar to manage Beats, Products, Design, or Bookings.
      </p>
    </div>
  );
}
