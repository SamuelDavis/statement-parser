import { createMemo, createRoot } from "solid-js";
import tagsState from "./tagsState.ts";
import statementsState from "./statementsState.ts";

const derivedState = createRoot(() => {
  const getUntaggedTransactions = createMemo(() => {
    return statementsState
      .getTransactions()
      .filter((transaction) => !tagsState.isTagged(transaction));
  });
  const getUntaggedTransactionCount = () => getUntaggedTransactions().length;

  return { getUntaggedTransactions, getUntaggedTransactionCount };
});
export default derivedState;
