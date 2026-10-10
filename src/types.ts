export type Transaction = {
  date: Date;
  description: string;
  amount: number;
};
export type TransactionField = keyof Transaction;
export const transactionFields = [
  "date",
  "description",
  "amount",
] as const satisfies readonly TransactionField[];

export type Statement = {
  date: Date;
  name: string;
  transactions: Transaction[];
};

export type Tag = {
  label: string;
  matchers: string[];
};
export const untagged = "untagged" as const;

export type TaggedTransaction = Transaction & { tags: Tag["label"][] };

export type Upload = {
  name: string;
  headers: string[];
  rows: Record<string, string>[];
};
export type FieldMapping = Record<TransactionField, string>;
export type RowError = {
  line: number;
  field: TransactionField;
  value: string;
};

export const periods = ["week", "month", "year"] as const;
export type Period = (typeof periods)[number];

export type PeriodTotal = {
  start: Date;
  total: number;
  delta: number;
  percent: number;
};

export const Flags = "gi" as const;
