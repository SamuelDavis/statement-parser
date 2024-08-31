import { ComponentProps, ValidComponent } from "solid-js";

export type NormalHeader = keyof Transaction;
export const normalHeaders: readonly NormalHeader[] = [
  "date",
  "description",
  "amount",
] as const;

export enum UploadStep {
  Upload,
  MapHeaders,
  Review,
}

export type Upload<Header extends string = string> = {
  name: string;
  headers: Header[];
  rows: Record<Header, string>[];
};

export type Transaction = {
  date: Date;
  description: string;
  amount: number;
};

export type Statement = {
  name: string;
  date: Date;
  transactions: Transaction[];
};

export type TextSegment = { value: string; match: boolean };

export type ExtendProps<
  Source extends ValidComponent,
  Props extends Record<string, any> = {},
  Except extends keyof ComponentProps<Source> = never,
> = Omit<Omit<ComponentProps<Source>, keyof Props>, Except> & Props;

export function isDate(value: any): value is Date {
  return value instanceof Date && isNumber(value.getTime());
}

export function isString(value: any): value is string {
  return typeof value === "string";
}

export function isArray(value: any): value is any[] {
  return Array.isArray(value);
}

export function isNumber(value: any): value is number {
  return !isNaN(value);
}

export function isObject(value: any): value is object {
  return value !== null && typeof value === "object";
}

export function isHtml<Tag extends keyof HTMLElementTagNameMap>(
  tag: Tag,
  value: any,
): value is HTMLElementTagNameMap[Tag] {
  return hasProperty("nodeName", value) && value.nodeName === tag.toUpperCase();
}

export function includes<List extends readonly any[]>(
  list: List,
  value: any,
): value is List[number] {
  return list.includes(value);
}

export function isProperty<Obj extends Record<string, any> | object>(
  object: Obj,
  property: keyof Obj | string,
): property is keyof Obj {
  return isObject(object) && property in object;
}

export function hasProperty<Property extends keyof any>(
  property: Property,
  value: any,
): value is Record<Property, any> {
  return isObject(value) && property in value;
}

export function hasProperties<Property extends keyof any>(
  properties: Readonly<Property[]>,
  value: any,
): value is Record<Property, any> {
  return isObject(value) && properties.every((property) => property in value);
}

export function isFunction<T extends (...props: any[]) => any>(
  value: any,
): value is T {
  return value instanceof Function;
}

export type Tag = { label: string; text: string };
