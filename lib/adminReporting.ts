// Midnight in London on 16 October 2026 (BST).
export const REPORTING_START = "2026-10-15T23:00:00.000Z";
export const REPORTING_START_LABEL = "16 October 2026";
export type ReportingPeriod = "current" | "all";
export const REVENUE_STATUSES = ["paid", "processing", "shipped", "delivered"] as const;

export function reportingPeriod(value: string | null): ReportingPeriod {
  return value === "all" ? "all" : "current";
}

export function reportingDateWhere(period: ReportingPeriod) {
  return period === "all" ? {} : { createdAt: { gte: new Date(REPORTING_START) } };
}

export function reportingOrderWhere(period: ReportingPeriod) {
  return { excludedFromReports: false, ...reportingDateWhere(period) };
}

export function includedInReports(
  order: { createdAt: string | Date; excludedFromReports?: boolean },
  period: ReportingPeriod
) {
  if (order.excludedFromReports) return false;
  return period === "all" || new Date(order.createdAt).getTime() >= Date.parse(REPORTING_START);
}
