import {
  createEffect,
  createSignal as solidJsCreateSignal,
  JSX,
  Signal,
  SignalOptions,
} from "solid-js";
import { isArray, isFunction, isProperty, TextSegment } from "./types.ts";

export function handle<
  H extends JSX.EventHandlerUnion<any, any>,
  E extends Event,
>(handler: undefined | H, event: E): void {
  if (isArray(handler)) {
    const [callback, data] = handler;
    callback(data, event);
  } else if (isFunction(handler)) {
    handler(event);
  } else if (handler !== undefined) {
    throw new TypeError();
  }
}

export function createSignal<T>(
  value: T,
  options?: SignalOptions<T> & {
    storageKey?: string;
    storageEncoder?: (value: T) => string;
    storageParser?: (value: any) => T;
    errorHandler?: (error: Error) => void;
  },
): Signal<T> {
  const {
    storageKey,
    storageEncoder = JSON.stringify,
    storageParser = (v: any) => v,
    errorHandler,
    ...parentOptions
  } = options ?? {};

  if (storageKey && isProperty(localStorage, storageKey)) {
    const local = localStorage.getItem(storageKey) ?? "null";
    try {
      value = storageParser(JSON.parse(local));
    } catch (error) {
      if (!(error instanceof Error)) console.error(error);
      else if (errorHandler) errorHandler(error);
      else throw error;
    }
  }

  const signal = solidJsCreateSignal<T>(value, parentOptions);
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

export function stringToRegexp(value: string): RegExp {
  return new RegExp(value, "gi");
}

export function segmentText(regexp: RegExp, text: string): TextSegment[] {
  let segments: TextSegment[] = [];
  while (text.length) {
    const result = regexp.exec(text);
    if (!result) {
      segments.push({ value: text, match: false });
      break;
    }

    const { 0: match = text, index = text.length } = result;
    const before = text.slice(0, index);

    if (before.length) segments.push({ value: before, match: false });

    const matching = text.slice(index, index + match.length);
    if (matching.length) segments.push({ value: matching, match: true });

    text = text.slice(index + match.length);
  }

  return segments;
  //
  //
  //
  // let position = 0;
  // let segments: TextSegment[] = [];
  // for (const match of text.matchAll(regex)) {
  //   const { index, 0: segment } = match;
  //   if (index > position) {
  //     segments.push({ value: text.slice(position, index), match: false });
  //   }
  //   position = index + segment.length;
  //   segments.push({ value: text.slice(index, position), match: true });
  // }
  // if (position < text.length)
  //   segments.push({ value: text.slice(position), match: false });
  //
  // return segments;
}
