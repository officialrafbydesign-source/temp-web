/**
 * Sanitizes Cloudinary console/thumbnail links to ensure they point to valid public asset URLs.
 */
export const sanitizeCloudinaryUrl = (
  url: string | undefined,
  fallback: string
): string => {
  if (!url) return fallback;

  try {
    if (url.includes("res-console.cloudinary.com")) {
      return url
        .replace("res-console.cloudinary.com", "res.cloudinary.com")
        .replace("/thumbnails/v1/image/upload", "/image/upload")
        .replace(/\/drilldown$/, "");
    }
    return url;
  } catch (e) {
    return fallback;
  }
};

/**
 * Formats a number or string amount into British Pounds (GBP).
 *
 * Examples:
 *   formatPrice(25)                           => "£25.00"
 *   formatPrice("29.99")                      => "£29.99"
 *   formatPrice(25, { minimumFractionDigits: 0 }) => "£25"
 */
export function formatPrice(
  amount: number | string | null | undefined,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  if (amount === null || amount === undefined) return "£0.00";

  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numericAmount)) return "£0.00";

  const { minimumFractionDigits = 2, maximumFractionDigits = 2 } = options;

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(numericAmount);
}