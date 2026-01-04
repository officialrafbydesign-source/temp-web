export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: { id: string };
};

export default async function MusicDetailPage({ params }: PageProps) {
  const { id } = params;

  if (!id) {
    return <div>Invalid music ID</div>;
  }

  const beat = await prisma.beat.findUnique({
    where: { id }, // ✅ must provide unique identifier
    include: { licenses: true },
  });

  if (!beat) return notFound();

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">{beat.title}</h1>

      <p className="text-gray-600">Genre: {beat.genre || "N/A"}</p>

      <div className="mt-4">
        <h2 className="text-2xl font-semibold mb-2">Licenses</h2>
        <ul className="list-disc list-inside">
          {beat.licenses.map((license) => {
            const priceGBP = license.price
              ? `£${(license.price / 100).toFixed(2)}`
              : "Free";
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
