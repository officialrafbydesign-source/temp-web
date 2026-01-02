import { Suspense } from "react";

let prisma: typeof import("@/lib/prisma").prisma | null = null;

// ✅ Dynamic import to prevent Vercel build-time Prisma errors
if (typeof window === "undefined") {
  prisma = (await import("@/lib/prisma")).prisma;
}

interface Props {
  params: { beatOrderId: string };
}

export default async function LicensePage({ params }: Props) {
  if (!prisma) {
    return <div>Prisma not available at build time</div>;
  }

  const order = await prisma.beatOrder.findUnique({
    where: { id: params.beatOrderId },
    include: {
      beat: true,
      license: true,
      user: true,
    },
  });

  if (!order) return <div>License not found</div>;

  // Example: if you add price in future, show in British Pounds
  // const priceGBP = order.license.price ? `£${(order.license.price / 100).toFixed(2)}` : null;

  return (
    <main>
      <h1>{order.license.name} License</h1>
      <p>Beat: {order.beat.title}</p>
      <p>Licensed to: {order.user.email}</p>
      <p>Date: {order.createdAt.toDateString()}</p>

      {/* Uncomment if you add a price field */}
      {/* {priceGBP && <p>Price: {priceGBP}</p>} */}

      <section>
        <h2>Terms</h2>
        <p>{/* license terms here */}</p>
      </section>
    </main>
  );
}
