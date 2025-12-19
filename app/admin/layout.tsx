"use client";

import { useState, useEffect } from "react";

type DesignEnquiry = {
  id: string;
  projectName: string;
  clientName: string;
  email: string;
  details: string;
  status: string; // "new", "in-progress", "completed", etc.
  createdAt: string;
};

export default function DesignAdminPage() {
  const [enquiries, setEnquiries] = useState<DesignEnquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEnquiries() {
      try {
        const res = await fetch("/api/admin/bookings");
        const data = await res.json();
        setEnquiries(data.designEnquiries || []); // Only the design enquiries part
      } catch (err) {
        console.error("Failed to fetch design enquiries:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEnquiries();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🎨 Graphic Design Admin</h1>

      {loading && <p>Loading design enquiries...</p>}
      {!loading && enquiries.length === 0 && <p>No design enquiries found.</p>}

      <div className="space-y-4">
        {enquiries.map((e) => (
          <div key={e.id} className="border p-4 rounded shadow">
            <p>
              <span className="font-semibold">Project:</span> {e.projectName}
            </p>
            <p>
              <span className="font-semibold">Client:</span> {e.clientName} ({e.email})
            </p>
            <p>
              <span className="font-semibold">Details:</span> {e.details}
            </p>
            <p>
              <span className="font-semibold">Status:</span> {e.status}
            </p>
            <p>
              <span className="font-semibold">Submitted:</span>{" "}
              {new Date(e.createdAt).toLocaleString()}
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
