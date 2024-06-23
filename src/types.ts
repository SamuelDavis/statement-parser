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

export const normalHeaders = ["date", "description", "amount"] as const;
export type NormalHeader = (typeof normalHeaders)[number];

export function includes<List extends readonly any[]>(
  list: List,
  value: any,
): value is List[number] {
  return list.includes(value);
}
