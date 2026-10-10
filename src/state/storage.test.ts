import { describe, expect, it } from "vitest";
import { decodeStatements, decodeTags } from "./storage";
import type { Statement, Tag } from "../types";

describe("decodeStatements", () => {
  it("round-trips JSON, reviving dates", () => {
    const statements: Statement[] = [
      {
        date: new Date(2025, 5, 1, 12),
        name: "jan.csv",
        transactions: [
          { date: new Date(2025, 0, 6), description: "ALDI", amount: -20.2 },
        ],
      },
    ];
    expect(decodeStatements(JSON.stringify(statements))).toEqual(statements);
  });

  it.each([
    "{}",
    '[{"name":"a","transactions":[]}]',
    '[{"date":"nope","name":"a","transactions":[]}]',
    '[{"date":"2025-01-01","name":"a","transactions":[{"date":"2025-01-01","description":"x","amount":"1"}]}]',
  ])("rejects %s", (text) => {
    expect(() => decodeStatements(text)).toThrow(TypeError);
  });
});

describe("decodeTags", () => {
  it("round-trips JSON", () => {
    const tags: Tag[] = [{ label: "groceries", matchers: ["kroger"] }];
    expect(decodeTags(JSON.stringify(tags))).toEqual(tags);
  });

  it.each(['[{"label":"a"}]', '[{"label":"a","matchers":[1]}]'])(
    "rejects %s",
    (text) => {
      expect(() => decodeTags(text)).toThrow(TypeError);
    },
  );
});
