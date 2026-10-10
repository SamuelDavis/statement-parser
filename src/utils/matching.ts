import { Flags, type Tag } from "../types";

export function toRegExp(source: string): undefined | RegExp {
  try {
    return new RegExp(source, Flags);
  } catch {
    return undefined;
  }
}

export function toTagRegExp(tag: Tag): RegExp {
  return new RegExp(
    tag.matchers.map((matcher) => `(?:${matcher})`).join("|"),
    Flags,
  );
}

export function isMatch(text: string, regexp: RegExp): boolean {
  return text.match(regexp) !== null;
}
