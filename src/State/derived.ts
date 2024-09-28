import { createMemo, createRoot } from "solid-js";
import statements from "./statements.ts";
import tags from "./tags.ts";

const derived = createRoot(() => {
  const getUntaggedTransactions = createMemo(() => {
    const transactions = statements.getTransactions();
    const regexps = tags.getRegexps();
    return transactions.filter(
      (transaction) =>
        !regexps.some((regexp) => regexp.test(transaction.description)),
    );
  });

  return { getUntaggedTransactions };
});

export default derived;
