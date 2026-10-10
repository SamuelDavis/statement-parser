import { describe, expect, it } from "vitest";
import { formatMoney, formatPeriod } from "./format";

describe("formatMoney", () => {
  it("formats USD", () => {
    expect(formatMoney(-1018.14)).toBe("-$1,018.14");
    expect(formatMoney(5)).toBe("$5.00");
  });
});

describe("formatPeriod", () => {
  const start = new Date(2025, 0, 6);

  it.each([
    ["week", "Jan 6"],
    ["month", "Jan 2025"],
    ["year", "2025"],
  ] as const)("formats %s", (period, expected) => {
    expect(formatPeriod(start, period)).toBe(expected);
  });
});
