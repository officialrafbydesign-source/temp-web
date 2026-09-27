import "server-only";

import {
  Resend,
} from "resend";

interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface SendOrderEmailArgs {
  toEmail: string;
  orderId: string;
  productType: string;
  productTitle: string;
  downloadUrl?: string;
  licensePdfUrl?: string;
}

interface SendPasswordResetEmailArgs {
  toEmail: string;
  resetUrl: string;
}

interface SendEmailVerificationEmailArgs {
  toEmail: string;
  verificationUrl: string;
  customerName?: string | null;
}

function getResendClient() {
  const apiKey =
    process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not set"
    );
  }

  return new Resend(
    apiKey
  );
}

function getSenderAddress() {
  return (
    process.env
      .RESEND_FROM_EMAIL ||
    "RAF By Design <onboarding@resend.dev>"
  );
}

function getReplyToAddress() {
  return (
    process.env
      .RESEND_REPLY_TO_EMAIL ||
    "officialrafbydesign@gmail.com"
  );
}

function getSiteUrl() {
  return (
    process.env
      .NEXT_PUBLIC_SITE_URL ||
    process.env
      .NEXT_PUBLIC_DOMAIN ||
    "http://localhost:3000"
  );
}

function escapeHtml(
  value: string
) {
  return value
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailArgs) {
  const recipient =
    to.trim();

  const cleanSubject =
    subject.trim();

  if (!recipient) {
    throw new Error(
      "Email recipient is required"
    );
  }

  if (!cleanSubject) {
    throw new Error(
      "Email subject is required"
    );
  }

  if (!html.trim()) {
    throw new Error(
      "Email HTML content is required"
    );
  }

  const resend =
    getResendClient();

  return resend.emails.send({
    from:
      getSenderAddress(),

    replyTo:
      getReplyToAddress(),

    to: [
      recipient,
    ],

    subject:
      cleanSubject,

    html,

    ...(text
      ? {
          text,
        }
      : {}),
  });
}

