import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET user favorites
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) return NextResponse.json({ favorites: [] });

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: { beatId: true },
  });

  return NextResponse.json({ favorites: favorites.map((f) => f.beatId) });
}

// POST toggle favorite (Add/Remove)
export async function POST(req: Request) {
  try {
    const { userId, beatId } = await req.json();

    if (!userId || !beatId) {
      return NextResponse.json({ error: "Unauthorized or missing beatId" }, { status: 400 });
    }

    const existing = await prisma.favorite.findUnique({
      where: { userId_beatId: { userId, beatId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ favorited: false });
    } else {
      await prisma.favorite.create({ data: { userId, beatId } });
      return NextResponse.json({ favorited: true });
    }
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}