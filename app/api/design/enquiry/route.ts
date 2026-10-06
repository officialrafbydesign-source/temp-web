import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { getBillingStripe } from "@/lib/serviceBilling";
import { priceDesignSelection } from "@/lib/designPricing";
import { uploadPrivateReference } from "@/lib/privateReference";

export const runtime = "nodejs";

function clean(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") return "";
  return value.trim();
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
  if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
    throw new Error("INVALID_REFERENCE_FORMAT");
  }
  return uploadPrivateReference(file, "raf-by-design/design-enquiry-references", 3 * 1024 * 1024);
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
    if (Number(req.headers.get("content-length") || 0) > 4 * 1024 * 1024) {
      return NextResponse.json({ error: "Attachments must total under 3 MB." }, { status: 413 });
    }
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

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        name.length > 100 || details.length > 10000 ||
        !["deposit", "full"].includes(paymentOption)) {
      return NextResponse.json({ error: "Check your contact details and payment choice." }, { status: 400 });
    }

    let price: ReturnType<typeof priceDesignSelection>;
    try {
      price = priceDesignSelection({
        serviceId: clean(formData.get("serviceId")),
        optionIndex: Number(clean(formData.get("optionIndex"))),
        photoCount: Number(clean(formData.get("photoCount"))),
        advertPhotoCount: Number(clean(formData.get("advertPhotoCount"))),
        photoAddOns: {
          colourTone: clean(formData.get("colourTone")) === "true",
          singleColour: clean(formData.get("singleColour")) === "true",
          customEditing: clean(formData.get("customEditing")) === "true",
        },
        extraRevisions,
      });
    } catch {
      return NextResponse.json({ error: "Choose a valid design service." }, { status: 400 });
    }

    const totalPrice = price.requiresQuote ? null : price.totalPence / 100;
    const amountPence = price.requiresQuote ? null :
      paymentOption === "full" ? price.totalPence : Math.ceil(price.totalPence / 2);
    const dueNow = amountPence === null ? null : amountPence / 100;

    const uploadedFiles = formData
      .getAll("images")
      .filter(
        (value): value is File =>
          value instanceof File && value.size > 0
      );

    if (uploadedFiles.length > 5 ||
        uploadedFiles.some((file) => file.size > 3 * 1024 * 1024) ||
        uploadedFiles.reduce((total, file) => total + file.size, 0) > 3 * 1024 * 1024) {
      return NextResponse.json({ error: "Use up to five reference images/PDFs totalling 3 MB." }, { status: 413 });
    }

    const fileUrls = await Promise.all(
      uploadedFiles.map((file) => uploadToCloudinary(file))
    );

    // A public form must not rename an existing account by submitting its email.
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } }) ||
      await prisma.user.create({ data: { email, name }, select: { id: true } });

    const enquiry = await prisma.designEnquiry.create({
      data: {
        userId: user.id,
        title: title || "Untitled Project",
        details,
        services: [price.description],
        fileUrls,

        companyBrand: companyBrand || null,
        deadline: parseDateOnly(deadlineRaw),
        extraRevisions,
        paymentOption: price.requiresQuote ? "quote" : paymentOption,
        totalPrice,
        dueNow,

        status: price.requiresQuote ? "new" : "awaiting_payment",
      },
      select: { id: true },
    });

    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.ADMIN_EMAIL
    ) {
      const transporter = createTransporter();

      const filesHtml = fileUrls.length > 0
        ? `<p>${fileUrls.length} private reference file(s). Open them from the admin bookings page.</p>`
        : "<p>No files uploaded.</p>";

      await transporter.sendMail({
        from: `"RAF Design Booking" <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `New Design Enquiry: ${title || "Untitled Project"}`,
        html: `
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Company / Brand:</strong> ${escapeHtml(companyBrand || "N/A")}</p>
          <p><strong>Service:</strong> ${escapeHtml(price.description)}</p>
          <p><strong>Requested Deadline:</strong> ${escapeHtml(deadlineRaw || "Not specified")}</p>
          <p><strong>Payment Choice:</strong> ${escapeHtml(paymentOption || "Not specified")}</p>
          <p><strong>Total:</strong> ${totalPrice === null ? "N/A" : `£${totalPrice.toFixed(2)}`}</p>
          <p><strong>Amount Due:</strong> ${dueNow === null ? "N/A" : `£${dueNow.toFixed(2)}`}</p>
          <p><strong>Project Details:</strong></p>
          <p>${escapeHtml(details).replaceAll("\n", "<br />")}</p>
          <p><strong>Uploaded Files:</strong></p>
          ${filesHtml}
        `,
      }).catch((error) => {
        console.error("Design admin notification failed:", error);
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
                status: "pending",
                merge_fields: { FNAME: name },
              }),
            }
          );
        }
      } catch (mailchimpError) {
        console.error("Mailchimp subscription error:", mailchimpError);
      }
    }

    let checkoutUrl: string | null = null;
    if (amountPence !== null) {
      const payment = await prisma.servicePayment.create({
        data: {
          designEnquiryId: enquiry.id,
          stage: paymentOption === "full" ? "full" : "deposit",
          amount: amountPence,
          totalAmount: price.totalPence,
        },
      });
      const stripe = getBillingStripe();
      const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.rafbydesign.co.uk").replace(/\/$/, "");
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: email,
        line_items: [{
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: amountPence,
            product_data: { name: `${price.service.title} — ${paymentOption === "full" ? "full payment" : "50% deposit"}` },
          },
        }],
        metadata: { servicePaymentId: payment.id },
        success_url: `${siteUrl}/design/book?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/design/book?payment=cancelled`,
      }, { idempotencyKey: `design-checkout-${payment.id}` });
      await prisma.servicePayment.update({
        where: { id: payment.id },
        data: { stripeSessionId: session.id },
      });
      checkoutUrl = session.url;
      if (!checkoutUrl) throw new Error("Stripe did not return a payment link");
    }

    return NextResponse.json({ success: true, enquiryId: enquiry.id, checkoutUrl },
      { status: 201, headers: { "Cache-Control": "private, no-store" } });
  } catch (err: unknown) {
    console.error("Design enquiry creation error:", err);

    return NextResponse.json(
      { error: "The design request could not be submitted. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId || !/^cs_(?:test|live)_[A-Za-z0-9_]+$/.test(sessionId)) {
    return NextResponse.json({ error: "Invalid checkout session" }, { status: 400 });
  }
  try {
    const payment = await prisma.servicePayment.findUnique({
      where: { stripeSessionId: sessionId },
      select: { id: true, amount: true, status: true },
    });
    if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    const session = await getBillingStripe().checkout.sessions.retrieve(sessionId);
    if (session.metadata?.servicePaymentId !== payment.id ||
        session.amount_total !== payment.amount ||
        session.currency?.toLowerCase() !== "gbp") {
      return NextResponse.json({ error: "Payment does not match this request" }, { status: 400 });
    }
    return NextResponse.json({ paid: payment.status === "paid" && session.payment_status === "paid" },
      { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("GET /api/design/enquiry error:", error);
    return NextResponse.json({ error: "Unable to check payment" }, { status: 500 });
  }
}
