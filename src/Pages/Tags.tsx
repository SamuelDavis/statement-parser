import { For } from "solid-js";
import { A } from "@solidjs/router";
import { assert, isString, type Targeted } from "@samueldavis/solidlib";
import { useAppState } from "../state/AppState";
import type { Tag } from "../types";
import TransactionsSummary from "../Components/TransactionsSummary";

export default function Tags() {
  const app = useAppState();

  return (
    <article>
      <header>
        <h1>Tags</h1>
      </header>
      <For
        each={app.getTags()}
        fallback={
          <p>
            No tags yet. Create some in <A href="/tagging">Tagging</A>.
          </p>
        }
      >
        {(tag) => <TagCard tag={tag} />}
      </For>
    </article>
  );
}

function TagCard(props: { tag: Tag }) {
  const app = useAppState();
  const getTransactions = () =>
    app
      .getTaggedTransactions()
      .filter((transaction) => transaction.tags.includes(props.tag.label));
  const getEditHref = () =>
    `/tagging?${new URLSearchParams({ tag: props.tag.label })}`;

  function onRename(event: Targeted<HTMLFormElement, SubmitEvent>): void {
    event.preventDefault();
    const label = new FormData(event.currentTarget).get("label");
    assert(isString, label);
    if (label.trim() !== "") app.renameTag(props.tag.label, label.trim());
  }

  return (
    <article>
      <form onSubmit={onRename}>
        <fieldset role="group">
          <input
            type="text"
            name="label"
            value={props.tag.label}
            aria-label="Tag name"
            required
          />
          <button type="submit" class="secondary">
            Rename
          </button>
          <A href={getEditHref()} role="button">
            Edit
          </A>
        </fieldset>
      </form>
      <ul data-pills>
        <For each={props.tag.matchers}>
          {(matcher) => (
            <li>
              <code>{matcher}</code>
            </li>
          )}
        </For>
      </ul>
      <TransactionsSummary transactions={getTransactions()} />
    </article>
  );
}
