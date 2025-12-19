import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import AddMusicToCartButton from "./AddMusicToCartButton";

export default async function ProductPage({ params }: any) {
  const product = await prisma.musicProduct.findUnique({
    where: { id: params.id },
  });

  if (!product) return notFound();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Cover Art */}
        <div>
          <img
            src={product.coverUrl}
            alt={product.title}
            className="w-full rounded shadow"
          />
        </div>

        {/* Info */}
        <div>
          <h1 className="text-4xl font-bold mb-2">{product.title}</h1>
          <p className="text-gray-600 text-lg mb-4">By {product.artist}</p>

          <p className="text-3xl font-bold mb-6">£{product.price.toFixed(2)}</p>

          {/* Add to Cart BUTTON (client component) */}
          <AddMusicToCartButton product={product} />

          <p className="text-gray-700 mt-10">
            {product.description || "No description available for this product."}
          </p>
        </div>
      </div>
    </div>
  );
}

