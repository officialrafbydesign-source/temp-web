import { NextResponse } from "next/server";
import { Resend } from "resend";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authorizeAdminApi } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

const userSelect = { id: true, name: true, email: true } as const;
const areas = new Set(["MUSIC", "DESIGN"]);
const dayStatuses = new Set(["TRANSPARENT", "GREEN", "AMBER", "RED"]);

function respond(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

function value(input: unknown, max = 1000): string {
  return typeof input === "string" ? input.trim().slice(0, max) : "";
}

function optional(input: unknown, max = 1000): string | null {
  return value(input, max) || null;
}

function dateOnly(input: unknown): Date | null {
  const text = value(input, 40);
  if (!text) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!match) throw new Error("INVALID_DATE");
  const date = new Date(Date.UTC(+match[1], +match[2] - 1, +match[3]));
  if (date.toISOString().slice(0, 10) !== text) throw new Error("INVALID_DATE");
  return date;
}

function money(input: unknown): number | null {
  if (input === "" || input === null || input === undefined) return null;
  const amount = Number(input);
  if (!Number.isFinite(amount) || amount < 0 || amount > 1000000) {
    throw new Error("INVALID_PRICE");
  }
  return Math.round(amount * 100) / 100;
}

function fields(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("INVALID_DATA");
  }
  return input as Record<string, unknown>;
}

export async function GET() {
  const auth = await authorizeAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const [bookings, designEnquiries, bookingDays] = await Promise.all([
      prisma.booking.findMany({
        orderBy: { createdAt: "desc" },
        include: { user: { select: userSelect }, service: true, payments: true },
      }),
      prisma.designEnquiry.findMany({
        orderBy: { createdAt: "desc" },
        include: { user: { select: userSelect }, payments: true },
      }),
      prisma.bookingDay.findMany({ orderBy: { date: "asc" } }),
    ]);
    return respond({ bookings, designEnquiries, bookingDays });
  } catch (error) {
    console.error("GET /api/admin/bookings error:", error);
    return respond({ error: "Unable to load bookings" }, 500);
  }
}

export async function POST(req: Request) {
  const auth = await authorizeAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const body = fields(await req.json());
    const date = dateOnly(body.date);
    const area = value(body.area, 20);
    const status = value(body.status, 20);
    const note = optional(body.note, 1000);

    if (!date || !areas.has(area) || !dayStatuses.has(status)) {
      return respond({ error: "Invalid date, area or availability" }, 400);
    }

    const bookingDay = await prisma.bookingDay.upsert({
      where: { date_area: { date, area } },
      update: { status, note },
      create: { date, area, status, note },
    });
    return respond({ bookingDay });
  } catch (error) {
    if (error instanceof Error && ["INVALID_DATE", "INVALID_DATA"].includes(error.message)) {
      return respond({ error: "Invalid calendar entry" }, 400);
    }
    console.error("POST /api/admin/bookings error:", error);
    return respond({ error: "Unable to save availability" }, 500);
  }
}

