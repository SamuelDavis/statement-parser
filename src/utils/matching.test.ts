import { describe, expect, it } from "vitest";
import { isMatch, toRegExp, toTagRegExp } from "./matching";

describe("toRegExp", () => {
  it("builds case-insensitive global regexps", () => {
    expect(toRegExp("kroger")?.flags).toBe("gi");
  });

  it("returns undefined for invalid patterns", () => {
    expect(toRegExp("(")).toBeUndefined();
  });
});

describe("isMatch", () => {
  it("matches case-insensitively and is safe to reuse", () => {
    const regexp = toRegExp("kroger");
    expect(regexp).toBeDefined();
    if (!regexp) return;
    expect(isMatch("KROGER #12", regexp)).toBe(true);
    expect(isMatch("KROGER #12", regexp)).toBe(true);
    expect(isMatch("ALDI", regexp)).toBe(false);
  });
});

describe("toTagRegExp", () => {
  it("matches any of the tag's matchers", () => {
    const regexp = toTagRegExp({
      label: "groceries",
      matchers: ["kroger", "trader joe|aldi"],
    });
    expect(isMatch("Kroger 12", regexp)).toBe(true);
    expect(isMatch("ALDI 4", regexp)).toBe(true);
    expect(isMatch("SHELL", regexp)).toBe(false);
  });
});
