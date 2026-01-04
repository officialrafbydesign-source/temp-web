export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ShopPage() {
  const products = await prisma.product.findMany({
    include: { variants: true },
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6">🎵 Music Shop</h1>
      <p className="text-gray-600 mb-8">
        Beat packs, sample kits, merch & more.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const priceGBP = product.price
            ? `£${product.price.toFixed(2)}`
            : "Free";

          return (
            <Link
              key={product.id}
              href={`/shop/${product.id}`}
              className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition bg-white"
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-64 object-cover"
              />

              <div className="p-4">
                <h2 className="font-bold text-xl">{product.name}</h2>

                <p className="text-gray-800 font-semibold mt-2">
                  From {priceGBP}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
