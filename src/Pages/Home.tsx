import { For, useContext } from "solid-js";
import { AppState } from "../Context";
import { assert } from "@samueldavis/tslib";

function isNonNullable<T>(v: T): v is NonNullable<T> {
  return v !== null && v !== undefined;
}

export default function Home() {
  const state = useContext(AppState);

  return (
    <article>
      <For each={state?.getStatements()}>
        {(statement) => (
          <article>
            <h2>{statement.name}</h2>
            <small>{statement.date.toLocaleDateString()}</small>
            <p>There are {statement.rows.length} rows.</p>
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
                      <td>{row.date.toLocaleDateString()}</td>
                      <td>{row.description}</td>
                      <td>{row.amount.toLocaleString()}</td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </article>
        )}
      </For>
    </article>
  );
}
