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
import tagsState from "./tagsState.ts";

const statementsState = createRoot(() => {
  const [getStatements, setStatements] = createSignal<Statement[]>([], {
    storageKey: "statements",
    storageParser(value) {
      if (!isArray(value)) throw new TypeError();
      return value.map((value): Statement => {
        if (!hasProperties(["name", "date", "transactions"], value))
          throw new TypeError();
        const { transactions: rows } = value;
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
        return { name: value.name, date, transactions };
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
  const getStatementSummaries = () =>
    getStatements().map((statement) => ({
      name: statement.name,
      date: statement.date,
      from: statement.transactions.reduce(
        (from, transaction) =>
          from.getTime() < transaction.date.getTime() ? from : transaction.date,
        new Date(+Infinity),
      ),
      to: statement.transactions.reduce(
        (to, transaction) =>
          to.getTime() > transaction.date.getTime() ? to : transaction.date,
        new Date(-Infinity),
      ),
      transactionCount: statement.transactions.length,
      total: statement.transactions.reduce(
        (total, transaction) => total + transaction.amount,
        0,
      ),
    }));
  const getTransactions = createMemo(() =>
    getStatements().flatMap((statement) => statement.transactions),
  );
  const getUntaggedTransactions = createMemo(() => {
    const texts = tagsState.getTexts();
    return getTransactions().filter(
      (transaction) =>
        !texts.some((text) =>
          new RegExp(text, "gi").test(transaction.description),
        ),
    );
  });

  const getUntaggedTransactionCount = () => getUntaggedTransactions().length;

  return {
    getStatements,
    statementExists,
    addStatement,
    getStatementSummaries,
    getTransactions,
    getUntaggedTransactions,
    getUntaggedTransactionCount,
  };
});

export default statementsState;