export async function sendOrderFulfillmentEmail({
  toEmail,
  orderId,
  productType,
  productTitle,
  downloadUrl,
  licensePdfUrl,
}: SendOrderEmailArgs) {
  const resend =
    getResendClient();

  const siteUrl =
    getSiteUrl();

  const safeOrderId =
    escapeHtml(
      orderId
    );

  const safeProductType =
    escapeHtml(
      productType.toUpperCase()
    );

  const safeProductTitle =
    escapeHtml(
      productTitle
    );

  const safeDownloadUrl =
    downloadUrl
      ? escapeHtml(
          downloadUrl
        )
      : null;

  const safeLicensePdfUrl =
    licensePdfUrl
      ? escapeHtml(
          licensePdfUrl
        )
      : null;

  const safeContactUrl =
    escapeHtml(
      `${siteUrl}/contact`
    );

  return resend.emails.send({
    from:
      getSenderAddress(),

    replyTo:
      getReplyToAddress(),

    to: [
      toEmail,
    ],

    subject:
      `Order Confirmed: ${productTitle} [Ref #${orderId.slice(
        -6
      )}]`,

    html: `
      <div style="background-color: #000; color: #fff; font-family: Arial, Helvetica, sans-serif; padding: 32px; border: 4px solid #000;">
        <h1 style="color: #ef4444; text-transform: uppercase; font-size: 24px; margin-bottom: 8px;">
          PAYMENT CONFIRMED
        </h1>

        <p style="color: #a1a1aa; font-size: 12px; margin-bottom: 24px;">
          Thank you for your order. Your items are ready below.
        </p>

        <div style="background-color: #18181b; border: 2px solid #000; padding: 16px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; font-weight: bold; color: #fff;">
            ITEM: ${safeProductTitle}
          </p>

          <p style="margin: 4px 0 0 0; font-size: 10px; color: #71717a; text-transform: uppercase;">
            CATEGORY: ${safeProductType} | ORDER ID: ${safeOrderId}
          </p>
        </div>

        ${
          safeDownloadUrl
            ? `
          <div style="margin-bottom: 16px;">
            <a
              href="${safeDownloadUrl}"
              style="display: inline-block; background-color: #dc2626; color: #fff; font-weight: bold; font-size: 12px; padding: 12px 24px; text-decoration: none; border: 2px solid #000; text-transform: uppercase;"
            >
              VIEW DOWNLOADS
            </a>
          </div>
        `
            : ""
        }

        ${
          safeLicensePdfUrl
            ? `
          <div style="margin-bottom: 16px;">
            <a
              href="${safeLicensePdfUrl}"
              style="display: inline-block; background-color: #2563eb; color: #fff; font-weight: bold; font-size: 12px; padding: 12px 24px; text-decoration: none; border: 2px solid #000; text-transform: uppercase;"
            >
              DOWNLOAD LICENSE AGREEMENT
            </a>
          </div>
        `
            : ""
        }

        <p style="color: #71717a; font-size: 10px; margin-top: 32px; border-top: 1px solid #27272a; padding-top: 16px;">
          If you have questions regarding your order, visit
          <a
            href="${safeContactUrl}"
            style="color: #ef4444;"
          >
            ${safeContactUrl}
          </a>.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail({
  toEmail,
  resetUrl,
}: SendPasswordResetEmailArgs) {
  const resend =
    getResendClient();

  const safeResetUrl =
    escapeHtml(
      resetUrl
    );

  return resend.emails.send({
    from:
      getSenderAddress(),

    replyTo:
      getReplyToAddress(),

    to: [
      toEmail,
    ],

    subject:
      "Reset your RAF By Design password",

    html: `
      <div style="background-color: #000; color: #fff; font-family: Arial, Helvetica, sans-serif; padding: 32px; border: 4px solid #000;">
        <h1 style="color: #ef4444; text-transform: uppercase; font-size: 24px; margin-bottom: 8px;">
          PASSWORD RESET
        </h1>

        <p style="color: #d4d4d8; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          A password reset was requested for your RAF By Design customer account.
        </p>

        <div style="margin-bottom: 24px;">
          <a
            href="${safeResetUrl}"
            style="display: inline-block; background-color: #dc2626; color: #fff; font-weight: bold; font-size: 14px; padding: 14px 24px; text-decoration: none; border: 2px solid #fff; text-transform: uppercase;"
          >
            RESET PASSWORD
          </a>
        </div>

        <p style="color: #a1a1aa; font-size: 12px; line-height: 1.6;">
          This secure link expires after 30 minutes and becomes invalid after your password is changed.
        </p>

        <p style="color: #71717a; font-size: 11px; line-height: 1.6; margin-top: 24px; border-top: 1px solid #27272a; padding-top: 16px;">
          If you did not request this change, ignore this email. Your current password will remain unchanged.
        </p>
      </div>
    `,
  });
}

export async function sendEmailVerificationEmail({
  toEmail,
  verificationUrl,
  customerName,
}: SendEmailVerificationEmailArgs) {
  const resend =
    getResendClient();

  const safeVerificationUrl =
    escapeHtml(
      verificationUrl
    );

  const safeCustomerName =
    customerName
      ? escapeHtml(
          customerName
        )
      : null;

  return resend.emails.send({
    from:
      getSenderAddress(),

    replyTo:
      getReplyToAddress(),

    to: [
      toEmail,
    ],

    subject:
      "Verify your RAF By Design email address",

    html: `
      <div style="background-color: #000; color: #fff; font-family: Arial, Helvetica, sans-serif; padding: 32px; border: 4px solid #000;">
        <h1 style="color: #ef4444; text-transform: uppercase; font-size: 24px; margin-bottom: 8px;">
          VERIFY YOUR EMAIL
        </h1>

        <p style="color: #d4d4d8; font-size: 14px; line-height: 1.6; margin-bottom: 12px;">
          ${
            safeCustomerName
              ? `Hello ${safeCustomerName},`
              : "Hello,"
          }
        </p>

        <p style="color: #d4d4d8; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          Confirm your email address to activate your RAF By Design customer account and access digital purchases.
        </p>

        <div style="margin-bottom: 24px;">
          <a
            href="${safeVerificationUrl}"
            style="display: inline-block; background-color: #dc2626; color: #fff; font-weight: bold; font-size: 14px; padding: 14px 24px; text-decoration: none; border: 2px solid #fff; text-transform: uppercase;"
          >
            VERIFY EMAIL
          </a>
        </div>

        <p style="color: #a1a1aa; font-size: 12px; line-height: 1.6;">
          This secure verification link expires after 24 hours.
        </p>

        <p style="color: #71717a; font-size: 11px; line-height: 1.6; margin-top: 24px; border-top: 1px solid #27272a; padding-top: 16px;">
          If you did not create this account, you can ignore this email.
        </p>
      </div>
    `,
  });
}