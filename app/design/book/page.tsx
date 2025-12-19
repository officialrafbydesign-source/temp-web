"use client";

import { useState } from "react";

export default function DesignBookingPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function submitBooking(e: any) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const formData = {
      name: e.target.name.value,
      email: e.target.email.value,
      title: e.target.title.value,
      details: e.target.details.value,
    };

    const res = await fetch("/api/design/enquiry", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setStatus("success");
      e.target.reset();
    } else {
      setStatus("error");
    }

    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-4">📩 Design Booking</h1>
      <p className="text-gray-600 mb-6">
        Fill out the form below to request artwork or design services.
      </p>

      <form onSubmit={submitBooking} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          className="w-full border p-3 rounded"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Your Email"
          className="w-full border p-3 rounded"
          required
        />

        <input
          type="text"
          name="title"
          placeholder="Project Title"
          className="w-full border p-3 rounded"
        />

        <textarea
          name="details"
          placeholder="Describe your project..."
          className="w-full h-32 border p-3 rounded"
          required
        />

        <button
          type="submit"
          className="bg-blue-600 text-white w-full py-3 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Sending..." : "Submit Request"}
        </button>
      </form>

      {status === "success" && (
        <p className="text-green-600 mt-4">Your request has been sent!</p>
      )}
      {status === "error" && (
        <p className="text-red-600 mt-4">
          Something went wrong. Please try again.
        </p>
      )}
    </div>
  );
}
