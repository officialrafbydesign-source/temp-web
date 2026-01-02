// ✅ Dynamic Prisma import to avoid Vercel build-time errors
let prisma: typeof import("@/lib/prisma").prisma | null = null;

if (typeof window === "undefined") {
  prisma = (await import("@/lib/prisma")).prisma;
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function BeatPage({ params }: PageProps) {
  if (!prisma) {
    return <div>Prisma not available at build time</div>;
  }

  const { id } = await params;

  const beat = await prisma.beat.findUnique({
    where: { id },
    include: { licenses: true },
  });

  if (!beat) {
    return <div>Beat not found</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{beat.title}</h1>
      <p className="text-gray-600 mb-4">Genre: {beat.genre || "N/A"}</p>

      <section>
        <h2 className="text-2xl font-semibold mb-2">Licenses</h2>
        {beat.licenses.length === 0 ? (
          <p>No licenses available.</p>
        ) : (
          <ul className="list-disc list-inside">
            {beat.licenses.map((license) => {
              const priceGBP = license.price ? `£${(license.price / 100).toFixed(2)}` : "Free";
              return (
                <li key={license.id}>
                  {license.name} - {priceGBP}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
