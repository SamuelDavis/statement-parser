import { ExtendProps, Tag, Transaction } from "./types.ts";
import statementsState from "./state/statementsState.ts";
import { For, splitProps } from "solid-js";
import HtmlDate from "./html/HtmlDate.tsx";
import HtmlAmount from "./html/HtmlAmount.tsx";
import { textToRegexp } from "./utilities.tsx";

type Props = ExtendProps<"table", { tag: Tag }, "children">;
export default function SpendingSummaryTable(props: Props) {
  const [local, parent] = splitProps(props, ["tag"]);
  const getRegexp = () => textToRegexp(local.tag.text);
  const getTransactions = () =>
    statementsState
      .getTransactions()
      .filter((transaction) => getRegexp().test(transaction.description));
  const getTransactionsByDate = () => {
    let dateTransactionsMap: Record<string, Transaction[]> = {};
    const minDate = new Date(getTransactions()[0].date.toDateString());
    const maxDate = new Date(
      getTransactions()[getTransactions().length - 1].date.toDateString(),
    );
    for (let i = new Date(minDate); i <= maxDate; i.setDate(i.getDate() + 1)) {
      for (const transaction of getTransactions()) {
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
            <HtmlAmount
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
                  <HtmlAmount
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
