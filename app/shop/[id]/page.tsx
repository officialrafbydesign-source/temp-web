// app/shop/[id]/page.tsx
import { notFound } from "next/navigation";

// ✅ Dynamic Prisma import to avoid Vercel build-time errors
let prisma: typeof import("@/lib/prisma").prisma | null = null;

if (typeof window === "undefined") {
  prisma = (await import("@/lib/prisma")).prisma;
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ShopProductPage({ params }: PageProps) {
  if (!prisma) {
    return <div>Prisma not available at build time</div>;
  }

  const { id } = await params;

  const product = await prisma.beat.findUnique({
    where: { id },
    include: { licenses: true },
  });

  if (!product) return notFound();

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">{product.title}</h1>

      <p className="text-gray-600">Genre: {product.genre || "N/A"}</p>

      <div className="mt-4">
        <h2 className="text-2xl font-semibold mb-2">Licenses</h2>
        <ul className="list-disc list-inside">
          {product.licenses.map((license) => {
            const priceGBP = license.price ? `£${(license.price / 100).toFixed(2)}` : "Free";
            return (
              <li key={license.id}>
                {license.name} - {priceGBP}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
