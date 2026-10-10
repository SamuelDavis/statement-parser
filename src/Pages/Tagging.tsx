import { createMemo, For, Show } from "solid-js";
import { HTMLIcon, type Targeted } from "@samueldavis/solidlib";
import { useAppState } from "../state/AppState";
import { isMatch, toRegExp } from "../utils/matching";
import {
  createSearchParam,
  stringCodec,
  booleanCodec,
} from "../state/searchParams";
import { untagged } from "../types";
import DataList from "../Components/DataList";
import TransactionsSummary from "../Components/TransactionsSummary";
import TransactionsTable from "../Components/TransactionsTable";

export default function Tagging() {
  const app = useAppState();
  const [getLabel, setLabel] = createSearchParam("tag", "", stringCodec);
  const [getSearch, setSearch] = createSearchParam("q", "", stringCodec);
  const [getUntaggedOnly, setUntaggedOnly] = createSearchParam(
    "untagged",
    false,
    booleanCodec,
  );

  const getRegExp = () => (getSearch() ? toRegExp(getSearch()) : undefined);
  const getIsInvalid = () => getSearch() !== "" && !getRegExp();
  const getTag = () => app.findTag(getLabel().trim());
  const getCanAdd = () =>
    getLabel().trim() !== "" &&
    getLabel().trim() !== untagged &&
    getRegExp() !== undefined;
  const getTransactions = createMemo(() => {
    if (getIsInvalid()) return [];
    const regexp = getRegExp();
    const transactions = getUntaggedOnly()
      ? app
          .getTaggedTransactions()
          .filter((transaction) => transaction.tags.includes(untagged))
      : app.getTaggedTransactions();
    return regexp
      ? transactions.filter((transaction) =>
          isMatch(transaction.description, regexp),
        )
      : transactions;
  });

  function onLabel(event: Targeted<HTMLInputElement>): void {
    setLabel(event.currentTarget.value);
  }

  function onSearch(event: Targeted<HTMLInputElement>): void {
    setSearch(event.currentTarget.value);
  }

  function onUntaggedOnly(event: Targeted<HTMLInputElement>): void {
    setUntaggedOnly(event.currentTarget.checked);
  }

  function onSubmit(event: Targeted<HTMLFormElement, SubmitEvent>): void {
    event.preventDefault();
    if (!getCanAdd()) return;
    app.addMatcher(getLabel().trim(), getSearch());
    setSearch("");
  }

  function onRemoveMatcher(matcher: string): void {
    app.removeMatcher(getLabel().trim(), matcher);
  }

  return (
    <article>
      <header>
        <h1>Tagging</h1>
      </header>
      <form onSubmit={onSubmit}>
        <label>
          Tag
          <input
            type="text"
            list="tag-labels"
            placeholder="groceries"
            value={getLabel()}
            onInput={onLabel}
          />
        </label>
        <DataList id="tag-labels" options={app.getTagLabels()} />
        <Show when={getTag()}>
          {(getTag) => (
            <ul data-pills>
              <For each={getTag().matchers}>
                {(matcher) => (
                  <li>
                    <code>{matcher}</code>
                    <HTMLIcon
                      type="close"
                      title="Remove matcher"
                      onClick={[onRemoveMatcher, matcher]}
                    />
                  </li>
                )}
              </For>
            </ul>
          )}
        </Show>
        <fieldset role="group">
          <input
            type="search"
            placeholder="description contains… (regex)"
            value={getSearch()}
            onInput={onSearch}
            aria-invalid={getIsInvalid() || undefined}
          />
          <button type="submit" disabled={!getCanAdd()}>
            Add
          </button>
        </fieldset>
        <label>
          <input
            type="checkbox"
            role="switch"
            checked={getUntaggedOnly()}
            onInput={onUntaggedOnly}
          />
          Untagged only
        </label>
      </form>
      <p>
        <TransactionsSummary transactions={getTransactions()} />
      </p>
      <TransactionsTable
        transactions={getTransactions()}
        highlight={getRegExp()}
        current={getLabel().trim()}
      />
    </article>
  );
}
