import {
  createEffect,
  createSignal as createSolidJsSignal,
  Signal,
  SignalOptions,
} from "solid-js";
import { isProperty, TextSegment } from "./types.ts";

export function createSignal<T>(
  value: T,
  options?: SignalOptions<T> & {
    storageKey?: string;
    storageParser?: (value: any) => T;
    storageEncoder?: (value: T) => string;
  },
): Signal<T> {
  const {
    storageKey,
    storageParser = (v: any) => v,
    storageEncoder = JSON.stringify,
    ...parentOptions
  } = options ?? {};

  if (storageKey && isProperty(localStorage, storageKey)) {
    const local = localStorage.getItem(storageKey) ?? "null";
    try {
      value = storageParser(JSON.parse(local));
    } catch (e) {
      console.error(e);
    }
  }

  const signal = createSolidJsSignal<T>(value, parentOptions);
  const [get] = signal;

  if (storageKey) {
    createEffect(() => {
      const value = get();
      if (value === undefined) localStorage.removeItem(storageKey);
      else localStorage.setItem(storageKey, storageEncoder(get()));
    });
  }

  return signal;
}

export function regexToString(regex: RegExp): string {
  return String(regex).replace(/^\/|\/\w+$/g, "");
}

export function stringToRegex(string: string): RegExp {
  return new RegExp(string, "gi");
}

export function uniq<Value extends string>(list: Value[]): Value[] {
  return list.filter((v, i, a) => a.indexOf(v) === i);
}

export function parseRegex(regex: RegExp, text: string): TextSegment[] {
  let position = 0;
  let segments: TextSegment[] = [];
  for (const match of text.matchAll(regex)) {
    const { index, 0: segment } = match;
    if (index > position) {
      segments.push({ value: text.slice(position, index), match: false });
    }
    position = index + segment.length;
    segments.push({ value: text.slice(index, position), match: true });
  }
  if (position < text.length)
    segments.push({ value: text.slice(position), match: false });

  return segments;
}
