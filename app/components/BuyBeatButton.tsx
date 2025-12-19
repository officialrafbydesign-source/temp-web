"use client";
import { useState } from 'react';

export default function BuyBeatButton({ beatId, licenseId, price, beatTitle }: { beatId: string; licenseId: string; price: number; beatTitle: string }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    const res = await fetch('/api/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ beatId, licenseId, price, beatTitle }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.assign(data.url);  // Redirect to Stripe checkout
    } else {
      alert('Error: ' + data.error);
    }
    setLoading(false);
  };

  return <button onClick={handleCheckout} disabled={loading}>
    {loading ? 'Loading...' : `Buy License for $${price}`}
  </button>;
}
