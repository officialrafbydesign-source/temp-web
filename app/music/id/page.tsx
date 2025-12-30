import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function BeatDetailPage({ params }: PageProps) {
  const { id } = await params;

  const beat = await prisma.beat.findUnique({
    where: { id },
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
          {beat.licenses.map((license) => (
            <li key={license.id}>
              {license.name} - ${license.price}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

