import { createRoot } from "solid-js";
import {
  hasProperties,
  isArray,
  isDate,
  isNumber,
  normalHeaders,
  Statement,
  Transaction,
} from "../types.ts";
import { createSignal } from "../utilities.ts";

const statements = createRoot(() => {
  const [getStatements, setStatements] = createSignal<Statement[]>([], {
    storageKey: "statements",
    storageParser,
  });
  const statementExists = (statement: Statement) =>
    getStatements().some((existing) => existing.name === statement.name);
  const addStatement = (statement: Statement) => {
    setStatements((statements) => [...statements, statement]);
  };

  const getTransactions = () =>
    getStatements().flatMap((statement) => statement.transactions);

  return { statementExists, addStatement, getStatements, getTransactions };
});

export default statements;

function storageParser(value: any): Statement[] {
  if (!isArray(value)) throw new TypeError();
  return value.map((value): Statement => {
    if (!hasProperties(["name", "date", "transactions"], value))
      throw new TypeError();
    const { name, date: rawDate, transactions: rawTransactions } = value;
    if (!name) throw new TypeError();
    const date = new Date(rawDate);
    if (!isDate(date)) throw new TypeError();
    const transactions = rawTransactions.map((value: any): Transaction => {
      if (!hasProperties(normalHeaders, value)) throw new TypeError();
      const { date: rawDate, description, amount } = value;
      const date = new Date(rawDate);
      if (!isDate(date)) throw new TypeError();
      if (!description) throw new TypeError();
      if (!isNumber(amount)) throw new TypeError();
      return { date, description, amount };
    });

    return { name, date, transactions };
  });
}
