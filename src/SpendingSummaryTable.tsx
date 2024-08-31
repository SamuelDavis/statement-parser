import { ExtendProps, Tag, Transaction } from "./types.ts";
import statementsState from "./state/statementsState.ts";
import { For, splitProps } from "solid-js";
import HtmlDate from "./Date.tsx";
import Amount from "./Amount.tsx";

type Props = ExtendProps<"table", { tag: Tag }, "children">;
export default function SpendingSummaryTable(props: Props) {
  const [local, parent] = splitProps(props, ["tag"]);
  const getRegexp = () => new RegExp(local.tag.text, "gi");
  const getTransactions = () =>
    statementsState
      .getTransactions()
      .filter((transaction) => getRegexp().test(transaction.description));
  const getTransactionsByDate = () => {
    let dateTransactionsMap: Record<string, Transaction[]> = {};
    const transactionsSortedByDate = getTransactions().sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );
    const minDate = new Date(transactionsSortedByDate[0].date.toDateString());
    const maxDate = new Date(
      transactionsSortedByDate[
        transactionsSortedByDate.length - 1
      ].date.toDateString(),
    );
    for (let i = new Date(minDate); i <= maxDate; i.setDate(i.getDate() + 1)) {
      for (const transaction of transactionsSortedByDate) {
        const dateKey = transaction.date.toDateString();
        const date = new Date(dateKey);
        if (i.toDateString() === date.toDateString())
          dateTransactionsMap = {
            ...dateTransactionsMap,
            [dateKey]: [...(dateTransactionsMap[dateKey] ?? []), transaction],
          };
      }
    }
    return Object.entries(dateTransactionsMap);
  };
  return (
    <table {...parent}>
      <thead>
        <tr>
          <th>Label</th>
          <th>Text</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{local.tag.label}</td>
          <td>{local.tag.text.split("|").join(", ")}</td>
          <td>
            <Amount
              value={getTransactions().reduce(
                (acc, transaction) => acc + transaction.amount,
                0,
              )}
            />
          </td>
        </tr>
      </tbody>
      <thead>
        <tr>
          <th>Date</th>
          <th>Transactions</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <For each={getTransactionsByDate()}>
          {([date, transactions]) => {
            return (
              <tr>
                <td>
                  <HtmlDate value={new Date(date)} />
                </td>
                <td>{transactions.length}</td>
                <td>
                  <Amount
                    title={transactions
                      .map((transaction) => transaction.description)
                      .join(", ")}
                    value={transactions.reduce(
                      (acc, transaction) => acc + transaction.amount,
                      0,
                    )}
                  />
                </td>
              </tr>
            );
          }}
        </For>
      </tbody>
    </table>
  );
}
