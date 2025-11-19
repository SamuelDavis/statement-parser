import { intervalToDuration, type Duration } from "date-fns";
import type { Accessor } from "solid-js";

export const fields = ["date", "description", "amount"] as const;
export type Known = (typeof fields)[number];
export type Transaction = { date: Date; description: string; amount: number };
export type Statement = {
  name: string;
  date: Date;
  rows: Transaction[];
};
export type Tag = { value: string; regexp: RegExp };

export function createRegexp(
  get: Accessor<string>,
): Accessor<undefined | RegExp> {
  return (): undefined | RegExp => {
    const search = get();
    if (!search.trim()) return undefined;

    try {
      return new RegExp(get(), "gi");
    } catch (error) {
      return undefined;
    }
  };
}

export class TransactionGroup {
  private readonly transactions;

  constructor(transactions: Transaction[]) {
    this.transactions = transactions.sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    );
  }

  get from(): undefined | Date {
    return this.transactions[this.transactions.length - 1]?.date;
  }
  get to(): undefined | Date {
    return this.transactions[0]?.date;
  }
  get total(): number {
    return this.transactions.reduce((acc, tx) => acc + tx.amount, 0);
  }
  get duration(): Duration {
    const start = this.from;
    const end = this.to;

    if (start && end)
      return intervalToDuration({ start: this.from, end: this.to });

    const now = new Date();
    return intervalToDuration({ start: now, end: now });
  }
}
