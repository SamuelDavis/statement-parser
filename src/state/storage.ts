import {
  assert,
  isArray,
  isDate,
  isNumber,
  isObject,
  isString,
} from "@samueldavis/solidlib";
import type { Statement, Tag, Transaction } from "../types";

export function decodeStatements(text: string): Statement[] {
  const value: unknown = JSON.parse(text);
  assert(isArray, value);
  return value.map(decodeStatement);
}

export function decodeTags(text: string): Tag[] {
  const value: unknown = JSON.parse(text);
  assert(isArray, value);
  return value.map(decodeTag);
}

function decodeStatement(value: unknown): Statement {
  const name = readField(value, "name");
  assert(isString, name);
  const transactions = readField(value, "transactions");
  assert(isArray, transactions);
  return {
    date: decodeDate(readField(value, "date")),
    name,
    transactions: transactions.map(decodeTransaction),
  };
}

function decodeTransaction(value: unknown): Transaction {
  const description = readField(value, "description");
  assert(isString, description);
  const amount = readField(value, "amount");
  assert(isNumber, amount);
  return { date: decodeDate(readField(value, "date")), description, amount };
}

function decodeTag(value: unknown): Tag {
  const label = readField(value, "label");
  assert(isString, label);
  const matchers = readField(value, "matchers");
  assert(isArray, matchers);
  return { label, matchers: matchers.map(decodeString) };
}

function decodeString(value: unknown): string {
  assert(isString, value);
  return value;
}

function decodeDate(value: unknown): Date {
  assert(isString, value);
  const date = new Date(value);
  assert(isDate, date);
  return date;
}

function readField(value: unknown, key: string): unknown {
  assert(isObject, value);
  return Reflect.get(value, key);
}
