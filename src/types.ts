import { JSX } from "solid-js";

export type ExtendProps<
  Source extends keyof HTMLElementTagNameMap,
  Props extends Record<string, any> = {},
> = Omit<JSX.HTMLAttributes<HTMLElementTagNameMap[Source]>, keyof Props> &
  Props;

export function isHtml<Tag extends keyof HTMLElementTagNameMap>(
  tag: Tag,
  value: any,
): value is HTMLElementTagNameMap[Tag] {
  return (
    value && typeof value === "object" && value.nodeName === tag.toUpperCase()
  );
}

export type Upload<Header extends string = string> = {
  name: string;
  headers: Header[];
  rows: Record<Header, string>[];
};

export type NormalRow = {
  date: Date;
  description: string;
  amount: number;
};
export type NormalHeader = keyof NormalRow;
export const normalHeaders: readonly NormalHeader[] = [
  "date",
  "description",
  "amount",
] as const;

export function includes<List extends readonly any[]>(
  list: List,
  value: any,
): value is List[number] {
  return list.includes(value);
}

export type Statement = {
  name: string;
  date: Date;
  rows: NormalRow[];
};

export function isObject(value: any): value is object {
  return value !== null && typeof value === "object";
}

export function isProperty<Obj extends Record<string, any> | object>(
  object: Obj,
  property: keyof Obj | string,
): property is keyof Obj {
  return isObject(object) && property in object;
}

export function hasProperty<P extends string>(
  property: P,
  value: any,
): value is Record<P, any> {
  return isObject(value) && isProperty(value, property);
}

export function parseStatement(value: any): Statement {
  return (
    assert(isObject, value) && {
      name: assert(isString, value.name),
      date: assert(isDate, new Date(value.date)),
      rows: assert(isArray, value.rows).map(parseNormalRow),
    }
  );
}

export function parseNormalRow(value: any): NormalRow {
  if (!normalHeaders.every((p) => isProperty(value, p))) throw new TypeError();
  const { date: _date, description, amount: _amount } = value;
  const date = new Date(_date);
  const amount = parseFloat(_amount);
  if (isDate(date) && isString(description) && isNumber(amount))
    return { date, description, amount };
  throw new TypeError();
}

export function isNormalRow(value: any): value is NormalRow {
  return (
    hasProperty("date", value) &&
    isDate(value.date) &&
    hasProperty("description", value) &&
    isString(value.description) &&
    hasProperty("amount", value) &&
    isNumber(value.amount)
  );
}

export function isString(value: any): value is string {
  return typeof value === "string";
}

export function isNumber(value: any): value is number {
  return !isNaN(value);
}

export function isDate(value: any): value is Date {
  return value instanceof Date && isNumber(value.getTime());
}

export function isArray(value: any): value is any[] {
  return Array.isArray(value);
}

export function assert<Guard extends (value: any) => boolean>(
  guard: Guard,
  value: any,
): Guard extends (value: any) => value is infer T ? T : never {
  if (guard(value)) return value;
  throw new TypeError();
}

export function assertIsArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  throw new TypeError();
}
