import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { authorizeAdminApi } from "@/lib/adminApi";
import { prisma } from "@/lib/prisma";
import { sendServiceInvoice } from "@/lib/serviceBilling";

export const dynamic = "force-dynamic";

function respond(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function POST(req: Request) {
  const auth = await authorizeAdminApi();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const kind = body?.kind;
    const id = body?.id;
    const stage = body?.stage;
    if (!["music", "design"].includes(kind) || typeof id !== "string" ||
        id.length > 100 || !["deposit", "balance"].includes(stage)) {
      return respond({ error: "Invalid service payment request" }, 400);
    }

    const request = kind === "music"
      ? await prisma.booking.findUnique({
          where: { id }, include: { user: { select: { name: true, email: true } }, service: true },
        })
      : await prisma.designEnquiry.findUnique({
          where: { id }, include: { user: { select: { name: true, email: true } } },
        });
    if (!request) return respond({ error: "Request not found" }, 404);
    if (request.status !== "approved") {
      return respond({ error: "Approve and confirm the request before invoicing" }, 409);
    }

    const where = kind === "music" ? { bookingId: id } : { designEnquiryId: id };
    const previous = await prisma.servicePayment.findMany({ where });
    if (previous.some((payment) => payment.stage === "full" && payment.status === "paid")) {
      return respond({ error: "This service was already paid in full" }, 409);
    }

    let amount: number;
    let totalAmount: number;
    if (stage === "deposit") {
      const pounds = Number(body.totalPrice);
      if (!Number.isFinite(pounds) || pounds < 1 || pounds > 100000 ||
          Math.round(pounds * 100) !== pounds * 100) {
        return respond({ error: "Enter an agreed total in pounds and pence" }, 400);
      }
      totalAmount = Math.round(pounds * 100);
      amount = Math.ceil(totalAmount / 2);
    } else {
      const deposit = previous.find((payment) => payment.stage === "deposit");
      if (!deposit || deposit.status !== "paid") {
        return respond({ error: "The deposit must be paid before invoicing the balance" }, 409);
      }
      totalAmount = deposit.totalAmount;
      amount = totalAmount - deposit.amount;
      if (amount <= 0) return respond({ error: "No balance remains" }, 409);
    }

    let payment = previous.find((entry) => entry.stage === stage);
    if (payment && (payment.amount !== amount || payment.totalAmount !== totalAmount)) {
      return respond({ error: "An invoice already exists with a different amount" }, 409);
    }
    if (!payment) {
      try {
        payment = await prisma.servicePayment.create({
          data: {
            ...(kind === "music" ? { bookingId: id } : { designEnquiryId: id }),
            stage, amount, totalAmount,
          },
        });
      } catch (error) {
        if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) {
          throw error;
        }
        payment = await prisma.servicePayment.findFirst({ where: { ...where, stage } }) ?? undefined;
        if (!payment || payment.amount !== amount || payment.totalAmount !== totalAmount) {
          return respond({ error: "An invoice is already being created" }, 409);
        }
      }
    }

    if (!payment) return respond({ error: "Invoice could not be prepared" }, 409);

    const description = `${kind === "music" ? "Music service" : "Design service"} ${stage} — ${
      kind === "music" ? "recording/production booking" : "design enquiry"
    } ${id.slice(-6)}`;
    const invoice = await sendServiceInvoice({
      paymentId: payment.id,
      email: request.user.email,
      name: request.user.name,
      description,
    });
    return respond({ ...invoice, amount, stage });
  } catch (error) {
    console.error("POST /api/admin/bookings/payments error:", error);
    return respond({ error: "Invoice could not be prepared or sent" }, 500);
  }
}
