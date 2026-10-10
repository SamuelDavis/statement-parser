import { parse } from "papaparse";
import {
  type FieldMapping,
  type RowError,
  type Transaction,
  type TransactionField,
  transactionFields,
  type Upload,
} from "../types";

const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const amountPattern = /^-?\d+(\.\d+)?$/;

export async function readCsv(file: File): Promise<Upload> {
  const result = parse<Record<string, string>>(await file.text(), {
    header: true,
    skipEmptyLines: "greedy",
  });
  if (result.errors.length > 0)
    throw new Error(
      result.errors
        .map((error) => `Row ${(error.row ?? 0) + 1}: ${error.message}`)
        .join("\n"),
    );
  return {
    name: file.name,
    headers: result.meta.fields ?? [],
    rows: result.data,
  };
}

export function guessMapping(headers: string[]): Partial<FieldMapping> {
  const mapping: Partial<FieldMapping> = {};
  for (const field of transactionFields)
    mapping[field] = headers.find((header) =>
      header.toLowerCase().includes(field),
    );
  return mapping;
}

export function isCompleteMapping(
  mapping: Partial<FieldMapping>,
): mapping is FieldMapping {
  return transactionFields.every((field) => mapping[field] !== undefined);
}

export function parseDate(value: string): undefined | Date {
  const match = datePattern.exec(value.trim());
  if (!match) return undefined;
  const [month, day, year] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day);
  return date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : undefined;
}

export function parseDescription(value: string): undefined | string {
  return value.trim() || undefined;
}

export function parseAmount(value: string): undefined | number {
  return amountPattern.test(value.trim()) ? Number(value) : undefined;
}

export function parseRows(
  rows: Upload["rows"],
  mapping: FieldMapping,
): { transactions: Transaction[]; errors: RowError[] } {
  const transactions: Transaction[] = [];
  const errors: RowError[] = [];
  for (const [index, row] of rows.entries()) {
    const date = parseDate(getCell(row, mapping, "date"));
    const description = parseDescription(getCell(row, mapping, "description"));
    const amount = parseAmount(getCell(row, mapping, "amount"));
    const parsed = { date, description, amount };
    for (const field of transactionFields)
      if (parsed[field] === undefined)
        errors.push({
          line: index + 1,
          field,
          value: getCell(row, mapping, field),
        });
    if (date && description && amount !== undefined)
      transactions.push({ date, description, amount });
  }
  return { transactions, errors };
}

function getCell(
  row: Upload["rows"][number],
  mapping: FieldMapping,
  field: TransactionField,
): string {
  return row[mapping[field]] ?? "";
}
