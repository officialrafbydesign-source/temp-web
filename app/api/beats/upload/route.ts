// app/api/beats/upload/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const bpm = Number(formData.get("bpm"));
    const key = formData.get("key") as string;
    const genre = formData.get("genre") as string;
    const licenses = JSON.parse(formData.get("licenses") as string);

    const artwork = formData.get("artwork") as File;
    const audio = formData.get("audio") as File;
    const beatFile = formData.get("beatFile") as File;

    if (!title || !artwork || !audio || !beatFile) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Ensure /public/uploads exists
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Helper to save uploaded files
    const saveFile = async (file: File) => {
      const bytes = Buffer.from(await file.arrayBuffer());
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, bytes);
      return `/uploads/${fileName}`;
    };

    // Save files
    const artworkUrl = await saveFile(artwork);
    const audioUrl = await saveFile(audio);
    const fileUrl = await saveFile(beatFile);

    // Save Beat + Licenses into Prisma
    const beat = await prisma.beat.create({
      data: {
        title,
        description,
        bpm,
        key,
        genre,
        artworkUrl,
        audioUrl,
        fileUrl,
        licenses: {
          create: licenses.map((l: any) => ({
            name: l.name,
            price: l.price,
          })),
        },
      },
      include: { licenses: true },
    });

    return NextResponse.json({ success: true, beat });
  } catch (err: any) {
    console.error("UPLOAD ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
