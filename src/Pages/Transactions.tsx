import { For, useContext, createSignal, createMemo, Show } from "solid-js";
import { AppState } from "../Context";
import HTMLDate from "../Components/HTMLDate";
import HTMLNumber from "../Components/HTMLNumber";
import { assert, isNonNullable, type Targeted } from "@samueldavis/solidlib";
import { type Transaction, type Tag, createRegexp } from "../types";
import Highlighted from "../Components/Highlighted";
import TransactionsSummary from "../Components/TransactionsSummary";

export default function Transactions() {
  const state = useContext(AppState);
  assert(isNonNullable, state);

  const [getSearch, setSearch] = createSignal("");
  const [getTag, setTag] = createSignal("");
  const [getUntaggedOnly, setUntaggedOnly] = createSignal(false);
  const getRegExp = createRegexp(getSearch);
  const getTagSuggestions = () =>
    state
      .getTags()
      .map((tag) => tag.value)
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort();
  const getTransactions = createMemo((): Transaction[] => {
    const regexp = getRegExp();
    const tags = state.getTags();
    const transactions = state.getTransactions();

    const matchingTransactions = regexp
      ? transactions.filter((tx) => tx.description.match(regexp))
      : transactions;
    const untaggedOnly = getUntaggedOnly();

    return matchingTransactions.filter((tx) => {
      const isTagged = tags.some((tag) => tx.description.match(tag.regexp));
      return untaggedOnly ? !isTagged : isTagged;
    });
  });

  function onSearch(event: Targeted<HTMLInputElement>): void {
    setSearch(event.currentTarget.value);
  }

  function onTag(event: Targeted<HTMLInputElement>): void {
    setTag(event.currentTarget.value);
  }

  function onUntaggedOnly(event: Targeted<HTMLInputElement>): void {
    setUntaggedOnly(event.currentTarget.checked);
  }

  function onSubmit(event: Targeted<HTMLFormElement>): void {
    event.preventDefault();
    assert(isNonNullable, state);
    const regexp = getRegExp();
    const value = getTag();

    if (regexp && value) {
      state.addTag({ value, regexp });
      event.currentTarget.reset();
      setSearch("");
      setTag("");
    }
  }

  return (
    <article>
      <header>
        <form onSubmit={onSubmit}>
          <label>
            <span>Search</span>
            <input
              type="search"
              value={getSearch()}
              onInput={onSearch}
              required
            />
          </label>
          <label for="tag">Tag</label>
          <div role="group">
            <input
              id="tag"
              type="text"
              value={getTag()}
              onInput={onTag}
              list="tag-values"
              required
            />
            <datalist id="tag-values">
              <For each={getTagSuggestions()}>
                {(value) => <option value={value} />}
              </For>
            </datalist>
            <input type="submit" />
          </div>
        </form>
        <label>
          <span>Untagged Transactions Only</span>{" "}
          <input
            type="checkbox"
            checked={getUntaggedOnly()}
            onChange={onUntaggedOnly}
          />
        </label>
      </header>
      <header>
        <TransactionsSummary transactions={getTransactions()} />
      </header>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Amount</th>
          </tr>
        </thead>
        <For each={getTransactions()}>
          {(transaction) => (
            <TableGroup
              transaction={transaction}
              regexp={getRegExp()}
              tags={state.getTags()}
            />
          )}
        </For>
      </table>
    </article>
  );
}

function TableGroup(props: {
  transaction: Transaction;
  regexp?: RegExp;
  tags?: Tag[];
}) {
  const getTags = () => {
    const tags = props.tags?.filter((tag) =>
      props.transaction.description.match(tag.regexp),
    );
    return tags && tags.length > 0 ? tags : undefined;
  };
  return (
    <tbody>
      <tr>
        <td>
          <HTMLDate value={props.transaction.date} />
        </td>
        <td>
          <Highlighted
            value={props.transaction.description}
            regexp={props.regexp}
          />
        </td>
        <td>
          {<HTMLNumber value={props.transaction.amount} highlight money />}
        </td>
      </tr>
      <Show when={getTags()}>
        {(tags) => (
          <tr>
            <th></th>
            <td colspan={2}>
              <ul>
                <For each={tags()}>
                  {(tag) => (
                    <li>
                      <small>
                        <em>
                          <Highlighted
                            value={tag.value}
                            regexp={props.regexp}
                          />
                        </em>
                      </small>
                    </li>
                  )}
                </For>
              </ul>
            </td>
          </tr>
        )}
      </Show>
    </tbody>
  );
}
