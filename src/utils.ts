import {
  createEffect,
  createSignal as createSolidJsSignal,
  Signal,
  SignalOptions,
} from "solid-js";
import { isProperty } from "./types.ts";

export function createSignal<T>(
  value: T,
  options?: SignalOptions<T> & {
    storageKey?: string;
    storageParser?: (value: any) => T;
  },
): Signal<T> {
  const {
    storageKey,
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
      else localStorage.setItem(storageKey, JSON.stringify(get()));
    });
  }

  return signal;
}
