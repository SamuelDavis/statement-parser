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
