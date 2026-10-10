import { useSearchParams } from "@solidjs/router";
import {
  assert,
  isArray,
  isNumber,
  isOf,
  isString,
} from "@samueldavis/solidlib";

type Codec<T> = {
  decode(value: string): T;
  encode(value: T): string;
};

export function createSearchParam<T>(
  key: string,
  fallback: T,
  codec: Codec<T>,
): [() => T, (value: T) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const getValue = (): T => {
    const value = searchParams[key];
    if (!isString(value)) return fallback;
    try {
      return codec.decode(value);
    } catch {
      return fallback;
    }
  };

  function setValue(value: T): void {
    const encoded = codec.encode(value);
    setSearchParams(
      { [key]: encoded === codec.encode(fallback) ? undefined : encoded },
      { replace: true },
    );
  }

  return [getValue, setValue];
}

export const stringCodec: Codec<string> = {
  decode: String,
  encode: String,
};

export const positiveIntegerCodec: Codec<number> = {
  decode(value) {
    const number = Number(value);
    assert(isNumber, number);
    if (!Number.isInteger(number) || number < 1) throw new RangeError(value);
    return number;
  },
  encode: String,
};

export function oneOfCodec<T extends string>(values: readonly T[]): Codec<T> {
  return {
    decode(value) {
      assert(isOf, value, values);
      return value;
    },
    encode: String,
  };
}

export const booleanCodec: Codec<boolean> = {
  decode(value) {
    assert(isOf, value, ["true", "false"] as const);
    return value === "true";
  },
  encode: String,
};

export const stringsCodec: Codec<string[]> = {
  decode(value) {
    const values: unknown = JSON.parse(value);
    assert(isArray, values);
    for (const item of values) assert(isString, item);
    return values as string[];
  },
  encode(value) {
    return value.length > 0 ? JSON.stringify(value) : "";
  },
};
