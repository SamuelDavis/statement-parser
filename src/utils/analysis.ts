import type {
  Period,
  PeriodTotal,
  Tag,
  TaggedTransaction,
  Transaction,
} from "../types";

export function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function mean(values: number[]): number {
  return values.length > 0 ? sum(values) / values.length : 0;
}

export function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
}

export function periodStart(date: Date, period: Period): Date {
  switch (period) {
    case "week":
      return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() - ((date.getDay() + 6) % 7),
      );
    case "month":
      return new Date(date.getFullYear(), date.getMonth(), 1);
    case "year":
      return new Date(date.getFullYear(), 0, 1);
  }
}

export function nextPeriod(start: Date, period: Period): Date {
  switch (period) {
    case "week":
      return new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate() + 7,
      );
    case "month":
      return new Date(start.getFullYear(), start.getMonth() + 1, 1);
    case "year":
      return new Date(start.getFullYear() + 1, 0, 1);
  }
}

export function bucket(
  transactions: Transaction[],
  period: Period,
): PeriodTotal[] {
  const totals = new Map<number, number>();
  for (const transaction of transactions) {
    const key = periodStart(transaction.date, period).getTime();
    totals.set(key, (totals.get(key) ?? 0) + transaction.amount);
  }
  if (totals.size === 0) return [];

  const keys = [...totals.keys()];
  const last = Math.max(...keys);
  const result: PeriodTotal[] = [];
  let previous: undefined | number;
  for (
    let start = new Date(Math.min(...keys));
    start.getTime() <= last;
    start = nextPeriod(start, period)
  ) {
    const total = roundCents(totals.get(start.getTime()) ?? 0);
    const delta = previous === undefined ? 0 : roundCents(total - previous);
    const percent = previous ? delta / Math.abs(previous) : 0;
    result.push({ start, total, delta, percent });
    previous = total;
  }
  return result;
}

export function movingAverage(values: number[], window: number): number[] {
  return values.map((_, index) =>
    mean(values.slice(Math.max(0, index - window + 1), index + 1)),
  );
}

export function bestFit(values: number[]): { slope: number; points: number[] } {
  const meanX = (values.length - 1) / 2;
  const meanY = mean(values);
  let numerator = 0;
  let denominator = 0;
  for (const [x, y] of values.entries()) {
    numerator += (x - meanX) * (y - meanY);
    denominator += (x - meanX) ** 2;
  }
  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = meanY - slope * meanX;
  return { slope, points: values.map((_, x) => intercept + slope * x) };
}

export function filterByTags(
  transactions: TaggedTransaction[],
  included: Tag["label"][],
  excluded: Tag["label"][],
): TaggedTransaction[] {
  return transactions.filter(
    (transaction) =>
      (included.length === 0 ||
        transaction.tags.some((tag) => included.includes(tag))) &&
      !transaction.tags.some((tag) => excluded.includes(tag)),
  );
}
