// pages/api/free-download.ts
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { beatId, email } = req.body;

    // Log the download to DB or email service here
    console.log(`Free download requested for beat ${beatId} by ${email}`);

    res.status(200).json({ success: true });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
