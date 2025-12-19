import { prisma } from "@/lib/prisma";

export default async function LicensePage({ params }: any) {
  const order = await prisma.beatOrder.findUnique({
    where: { id: params.beatOrderId },
    include: {
      beat: true,
      license: true,
      user: true,
    },
  });

  if (!order) return <div>License not found</div>;

  return (
    <main>
      <h1>{order.license.name} License</h1>
      <p>Beat: {order.beat.title}</p>
      <p>Licensed to: {order.user.email}</p>
      <p>Date: {order.createdAt.toDateString()}</p>

      <section>
        <h2>Terms</h2>
        <p>{/* license terms here */}</p>
      </section>
    </main>
  );
}
