import { describe, expect, it } from "vitest";
import {
  booleanCodec,
  oneOfCodec,
  positiveIntegerCodec,
  stringCodec,
  stringsCodec,
} from "./searchParams";
import { periods } from "../types";

describe("codecs", () => {
  it("round-trip valid values", () => {
    expect(stringCodec.decode(stringCodec.encode("a b"))).toBe("a b");
    expect(booleanCodec.decode(booleanCodec.encode(true))).toBe(true);
    expect(positiveIntegerCodec.decode(positiveIntegerCodec.encode(3))).toBe(3);
    expect(oneOfCodec(periods).decode("year")).toBe("year");
    expect(stringsCodec.decode(stringsCodec.encode(["a", "b"]))).toEqual([
      "a",
      "b",
    ]);
  });

  it("encodes empty lists as an empty string", () => {
    expect(stringsCodec.encode([])).toBe("");
  });

  it.each([
    () => booleanCodec.decode("yes"),
    () => positiveIntegerCodec.decode("0"),
    () => positiveIntegerCodec.decode("1.5"),
    () => positiveIntegerCodec.decode("x"),
    () => oneOfCodec(periods).decode("day"),
    () => stringsCodec.decode("[1]"),
    () => stringsCodec.decode("{"),
  ])("rejects invalid input %#", (decode) => {
    expect(decode).toThrow();
  });
});
