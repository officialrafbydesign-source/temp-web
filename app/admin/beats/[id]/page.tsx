// app/admin/beats/[id]/page.tsx
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function BeatPage({ params }: PageProps) {
  const { id } = await params;

  const beat = await prisma.beat.findUnique({
    where: { id },
    include: { licenses: true },
  });

  if (!beat) {
    return <div>Beat not found</div>;
  }

  return (
    <div>
      <h1>{beat.title}</h1>
      <p>Genre: {beat.genre}</p>
      {/* display licenses, etc */}
    </div>
  );
}
