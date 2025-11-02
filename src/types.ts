export const fields = ["date", "description", "amount"] as const;
export type Known = (typeof fields)[number];
export type Transaction = { date: Date; description: string; amount: number };
export type Statement = {
  name: string;
  date: Date;
  rows: Transaction[];
};
