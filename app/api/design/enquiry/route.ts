import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import crypto from "crypto";

export const runtime = "nodejs";

function clean(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

function parseMoney(value: string): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : null;
}

function parseDateOnly(value: string): Date | null {
  if (!value) return null;

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (match) {
    return new Date(
      Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    );
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary upload credentials are missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET."
    );
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error(`"${file.name}" exceeds the 10 MB file limit.`);
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "raf-by-design/design-enquiry-references";

  const signatureBase = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto
    .createHash("sha1")
    .update(signatureBase)
    .digest("hex");

  const upload = new FormData();
  upload.append("file", file);
  upload.append("api_key", apiKey);
  upload.append("timestamp", String(timestamp));
  upload.append("folder", folder);
  upload.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    {
      method: "POST",
      body: upload,
    }
  );

  const result = await response.json();

  if (!response.ok || !result?.secure_url) {
    throw new Error(result?.error?.message || "Cloudinary upload failed.");
  }

  return result.secure_url;
}

function createTransporter() {
  const port = Number(process.env.SMTP_PORT || 587);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const email = clean(formData.get("email")).toLowerCase();
    const name = clean(formData.get("name"));
    const title = clean(formData.get("title"));
    const details = clean(formData.get("details"));
    const companyBrand = clean(formData.get("companyBrand"));

    const serviceValue =
      clean(formData.get("service")) || clean(formData.get("services"));

    const deadlineRaw = clean(formData.get("deadline"));
    const extraRevisions = clean(formData.get("extraRevisions")) === "true";
    const paymentOption = clean(formData.get("paymentOption"));
    const totalPrice = parseMoney(clean(formData.get("totalPrice")));
    const dueNow = parseMoney(clean(formData.get("dueNow")));
    const mailchimp = clean(formData.get("mailchimp")) === "true";

    if (!email || !name || !details || !serviceValue) {
      return NextResponse.json(
        {
          error:
            "Name, email, service and project details are required.",
        },
        { status: 400 }
      );
    }

    const uploadedFiles = formData
      .getAll("images")
      .filter(
        (value): value is File =>
          value instanceof File && value.size > 0
      );

    const fileUrls = await Promise.all(
      uploadedFiles.map((file) => uploadToCloudinary(file))
    );

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
      },
      create: {
        email,
        name,
      },
    });

    const enquiry = await prisma.designEnquiry.create({
      data: {
        userId: user.id,
        title: title || "Untitled Project",
        details,
        services: serviceValue
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        fileUrls,

        companyBrand: companyBrand || null,
        deadline: parseDateOnly(deadlineRaw),
        extraRevisions,
        paymentOption: paymentOption || null,
        totalPrice,
        dueNow,

        status: "new",
      },
      include: {
        user: true,
      },
    });

    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.ADMIN_EMAIL
    ) {
      const transporter = createTransporter();

      const filesHtml =
        fileUrls.length > 0
          ? `<ul>${fileUrls
              .map(
                (url, index) =>
                  `<li><a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">Reference file ${index + 1}</a></li>`
              )
              .join("")}</ul>`
          : "<p>No files uploaded.</p>";

      await transporter.sendMail({
        from: `"RAF Design Booking" <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `New Design Enquiry: ${title || "Untitled Project"}`,
        html: `
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Company / Brand:</strong> ${escapeHtml(companyBrand || "N/A")}</p>
          <p><strong>Service:</strong> ${escapeHtml(serviceValue)}</p>
          <p><strong>Requested Deadline:</strong> ${escapeHtml(deadlineRaw || "Not specified")}</p>
          <p><strong>Payment Choice:</strong> ${escapeHtml(paymentOption || "Not specified")}</p>
          <p><strong>Total:</strong> ${totalPrice === null ? "N/A" : `£${totalPrice.toFixed(2)}`}</p>
          <p><strong>Amount Due:</strong> ${dueNow === null ? "N/A" : `£${dueNow.toFixed(2)}`}</p>
          <p><strong>Project Details:</strong></p>
          <p>${escapeHtml(details).replaceAll("\n", "<br />")}</p>
          <p><strong>Uploaded Files:</strong></p>
          ${filesHtml}
        `,
      });
    }

    if (
      mailchimp &&
      process.env.MAILCHIMP_API_KEY &&
      process.env.MAILCHIMP_LIST_ID
    ) {
      try {
        const apiKey = process.env.MAILCHIMP_API_KEY;
        const dc = apiKey.split("-")[1];

        if (dc) {
          await fetch(
            `https://${dc}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}/members`,
            {
              method: "POST",
              headers: {
                Authorization: `apikey ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email_address: email,
                status: "subscribed",
                merge_fields: { FNAME: name },
              }),
            }
          );
        }
      } catch (mailchimpError) {
        console.error("Mailchimp subscription error:", mailchimpError);
      }
    }

    return NextResponse.json(
      {
        success: true,
        enquiry,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Design enquiry creation error:", err);

    return NextResponse.json(
      {
        error: err?.message || "Failed to create enquiry",
      },
      { status: 500 }
    );
  }
}