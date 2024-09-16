import { For } from "solid-js";
import statements from "../State/statements.ts";
import DateStamp from "../Components/DateStamp.tsx";
import Number from "../Components/Number.tsx";

export default function Statements() {
  return (
    <article>
      <h1>Statements</h1>
      <For
        each={statements.getStatements()}
        fallback={<p>You have no statements saved.</p>}
      >
        {(statement) => (
          <article>
            <hgroup>
              <h3>{statement.name}</h3>
              <DateStamp value={statement.date} />
            </hgroup>
            <dl>
              <dt>Total Transactions</dt>
              <dd>
                <Number value={statement.transactions.length} />
              </dd>
            </dl>
          </article>
        )}
      </For>
    </article>
  );
}
