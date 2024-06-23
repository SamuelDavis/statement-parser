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