export async function PATCH(req: Request) {
  const auth = await authorizeAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const body = fields(await req.json());
    const kind = value(body.kind, 20);
    const id = value(body.id, 100);
    const action = value(body.action, 20);

    if (!id || !["music", "design"].includes(kind) ||
        !["update", "approve", "reject", "email"].includes(action)) {
      return respond({ error: "Invalid request action" }, 400);
    }

    if (action === "email") {
      const subject = value(body.subject, 200);
      const message = value(body.message, 10000);
      if (!subject || !message) return respond({ error: "Subject and message are required" }, 400);

      const request = kind === "music"
        ? await prisma.booking.findUnique({ where: { id }, select: { user: { select: userSelect } } })
        : await prisma.designEnquiry.findUnique({ where: { id }, select: { user: { select: userSelect } } });
      if (!request) return respond({ error: "Request not found" }, 404);

      const from = process.env.RESEND_FROM_EMAIL;
      const key = process.env.RESEND_API_KEY;
      if (!from || !key) return respond({ error: "Email is not configured" }, 503);
      const sent = await new Resend(key).emails.send({
        from, to: [request.user.email], subject, text: message,
      });
      if (sent.error) {
        console.error("Booking email error:", sent.error);
        return respond({ error: "Email could not be sent" }, 502);
      }
      return respond({ sentTo: request.user.email });
    }

    if (action === "approve" || action === "reject") {
      const approved = action === "approve";
      if (approved && kind === "design") {
        const request = await prisma.designEnquiry.findUnique({
          where: { id }, select: { status: true },
        });
        if (!request) return respond({ error: "Request not found" }, 404);
        if (request.status === "awaiting_payment") {
          return respond({ error: "Wait for the checkout payment before approving" }, 409);
        }
      }
      if (!approved) {
        const active = await prisma.servicePayment.count({
          where: {
            ...(kind === "music" ? { bookingId: id } : { designEnquiryId: id }),
            status: { in: ["sent", "paid"] },
          },
        });
        if (active) return respond({ error: "Resolve the payment or refund in Stripe before rejecting" }, 409);
      }
      const data = {
        status: approved ? "approved" : "rejected",
        approvedAt: approved ? new Date() : null,
        rejectedAt: approved ? null : new Date(),
      };
      const updated = kind === "music"
        ? await prisma.booking.update({ where: { id }, data })
        : await prisma.designEnquiry.update({ where: { id }, data });
      return respond({ request: updated });
    }

    const input = fields(body.data);
    if (kind === "music") {
      const update: Prisma.BookingUncheckedUpdateInput = {
        date: dateOnly(input.date),
        companyBrand: optional(input.companyBrand, 150),
        projectType: optional(input.projectType, 150),
        musicTypes: value(input.musicTypes, 1000).split(",").map((part) => part.trim()).filter(Boolean),
        referenceLinks: optional(input.referenceLinks, 3000),
        deadlineText: optional(input.deadlineText, 100),
        recordingHours: optional(input.recordingHours, 100),
        recordingDate: dateOnly(input.recordingDate),
        editOptions: optional(input.editOptions, 1000),
        editDetails: optional(input.editDetails, 10000),
        inStudioSession: optional(input.inStudioSession, 100),
        studioSessionDate: dateOnly(input.studioSessionDate),
        otherAudioService: optional(input.otherAudioService, 150),
        projectDescription: optional(input.projectDescription, 10000),
        adminNotes: optional(input.adminNotes, 10000),
      };
      const serviceName = value(input.serviceType, 150);
      if (serviceName) {
        const service = await prisma.musicService.findFirst({
          where: { name: { equals: serviceName, mode: "insensitive" } },
        }) ?? await prisma.musicService.create({ data: { name: serviceName, price: 0 } });
        update.serviceId = service.id;
      }
      const updated = await prisma.booking.update({ where: { id }, data: update });
      return respond({ request: updated });
    }

    const update: Prisma.DesignEnquiryUncheckedUpdateInput = {
      title: value(input.title, 200) || "Untitled Project",
      details: value(input.details, 10000),
      services: value(input.services, 2000).split(",").map((part) => part.trim()).filter(Boolean),
      companyBrand: optional(input.companyBrand, 150),
      deadline: dateOnly(input.deadline),
      extraRevisions: input.extraRevisions === true,
      paymentOption: optional(input.paymentOption, 30),
      totalPrice: money(input.totalPrice),
      dueNow: money(input.dueNow),
      adminNotes: optional(input.adminNotes, 10000),
    };
    const updated = await prisma.designEnquiry.update({ where: { id }, data: update });
    return respond({ request: updated });
  } catch (error) {
    if (error instanceof Error && ["INVALID_DATE", "INVALID_DATA", "INVALID_PRICE"].includes(error.message)) {
      return respond({ error: "Invalid request details" }, 400);
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return respond({ error: "Request not found" }, 404);
    }
    console.error("PATCH /api/admin/bookings error:", error);
    return respond({ error: "Unable to update request" }, 500);
  }
}
