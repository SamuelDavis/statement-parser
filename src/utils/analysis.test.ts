import { describe, expect, it } from "vitest";
import {
  bestFit,
  bucket,
  filterByTags,
  mean,
  movingAverage,
  nextPeriod,
  periodStart,
  roundCents,
  sum,
} from "./analysis";
import type { TaggedTransaction } from "../types";

function transaction(
  date: Date,
  amount: number,
  tags: string[] = [],
): TaggedTransaction {
  return { date, description: "x", amount, tags };
}

describe("math helpers", () => {
  it("sums, averages and rounds", () => {
    expect(sum([1, 2, 3])).toBe(6);
    expect(mean([1, 2, 3])).toBe(2);
    expect(mean([])).toBe(0);
    expect(roundCents(0.1 + 0.2)).toBe(0.3);
  });
});

describe("periodStart", () => {
  const sunday = new Date(2025, 0, 12);

  it("starts weeks on Monday", () => {
    expect(periodStart(sunday, "week")).toEqual(new Date(2025, 0, 6));
    expect(periodStart(new Date(2025, 0, 6), "week")).toEqual(
      new Date(2025, 0, 6),
    );
  });

  it("starts months and years on the 1st", () => {
    expect(periodStart(sunday, "month")).toEqual(new Date(2025, 0, 1));
    expect(periodStart(sunday, "year")).toEqual(new Date(2025, 0, 1));
  });
});

describe("nextPeriod", () => {
  it("advances across boundaries", () => {
    expect(nextPeriod(new Date(2024, 11, 30), "week")).toEqual(
      new Date(2025, 0, 6),
    );
    expect(nextPeriod(new Date(2024, 11, 1), "month")).toEqual(
      new Date(2025, 0, 1),
    );
    expect(nextPeriod(new Date(2024, 0, 1), "year")).toEqual(
      new Date(2025, 0, 1),
    );
  });
});

describe("bucket", () => {
  it("returns nothing for no transactions", () => {
    expect(bucket([], "month")).toEqual([]);
  });

  it("sums per period, fills gaps with 0 and computes change", () => {
    const totals = bucket(
      [
        transaction(new Date(2025, 0, 6), -50.1),
        transaction(new Date(2025, 0, 8), -20.2),
        transaction(new Date(2025, 2, 3), 5),
        transaction(new Date(2025, 2, 4), -15),
      ],
      "month",
    );
    expect(totals).toEqual([
      { start: new Date(2025, 0, 1), total: -70.3, delta: 0, percent: 0 },
      { start: new Date(2025, 1, 1), total: 0, delta: 70.3, percent: 1 },
      { start: new Date(2025, 2, 1), total: -10, delta: -10, percent: 0 },
    ]);
  });
});

describe("movingAverage", () => {
  it("uses a trailing window, partial at the start", () => {
    expect(movingAverage([1, 2, 3, 4], 3)).toEqual([1, 1.5, 2, 3]);
    expect(movingAverage([4, 8], 1)).toEqual([4, 8]);
  });
});

describe("bestFit", () => {
  it("fits a least-squares line", () => {
    expect(bestFit([1, 3, 5])).toEqual({ slope: 2, points: [1, 3, 5] });
    expect(bestFit([2, 2, 2])).toEqual({ slope: 0, points: [2, 2, 2] });
  });

  it("handles fewer than two points", () => {
    expect(bestFit([7])).toEqual({ slope: 0, points: [7] });
    expect(bestFit([])).toEqual({ slope: 0, points: [] });
  });
});

describe("filterByTags", () => {
  const date = new Date(2025, 0, 1);
  const groceries = transaction(date, -1, ["groceries"]);
  const gas = transaction(date, -2, ["groceries", "fuel"]);
  const other = transaction(date, -3, ["untagged"]);
  const all = [groceries, gas, other];

  it("returns everything with no filters", () => {
    expect(filterByTags(all, [], [])).toEqual(all);
  });

  it("includes transactions with any included tag", () => {
    expect(filterByTags(all, ["groceries", "untagged"], [])).toEqual(all);
    expect(filterByTags(all, ["fuel"], [])).toEqual([gas]);
  });

  it("lets exclusion win", () => {
    expect(filterByTags(all, ["groceries"], ["fuel"])).toEqual([groceries]);
    expect(filterByTags(all, [], ["untagged"])).toEqual([groceries, gas]);
  });
});
