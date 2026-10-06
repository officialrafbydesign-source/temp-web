CREATE TABLE "ServicePayment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT,
    "designEnquiryId" TEXT,
    "stage" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "stripeSessionId" TEXT,
    "stripeInvoiceId" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicePayment_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ServicePayment_request_check" CHECK (
        ("bookingId" IS NOT NULL AND "designEnquiryId" IS NULL) OR
        ("bookingId" IS NULL AND "designEnquiryId" IS NOT NULL)
    ),
    CONSTRAINT "ServicePayment_amount_check" CHECK (
        "amount" > 0 AND "totalAmount" >= "amount"
    )
);

CREATE UNIQUE INDEX "ServicePayment_bookingId_stage_key"
    ON "ServicePayment"("bookingId", "stage");
CREATE UNIQUE INDEX "ServicePayment_designEnquiryId_stage_key"
    ON "ServicePayment"("designEnquiryId", "stage");
CREATE UNIQUE INDEX "ServicePayment_stripeSessionId_key"
    ON "ServicePayment"("stripeSessionId");
CREATE UNIQUE INDEX "ServicePayment_stripeInvoiceId_key"
    ON "ServicePayment"("stripeInvoiceId");

ALTER TABLE "ServicePayment"
    ADD CONSTRAINT "ServicePayment_bookingId_fkey"
    FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ServicePayment"
    ADD CONSTRAINT "ServicePayment_designEnquiryId_fkey"
    FOREIGN KEY ("designEnquiryId") REFERENCES "DesignEnquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
