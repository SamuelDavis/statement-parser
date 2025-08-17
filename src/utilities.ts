import { useParams, useSearchParams } from "@solidjs/router";
import {
  type AnyKey,
  isArray,
  isString,
  isFunction,
  isNonNullable,
} from "./types";
import {
  createEffect,
  type Accessor,
  type Setter,
  type Signal,
} from "solid-js";

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
        if (value.replace(/(^"|"$)/g, "").length > 0)
          setSearchParams({ [key]: value });
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

export function useQueryString(key = "q"): Signal<string> {
  const [searchParams, setSearchParams] =
    useSearchParams<{ [K in typeof key]: string }>();
  const get: Accessor<string> = () => searchParams[key] ?? "";
  const set: Setter<string> = (value) => {
    const newValue = isFunction(value) ? value(get()) : value;
    setSearchParams({ [key]: newValue });
    return newValue;
  };
  return [get, set];
}
export function useQueryBoolean(key: string, truthy = "true"): Signal<boolean> {
  const [searchParams, setSearchParams] =
    useSearchParams<{ [K in typeof key]: string }>();
  const get: Accessor<boolean> = () => searchParams[key] === truthy;
  const set: Setter<boolean> = (value) => {
    const newValue = isFunction(value) ? value(get()) : value;
    setSearchParams({ [key]: newValue ? truthy : null });
    return newValue;
  };
  return [get, set];
}
export function useQuery<T>({ key: string }): Signal<T> {
  const [searchParams, setSearchParams] =
    useSearchParams<{ [K in typeof key]: string }>();
  const get: Accessor<T> = () => searchParams[key] ?? "";
  const set: Setter<T> = (value) => {
    const newValue = isFunction(value) ? value(get()) : value;
    setSearchParams({ [key]: newValue });
    return newValue;
  };
  return [get, set];
}
