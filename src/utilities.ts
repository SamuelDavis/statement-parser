import { useParams, useSearchParams } from "@solidjs/router";
import { createEffect, type Signal } from "solid-js";
import { type AnyKey, isArray, isString } from "./types";

export function undefineFalsy<T>(value: T): undefined | T {
  if (isArray(value)) return value.length > 0 ? value : undefined;
  if (value instanceof RegExp)
    return value.source.length === 0 || value.source === "(?:)"
      ? undefined
      : value;
  return value ? value : undefined;
}

export function useParam<K extends AnyKey, T extends string = string>(
  key: K,
  value?: T,
) {
  const params = useParams<Record<K, T>>();
  return [
    (): undefined | T => params[key] ?? value,
    (value: T): void => {
      params[key] = value;
    },
  ];
}

export function persist<T>(
  signal: Signal<T>,
  opts: {
    key: string;
    encode?: (value: T) => string;
    decode?: (value: string) => T;
    driver?: "local" | "query";
  },
): Signal<T> {
  const [get, set] = signal;
  const {
    key,
    encode = JSON.stringify,
    decode = JSON.parse,
    driver = "local",
  } = opts;

  switch (driver) {
    case "local": {
      const item = localStorage.getItem(key);
      if (isString(item)) set(decode(item));
      createEffect(() => localStorage.setItem(key, encode(get())));
      break;
    }
    case "query": {
      const [searchParams, setSearchParams] = useSearchParams();
      createEffect(() => {
        const value = encode(get());
        setSearchParams({
          [key]: value.replace(/(^"|"$)/g, "").length > 0 ? value : null,
        });
      });
      createEffect(() => {
        const value = searchParams[key];
        if (isString(value)) set(decode(value));
      });
      break;
    }
  }
  return signal;
}
