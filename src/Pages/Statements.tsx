import { For } from "solid-js";
import HTMLDate from "../Components/HTMLDate";
import HTMLNumber from "../Components/HTMLNumber";
import { statements } from "../state";
import { transactionFields } from "../types";

export default function App() {
  return (
    <article>
      <h1>Statements</h1>
      <For each={statements.get()} fallback={<p>No statements available.</p>}>
        {(statement) => (
          <article>
            <h2>{statement.name}</h2>
            <h3>
              <HTMLDate value={statement.date} />
            </h3>
            <details open>
              <summary>Transactions</summary>
              <table>
                <thead>
                  <tr>
                    <For each={transactionFields}>
                      {(field) => <th>{field}</th>}
                    </For>
                  </tr>
                </thead>
                <tbody>
                  <For each={statement.transactions}>
                    {(transaction) => (
                      <tr>
                        <For each={transactionFields}>
                          {(field) => {
                            switch (field) {
                              case "date":
                                return (
                                  <td>
                                    <HTMLDate value={transaction.date} />
                                  </td>
                                );
                              case "description":
                                return <td>{transaction.description}</td>;
                              case "amount":
                                return (
                                  <td>
                                    <HTMLNumber value={transaction.amount} />
                                  </td>
                                );
                            }
                          }}
                        </For>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </details>
          </article>
        )}
      </For>
    </article>
  );
}
