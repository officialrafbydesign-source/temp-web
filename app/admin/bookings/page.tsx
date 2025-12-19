"use client";

import { useState, useEffect } from "react";

type Booking = {
  id: string;
  service: string; // e.g., "Recording", "Mixing", "Mastering", "Graphic Design"
  clientName: string;
  email: string;
  date: string;
  status: string; // "new", "confirmed", "completed", etc.
};

export default function BookingsAdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const res = await fetch("/api/admin/bookings");
        const data = await res.json();
        setBookings(data.bookings || []); // Only the bookings part
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">📅 Bookings Admin</h1>

      {loading && <p>Loading bookings...</p>}
      {!loading && bookings.length === 0 && <p>No bookings found.</p>}

      <div className="space-y-4">
        {bookings.map((b) => (
          <div key={b.id} className="border p-4 rounded shadow">
            <p>
              <span className="font-semibold">Service:</span> {b.service}
            </p>
            <p>
              <span className="font-semibold">Client:</span> {b.clientName} ({b.email})
            </p>
            <p>
              <span className="font-semibold">Date:</span> {new Date(b.date).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">Status:</span> {b.status}
            </p>

            <div className="mt-2 space-x-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Edit
              </button>
              <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

