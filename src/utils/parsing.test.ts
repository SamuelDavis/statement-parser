import { describe, expect, it } from "vitest";
import {
  guessMapping,
  isCompleteMapping,
  parseAmount,
  parseDate,
  parseDescription,
  parseRows,
  readCsv,
} from "./parsing";

const mapping = { date: "Date", description: "Description", amount: "Amount" };

describe("parseDate", () => {
  it("parses MM/DD/YYYY as a local date", () => {
    expect(parseDate("01/06/2025")).toEqual(new Date(2025, 0, 6));
    expect(parseDate(" 12/31/2025 ")).toEqual(new Date(2025, 11, 31));
  });

  it.each([
    "1/6/2025",
    "2025-01-06",
    "06/01/25",
    "02/30/2025",
    "13/01/2025",
    "",
  ])("rejects %j", (value) => {
    expect(parseDate(value)).toBeUndefined();
  });
});

describe("parseAmount", () => {
  it.each([
    ["-1018.14", -1018.14],
    ["224.99", 224.99],
    ["5", 5],
  ])("parses %j", (value, expected) => {
    expect(parseAmount(value)).toBe(expected);
  });

  it.each(["$1", "1,000.00", "(12.00)", "12.34 CR", "", "1.2.3", "-"])(
    "rejects %j",
    (value) => {
      expect(parseAmount(value)).toBeUndefined();
    },
  );
});

describe("parseDescription", () => {
  it("trims and rejects blanks", () => {
    expect(parseDescription("  KROGER ")).toBe("KROGER");
    expect(parseDescription("   ")).toBeUndefined();
  });
});

describe("guessMapping", () => {
  it("matches headers containing field names case-insensitively", () => {
    expect(
      guessMapping(["Posting Date", "DESCRIPTION", "Amount", "Balance"]),
    ).toEqual({
      date: "Posting Date",
      description: "DESCRIPTION",
      amount: "Amount",
    });
  });

  it("leaves unmatched fields undefined", () => {
    expect(isCompleteMapping(guessMapping(["Date", "Memo"]))).toBe(false);
    expect(isCompleteMapping(mapping)).toBe(true);
  });
});

describe("parseRows", () => {
  it("parses valid rows", () => {
    expect(
      parseRows(
        [{ Date: "01/06/2025", Description: "ALDI", Amount: "-20.20" }],
        mapping,
      ),
    ).toEqual({
      transactions: [
        { date: new Date(2025, 0, 6), description: "ALDI", amount: -20.2 },
      ],
      errors: [],
    });
  });

  it("reports every invalid value with its row", () => {
    const { transactions, errors } = parseRows(
      [
        { Date: "01/06/2025", Description: "ALDI", Amount: "-20.20" },
        { Date: "Pending", Description: "", Amount: "$1" },
      ],
      mapping,
    );
    expect(transactions).toHaveLength(1);
    expect(errors).toEqual([
      { line: 2, field: "date", value: "Pending" },
      { line: 2, field: "description", value: "" },
      { line: 2, field: "amount", value: "$1" },
    ]);
  });
});

describe("readCsv", () => {
  it("reads headers and rows, skipping blank lines", async () => {
    const file = new File(
      ['Date,Description,Amount\n01/06/2025,"ALDI, INC",-20.20\n\n'],
      "jan.csv",
    );
    expect(await readCsv(file)).toEqual({
      name: "jan.csv",
      headers: ["Date", "Description", "Amount"],
      rows: [
        { Date: "01/06/2025", Description: "ALDI, INC", Amount: "-20.20" },
      ],
    });
  });

  it("throws on malformed rows", async () => {
    const file = new File(["a,b\n1,2,3\n"], "bad.csv");
    await expect(readCsv(file)).rejects.toThrow(/Row/);
  });
});
