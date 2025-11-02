import { For, useContext } from "solid-js";
import { AppState } from "../Context";
import HTMLDate from "../Components/HTMLDate";
import HTMLNumber from "../Components/HTMLNumber";
import TransactionsSummary from "../Components/TransactionsSummary";

export default function Home() {
  const state = useContext(AppState);

  return (
    <article>
      <For each={state?.getStatements()}>
        {(statement) => (
          <article>
            <header>
              <h2>{statement.name}</h2>
              <HTMLDate value={statement.date} />
            </header>
            <p>
              <TransactionsSummary transactions={statement.rows} />
            </p>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <For each={statement.rows.slice(0, 3)}>
                  {(row) => (
                    <tr>
                      <td>
                        <HTMLDate value={row.date} />
                      </td>
                      <td>{row.description}</td>
                      <td>
                        {<HTMLNumber value={row.amount} highlight money />}
                      </td>
                    </tr>
                  )}
                </For>
                <tr>
                  <td colspan={3}>...</td>
                </tr>
              </tbody>
            </table>
          </article>
        )}
      </For>
    </article>
  );
}
