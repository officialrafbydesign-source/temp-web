import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function BeatDetailPage({ params }: any) {
    const beat = await prisma.beat.findUnique({
        where: { id: params.id },
        include: { licenses: true },
    });

    if (!beat) return notFound();

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">{beat.title}</h1>

            <p className="text-gray-600">Genre: {beat.genre || "N/A"}</p>
            <p className="text-gray-600
