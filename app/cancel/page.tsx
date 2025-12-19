// app/cancel.tsx
"use client";

export default function CancelPage() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">❌ Payment Cancelled</h1>
      <p>Your payment was cancelled. If you want to try again, you can go back to your <a href="/cart" className="text-blue-500">cart</a>.</p>
    </div>
  );
}
