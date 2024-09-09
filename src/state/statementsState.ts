import { createMemo, createRoot } from "solid-js";
import { createSignal } from "../utilities.tsx";
import {
  hasProperties,
  isArray,
  isDate,
  isNumber,
  isString,
  normalHeaders,
  Statement,
  Transaction,
} from "../types.ts";

function sortTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.sort((a, b) => a.date.getTime() - b.date.getTime());
}

const statementsState = createRoot(() => {
  const [getStatements, setStatements] = createSignal<Statement[]>([], {
    storageKey: "statements",
    storageEncoder(value) {
      return JSON.stringify(
        value.map((statement) => ({
          ...statement,
          transactions: sortTransactions(statement.transactions),
        })),
      );
    },
    storageParser(value) {
      if (!isArray(value)) throw new TypeError();
      return value.map((value): Statement => {
        if (!hasProperties(["name", "date", "transactions"], value))
          throw new TypeError();
        const { name, transactions: rows } = value;
        const date = new Date(value.date);
        if (!isDate(date)) throw new TypeError();
        if (!isArray(rows)) throw new TypeError();
        const transactions = rows.map((value): Transaction => {
          if (!hasProperties(normalHeaders, value)) throw new TypeError();
          const date = new Date(value.date);
          const description = value.description;
          const amount = Number(value.amount);
          if (!isDate(date)) throw new TypeError();
          if (!isString(description)) throw new TypeError();
          if (!isNumber(amount)) throw new TypeError();
          return { date, description, amount };
        });
        return { name, date, transactions: sortTransactions(transactions) };
      });
    },
  });
  const statementExists = (statement: Statement) =>
    getStatements().some(({ name }) => name === statement.name);
  const addStatement = (statement: Statement) =>
    setStatements((statements) => [
      ...statements.filter(({ name }) => name !== statement.name),
      statement,
    ]);
  const getTransactions = createMemo(() => {
    return sortTransactions(
      getStatements().flatMap((statement) => statement.transactions),
    );
  });

  return {
    getStatements,
    statementExists,
    addStatement,
    getTransactions,
  };
});

export default statementsState;
