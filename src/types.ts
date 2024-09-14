import { ComponentProps, ValidComponent } from "solid-js";

export type Upload = {
  name: string;
  headers: string[];
  rows: Record<string, string>[];
};
export type Statement = {
  name: string;
  date: Date;
  transactions: Transaction[];
};

export type Transaction = { date: Date; description: string; amount: number };
export type NormalHeader = keyof Transaction;

export const normalHeaders: NormalHeader[] = [
  "date",
  "description",
  "amount",
] as const;

export type ExtendProps<
  Parent extends ValidComponent,
  Props extends Record<string, any> = {},
  Except extends keyof ComponentProps<Parent> = never,
> = Omit<ComponentProps<Parent>, keyof Props & Except> & Props;

export type TargetedEvent<
  T extends EventTarget & Element = Element,
  E extends Event = Event,
> = E & { target: Element; currentTarget: T } & (E extends SubmitEvent
    ? { submitter: HTMLElement }
    : {});

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

export function isHtml<Tag extends keyof HTMLElementTagNameMap>(
  tag: Tag,
  value: any,
): value is HTMLElementTagNameMap[Tag] {
  return hasProperty("nodeName", value) && value.nodeName === tag.toUpperCase();
}

export function isValue<T extends object>(
  object: T,
  value: any,
): value is T[keyof T] {
  return Object.values(object).includes(value);
}

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

export function isFunction<T extends (...props: any[]) => any>(
  value: any,
): value is T {
  return value instanceof Function;
}
