import { Show } from "solid-js";
import { HTMLDate, HTMLNumber } from "@samueldavis/solidlib";
import { sum } from "../utils/analysis";
import type { Transaction } from "../types";
import Money from "./Money";

export default function TransactionsSummary(props: {
  transactions: Transaction[];
}) {
  const getRange = () => {
    const times = props.transactions.map((transaction) =>
      transaction.date.getTime(),
    );
    return times.length > 0
      ? { from: new Date(Math.min(...times)), to: new Date(Math.max(...times)) }
      : undefined;
  };
  const getTotal = () =>
    sum(props.transactions.map((transaction) => transaction.amount));

  return (
    <Show when={getRange()} fallback={<span>No transactions.</span>}>
      {(getRange) => (
        <span>
          <HTMLNumber value={props.transactions.length} precision={0} />{" "}
          transactions from <HTMLDate value={getRange().from} /> to{" "}
          <HTMLDate value={getRange().to} /> totalling{" "}
          <Money value={getTotal()} />
        </span>
      )}
    </Show>
  );
}
