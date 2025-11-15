import { For, useContext } from "solid-js";
import { AppState } from "../Context";
import HTMLDate from "../Components/HTMLDate";
import HTMLNumber from "../Components/HTMLNumber";
import TransactionsSummary from "../Components/TransactionsSummary";
import { assert, HTMLIcon, isNonNullable } from "@samueldavis/solidlib";

export default function Statements() {
  const state = useContext(AppState);
  assert(isNonNullable, state);

  return (
    <article>
      <For each={state.getStatements()}>
        {(statement) => (
          <article>
            <header>
              <h2>
                <span>{statement.name}</span>
                <HTMLIcon
                  type="delete"
                  onClick={[state.removeStatement, statement]}
                />
              </h2>
              <HTMLDate value={statement.date} />
            </header>
            <header></header>
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
