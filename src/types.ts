import { JSX } from "solid-js";

export type ExtendProps<
  Source extends keyof JSX.HTMLElementTags,
  Props extends Record<string, any> = {},
  Except extends keyof JSX.HTMLElementTags[Source] = never,
> = Omit<Omit<JSX.HTMLElementTags[Source], keyof Props>, Except> & Props;
export type ExtendPropsChildless<
  Source extends keyof JSX.HTMLElementTags,
  Props extends Record<string, any> = {},
  Except extends keyof JSX.HTMLElementTags[Source] = never,
> = ExtendProps<Source, Props, "children" | Except>;

export function isHtml<Tag extends keyof HTMLElementTagNameMap>(
  tag: Tag,
  value: any,
): value is HTMLElementTagNameMap[Tag] {
  return (
    value && typeof value === "object" && value.nodeName === tag.toUpperCase()
  );
}

export function isArray(value: any): value is any[] {
  return Array.isArray(value);
}

export type Upload = {
  name: string;
  headers: string[];
  rows: Record<string, string>[];
};

export enum NormalHeader {
  Date = "Date",
  Description = "Description",
  Amount = "Amount",
}

export const normalHeaders = Object.keys(NormalHeader) as NormalHeader[];

export function isDate(value: any): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

export function isNumber(value: any): value is number {
  return !isNaN(value);
}

export function includes<List extends any[]>(
  list: List,
  value: any,
): value is List[number] {
  return list.includes(value);
}

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

export function hasEveryProperty<P extends string[]>(
  properties: P,
  value: any,
): value is Record<P[number], any> {
  return properties.every((property) => hasProperty(property, value));
}

export type Statement = {
  name: string;
  date: Date;
  rows: {
    [NormalHeader.Date]: Date;
    [NormalHeader.Description]: string;
    [NormalHeader.Amount]: number;
  }[];
};

export function isString(value: any): value is string {
  return typeof value === "string";
}

export type Tag = {
  text: string;
  regex: RegExp;
};

export function isCallable(value: any): value is (...args: any) => any {
  return (
    typeof value === "function" ||
    (hasProperty("constructor", value) && value.constructor === Function) ||
    hasEveryProperty(["call", "apply"], value)
  );
}

export type TextSegment = {
  value: string;
  match: boolean;
};
