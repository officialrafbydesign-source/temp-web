"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
};

type Service = {
  id: string;
  name: string;
  price: number;
};

type Booking = {
  id: string;
  user: User;
  service: Service;
  date: string;
  status: string;
};

type DesignEnquiry = {
  id: string;
  user: User;
  title: string;
  details: string;
  fileUrl?: string;
  status: string;
};

export default function BookingsAdmin() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [enquiries, setEnquiries] = useState<DesignEnquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/bookings");
        const data = await res.json();
        setBookings(data.bookings);
        setEnquiries(data.designEnquiries);
      } catch (err) {
        console.error("Failed to fetch bookings/enquiries:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🗓️ Bookings & Design Enquiries Admin</h1>

      {loading && <p>Loading data...</p>}

      {!loading && (
        <>
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Music Service Bookings</h2>
            {bookings.length === 0 ? (
              <p>No bookings found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookings.map((b) => (
                  <div key={b.id} className="border rounded-lg p-4 shadow">
                    <p><strong>User:</strong> {b.user.name} ({b.user.email})</p>
                    <p><strong>Service:</strong> {b.service.name}</p>
                    <p><strong>Date:</strong> {new Date(b.date).toLocaleString()}</p>
                    <p><strong>Status:</strong> {b.status}</p>
                    <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                      Update
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Graphic Design Enquiries</h2>
            {enquiries.length === 0 ? (
              <p>No enquiries found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {enquiries.map((e) => (
                  <div key={e.id} className="border rounded-lg p-4 shadow">
                    <p><strong>User:</strong> {e.user.name} ({e.user.email})</p>
                    <p><strong>Title:</strong> {e.title}</p>
                    <p><strong>Details:</strong> {e.details}</p>
                    {e.fileUrl && (
                      <p>
                        <a href={e.fileUrl} target="_blank" className="text-blue-600 underline">
                          View File
                        </a>
                      </p>
                    )}
                    <p><strong>Status:</strong> {e.status}</p>
                    <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                      Update
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
