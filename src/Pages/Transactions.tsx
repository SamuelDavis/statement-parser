import { For } from "solid-js";
import Statements from "../State/statements.ts";
import DateStamp from "../Components/DateStamp.tsx";
import Amount from "../Components/Amount.tsx";

export default function Transactions() {
  return (
    <article>
      <h1>Transactions</h1>
      <For each={Statements.getTransactions()}>
        {(transaction) => (
          <article>
            <dl role="group">
              <dt>Date</dt>
              <dd>
                <DateStamp value={transaction.date} />
              </dd>
              <dt>Amount</dt>
              <dd>
                <Amount value={transaction.amount} />
              </dd>
            </dl>
            <q>{transaction.description}</q>
          </article>
        )}
      </For>
    </article>
  );
}
