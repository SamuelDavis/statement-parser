import { formatDuration, intervalToDuration, isEqual } from "date-fns";
import type { Transaction } from "../types";
import HTMLNumber from "./HTMLNumber";
import { createMemo, splitProps } from "solid-js";
import type { ExtendProps } from "@samueldavis/solidlib";

type Props = ExtendProps<"p", { transactions: Transaction[] }>;
export default function TransactionsSummary(props: Props) {
  const [local, parent] = splitProps(props, ["transactions"]);
  const getTransactions = createMemo(() =>
    local.transactions.sort((a, b) => b.date.getTime() - a.date.getTime()),
  );
  const getTotal = () =>
    getTransactions().reduce((acc, tx) => acc + tx.amount, 0);
  const getInterval = () => {
    const transactions = getTransactions();
    const end = transactions[0]?.date;
    const start = transactions[transactions.length - 1]?.date;
    if (start && end && !isEqual(start, end)) {
      const parts = formatDuration(
        intervalToDuration({ start: new Date(start), end: new Date(end) }),
        { delimiter: ";" },
      ).split(";");
      const last = parts.pop();
      if (parts.length === 0) return last;
      if (parts.length === 1) return `${parts} and ${last}`;
      return `${parts.join(", ")}, and ${last}`;
    }
    return "some time";
  };
  return (
    <p {...parent}>
      <HTMLNumber value={getTransactions().length} />
      <span> transactions totalling </span>
      <HTMLNumber value={getTotal()} highlight money />
      <span> over {getInterval()}</span>.
    </p>
  );
}
