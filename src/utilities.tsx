import {
  Component,
  createEffect,
  createSignal as createSolidJsSignal,
  JSX,
  Signal,
  SignalOptions,
} from "solid-js";
import { isFunction, isProperty, TextSegment } from "./types.ts";
import { Dynamic } from "solid-js/web";

export function renderElementOrComponent(
  arg: JSX.Element | Component,
): JSX.Element {
  return isFunction(arg) ? <Dynamic component={arg} /> : arg;
}

export function createSignal<T>(
  value: T,
  options?: SignalOptions<T> & {
    storageKey?: string;
    storageEncoder?: (value: T) => string;
    storageParser?: (value: any) => T;
  },
): Signal<T> {
  const {
    storageKey,
    storageEncoder = JSON.stringify,
    storageParser = (v: any) => v,
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

export function parseTextIntoSegments(
  regex: RegExp,
  text: string,
): TextSegment[] {
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

export function uniq<Value extends string>(list: Value[]): Value[] {
  return list.filter((v, i, a) => a.indexOf(v) === i);
}
