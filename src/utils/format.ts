import type { Period } from "../types";

export const currency: Intl.NumberFormatOptions = {
  style: "currency",
  currency: "USD",
};

const periodFormats: Record<Period, Intl.DateTimeFormatOptions> = {
  week: { month: "short", day: "numeric" },
  month: { month: "short", year: "numeric" },
  year: { year: "numeric" },
};

export function formatMoney(value: number): string {
  return value.toLocaleString("en-US", currency);
}

export function formatPeriod(start: Date, period: Period): string {
  return start.toLocaleDateString("en-US", periodFormats[period]);
}
