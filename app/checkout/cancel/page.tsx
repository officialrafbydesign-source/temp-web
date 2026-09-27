"use client";

import Link from "next/link";

export default function CheckoutSuccessPage() {

  return (

    <main className="max-w-3xl mx-auto px-6 py-24 text-center text-white">

      <h1 className="text-4xl font-bold mb-6">
        Payment Successful
      </h1>

      <p className="text-white/70 mb-8">
        Thank you for your purchase.
        Your beat will be available for download soon.
      </p>

      <Link
        href="/beats/store"
        className="
          inline-block
          bg-red-600
          hover:bg-red-700
          px-6 py-3
          rounded-lg
          font-semibold
        "
      >
        Back to Beat Store
      </Link>

    </main>

  );
}