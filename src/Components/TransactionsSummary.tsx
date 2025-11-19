import { formatDuration } from "date-fns";
import { TransactionGroup, type Transaction } from "../types";
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
    const group = new TransactionGroup(getTransactions());
    const duration = group.duration;
    if ((duration.seconds ?? 0) < 1) return "some time";

    const parts = formatDuration(duration, { delimiter: ";" }).split(";");
    const last = parts.pop();
    if (parts.length === 0) return last;
    if (parts.length === 1) return `${parts} and ${last}`;
    return `${parts.join(", ")}, and ${last}`;
  };
  const getPluralized = () =>
    "transactions" + (getTransactions().length === 1 ? "" : "s");

  return (
    <p {...parent}>
      <HTMLNumber value={getTransactions().length} precision={0} />
      <span> {getPluralized()} totalling </span>
      <HTMLNumber value={getTotal()} highlight money />
      <span> over {getInterval()}</span>.
    </p>
  );
}
