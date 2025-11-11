import { For, useContext, createSignal, createMemo, Show } from "solid-js";
import { AppState } from "../Context";
import HTMLDate from "../Components/HTMLDate";
import HTMLNumber from "../Components/HTMLNumber";
import { assert, isNonNullable, type Targeted } from "@samueldavis/tslib";
import { type Transaction, type Tag, createRegexp } from "../types";
import Highlighted from "../Components/Highlighted";
import TransactionsSummary from "../Components/TransactionsSummary";

export default function Transactions() {
  const state = useContext(AppState);
  assert(isNonNullable, state);

  const [getSearch, setSearch] = createSignal("");
  const [getTag, setTag] = createSignal("");
  const getRegExp = createRegexp(getSearch);
  const getTransactions = createMemo((): Transaction[] => {
    const regexp = getRegExp();
    const transactions = state.getTransactions() ?? [];
    if (!regexp) return transactions;

    const tags = state.getTags().filter((tag) => tag.value.match(regexp));
    return transactions.filter(
      (tx) =>
        tx.description.match(regexp) ||
        tags?.some((tag) => tx.description.match(tag.regexp)),
    );
  });

  function onSearch(event: Targeted<HTMLInputElement>): void {
    setSearch(event.currentTarget.value);
  }

  function onTag(event: Targeted<HTMLInputElement>): void {
    setTag(event.currentTarget.value);
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
              required
            />
            <input type="submit" />
          </div>
        </form>
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
