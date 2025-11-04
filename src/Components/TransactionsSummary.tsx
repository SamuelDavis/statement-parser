import { formatDuration, intervalToDuration, isEqual } from "date-fns";
import type { Transaction } from "../types";
import HTMLNumber from "./HTMLNumber";

export default function TransactionsSummary(props: {
  transactions: Transaction[];
}) {
  const getTotal = () =>
    props.transactions.reduce(
      (acc, transaction) => acc + transaction.amount,
      0,
    );
  const getInterval = () => {
    const end = props.transactions[0]?.date;
    const start = props.transactions[props.transactions.length - 1]?.date;
    if (start && end && !isEqual(start, end)) {
      const parts = formatDuration(
        intervalToDuration({
          start: new Date(start),
          end: new Date(end),
        }),
        { delimiter: ";" },
      ).split(";");
      const last = parts.pop();
      return `${parts.join(", ")} and ${last}`;
    }
    return "some time";
  };
  return (
    <span>
      <HTMLNumber value={props.transactions.length} />
      <span> transactions totalling </span>
      <HTMLNumber value={getTotal()} highlight money />
      <span> over {getInterval()}</span>.
    </span>
  );
}
