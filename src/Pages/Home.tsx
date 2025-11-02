import { Show, useContext } from "solid-js";
import { AppState } from "../Context";
import { A } from "@solidjs/router";
import { assert, isNonNullable } from "@samueldavis/tslib";

export default function Home() {
  const state = useContext(AppState);
  assert(isNonNullable, state);

  return (
    <article>
      <Show
        when={state.getStatements().length > 0}
        fallback={
          <p>
            No statements available. <A href={"/upload"}>Try uploading one</A>.
          </p>
        }
      >
        <section>
          <h2>Tags</h2>
          <p>You have {state.getTags().length} tag(s).</p>
        </section>
        <section>
          <h2>Statements</h2>
          <p>You have {state.getStatements().length} statement(s).</p>
        </section>
        <section>
          <h2>Transactions</h2>
          <p>You have {state.getTransactions().length} transaction(s).</p>
        </section>
      </Show>
    </article>
  );
}
