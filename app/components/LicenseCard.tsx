"use client";

interface License {
  id: string;
  name: string;
  price: number;
}

interface Beat {
  id: string;
}

interface LicenseCardProps {
  beat: Beat;
  license: License;
}

export default function LicenseCard({ beat, license }: LicenseCardProps) {
  const handleBuy = async () => {
    console.log("Starting checkout for beat:", beat.id, "license:", license.id);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          beatId: beat.id,
          licenseId: license.id,
        }),
      });

      const data = await res.json();
      console.log("Checkout response:", data);

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Checkout failed. See console for details.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Checkout failed due to network/server error.");
    }
  };

  return (
    <div className="border p-4 rounded-lg shadow">
      <h3 className="text-xl font-bold">{license.name}</h3>
      <p className="text-gray-700 mb-3">${license.price}</p>

      <button
        onClick={handleBuy}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
      >
        Buy License
      </button>
    </div>
  );
}
