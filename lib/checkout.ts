// lib/checkout.ts
export async function checkout(payload: {
  productType: "beat" | "music" | "product";
  productId?: string;
  licenseId?: string;
}) {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (data.url) window.location.href = data.url;
}
