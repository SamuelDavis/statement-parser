import {
  createEffect,
  createSignal as solidJsCreateSignal,
  JSX,
  Signal,
  SignalOptions,
} from "solid-js";
import { isArray, isFunction, isProperty } from "./types.ts";

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
