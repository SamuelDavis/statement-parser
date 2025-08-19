import { Show, splitProps } from "solid-js";
import type { ExtendProps, Transaction } from "../types";
import HTMLDate from "./HTMLDate";
import HTMLNumber from "./HTMLNumber";

type Props = ExtendProps<"span", { transactions: Transaction[] }, "children">;
export default function TransactionsSummary(props: Props) {
  const [local, parent] = splitProps(props, ["transactions"]);
  const get = () => {
    const from = local.transactions[0]?.date;
    const to = local.transactions[local.transactions.length - 1]?.date;
    const total = local.transactions.reduce(
      (acc, transaction) => acc + transaction.amount,
      0,
    );

    return from && to ? { from, to, total } : undefined;
  };

  return (
    <Show when={get()}>
      {(get) => (
        <span {...parent}>
          <HTMLNumber
            value={local.transactions.length}
            currency={false}
            precision={0}
          />
          <span> transactions between </span>
          <HTMLDate value={get().from} />
          <span> and </span>
          <HTMLDate value={get().to} />
          <span> for a value of </span>
          <HTMLNumber value={get().total} />
          <span>.</span>
        </span>
      )}
    </Show>
  );
}
