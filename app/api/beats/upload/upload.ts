import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma"; // your Prisma client
import formidable from "formidable";
import fs from "fs";
import path from "path";

// Disable Next.js default body parser
export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "File upload failed" });

    const { title, bpm, genre, tags } = fields;
    const previewFile = files.preview as formidable.File;
    const fullFile = files.fullFile as formidable.File;

    // For now, save files locally. Later, replace with S3 upload
    const previewDest = path.join(process.cwd(), "public/uploads", previewFile.name);
    const fullDest = path.join(process.cwd(), "public/uploads", fullFile.name);
    fs.copyFileSync(previewFile.filepath, previewDest);
    fs.copyFileSync(fullFile.filepath, fullDest);

    try {
      const beat = await prisma.beat.create({
        data: {
          title: String(title),
          bpm: bpm ? Number(bpm) : null,
          genre: genre ? String(genre) : null,
          tags: String(tags).split(",").map(t => t.trim()),
          previewUrl: `/uploads/${previewFile.name}`,
          fullFileUrl: `/uploads/${fullFile.name}`,
          userId: "replace-with-admin-user-id",
        },
      });
      res.status(200).json({ beat });
    } catch (e) {
      res.status(500).json({ error: "Database error" });
    }
  });
}
