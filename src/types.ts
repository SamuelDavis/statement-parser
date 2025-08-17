import type { ComponentProps, ValidComponent } from "solid-js";

/***********
 * GENERAL *
 ***********/
export type AnyKey = string | number | symbol;
export type AnyRecord<Key extends AnyKey = AnyKey> = Record<Key, any>;
export type Ctor<T> = new (...args: any[]) => T;

/*******
 * APP *
 *******/
export type UploadedField = string;
export type Upload = {
  name: string;
  fields: UploadedField[];
  rows: Record<UploadedField, string>[];
};
export type Transaction = {
  date: Date;
  description: string;
  amount: number;
};
export type FieldMapping = Record<TransactionField, UploadedField>;
export type Statement = {
  date: Date;
  name: string;
  transactions: Transaction[];
};
export type TransactionField = keyof Transaction;
export const transactionFields: readonly TransactionField[] = [
  "date",
  "description",
  "amount",
];
export type StatementField = keyof Statement;
export const statementFields: readonly StatementField[] = [
  "date",
  "name",
  "transactions",
];
export type Match = { match: boolean; text: string };
export type Tag = {
  regexp: RegExp;
  value: string;
  ignore: boolean;
};
export type TagField = keyof Tag;
export const tagFields: readonly TagField[] = ["regexp", "value", "ignore"];
export const Flags = "gi" as const;
export type ComplexTransaction = Transaction & {
  matches: Match[];
  tags: Tag[];
};
export const groupBy = ["day", "week", "month"] as const;
export type GroupBy = (typeof groupBy)[number];

/***********
 * UTILITY *
 ***********/
export type Targeted<
  Ev = Event,
  El = Ev extends InputEvent
    ? HTMLInputElement
    : Ev extends SubmitEvent
      ? HTMLFormElement
      : Element,
> = Event & {
  currentTarget: El;
  target: Ev extends FocusEvent ? El : Element;
};

export type ExtendProps<
  T extends ValidComponent,
  E extends AnyRecord,
  O extends keyof ComponentProps<T> = never,
> = E & Omit<ComponentProps<T>, keyof E | O>;

/*********
 * GUARD *
 *********/
export function assert<T, Args extends any[]>(
  guard: (value: unknown, ...args: Args) => value is T,
  value: unknown,
  ...args: Args
): asserts value is T {
  if (!guard(value, ...args)) throw new TypeError();
}
export function isInstanceOf<T>(value: unknown, ctor: Ctor<T>): value is T {
  return value instanceof ctor;
}
export function isObject<Key extends AnyKey>(
  value: unknown,
  keys: readonly Key[] = [],
): value is AnyRecord<Key> {
  return (
    typeof value === "object" &&
    value !== null &&
    keys.every((key) => key in value)
  );
}

export function isValueOf<T extends object | any[]>(
  value: unknown,
  obj: T,
): value is T[keyof T] {
  return isArray(obj)
    ? obj.includes(value)
    : Object.values(obj).includes(value);
}
export function isHtml<T extends keyof HTMLElementTagNameMap>(
  value: unknown,
  tag: T,
): value is HTMLElementTagNameMap[T] {
  return (
    isObject(value, ["tagName"] as const) && value.tagName === tag.toUpperCase()
  );
}
export function isEqualObject<T extends AnyRecord>(
  value: unknown,
  other: T,
  comparator?: (k: keyof T, v: T, o: T) => boolean,
): value is T {
  comparator = comparator ?? ((k, v, o) => isEqual(v[k], o[k]));
  return (
    isObject(value) &&
    Object.keys(other).every((key) => {
      return key in value && comparator(key, value, other);
    })
  );
}
export function isEqual<T>(value: unknown, other: T): value is T {
  if (isObject(other)) return isEqualObject(value, other);
  if (isArray(other)) return other.every((other) => isEqual(value, other));
  return value === other;
}
export function isFunction<T extends (...args: any[]) => any>(
  value: unknown | T,
): value is T {
  return typeof value === "function";
}
export function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}
export function inArray<T>(value: unknown, array: readonly T[]): value is T {
  return array.some((item) => item === value);
}
export function isString(value: unknown): value is string {
  return typeof value === "string";
}
export function isBoolean(value: unknown): value is boolean {
  return value === true || value === false;
}
export function isArray<T = unknown>(value: T[] | unknown): value is T[] {
  return Array.isArray(value);
}
export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !Number.isNaN(value);
}
export function isDate(value: unknown, cast: boolean = false): value is Date {
  value = cast ? new Date(value as string) : value;
  return value instanceof Date && isNumber(value.getTime());
}
