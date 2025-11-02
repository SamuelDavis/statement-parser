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
  return (
    <span>
      <HTMLNumber value={props.transactions.length} />
      <span> transactions totalling </span>
      <HTMLNumber value={getTotal()} highlight money />.
    </span>
  );
}
