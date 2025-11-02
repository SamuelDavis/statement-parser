import { useContext, For, createSignal, createMemo, Show } from "solid-js";
import { AppState } from "../Context";
import TransactionsSummary from "../Components/TransactionsSummary";
import HTMLDate from "../Components/HTMLDate";
import Highlighted from "../Components/Highlighted";
import HTMLNumber from "../Components/HTMLNumber";
import { assert, isNonNullable, type Targeted } from "@samueldavis/tslib";
import { createRegexp, type Tag, type Transaction } from "../types";

export default function Tags() {
  const state = useContext(AppState);
  assert(isNonNullable, state);

  const [getSearch, setSearch] = createSignal("");
  function onSearch(event: Targeted<HTMLInputElement>): void {
    setSearch(event.currentTarget.value);
  }
  const getRegExp = createRegexp(getSearch);
  const getTags = () => {
    const tags = state.getTags() ?? [];
    const regexp = getRegExp();
    return regexp ? tags?.filter((tag) => tag.value.match(regexp)) : tags;
  };

  return (
    <article>
      <header>
        <label>
          <span>Search</span>
          <input type="search" value={getSearch()} onInput={onSearch} />
        </label>
      </header>
      <dl>
        <For each={getTags()} fallback={<dt>No tags have been defined.</dt>}>
          {(tag) => <TagTransactions tag={tag} regexp={getRegExp()} />}
        </For>
      </dl>
    </article>
  );
}

function TagTransactions(props: { tag: Tag; regexp?: RegExp }) {
  const state = useContext(AppState);
  assert(isNonNullable, state);
  const getTransactions = () => {
    const transactions =
      state
        .getTransactions()
        .filter((tx) => tx.description.match(props.tag.regexp)) ?? [];
    return transactions.length > 0 ? transactions : undefined;
  };

  return (
    <section>
      <header>
        <h2>{props.tag.value}</h2>
        <small>{props.tag.regexp.source}</small>
        <button onClick={[state.removeTag, props.tag]}>Delete</button>
      </header>
      <Show
        when={getTransactions()}
        fallback={<TransactionsSummary transactions={[]} />}
      >
        {(getTransactions) => (
          <details>
            <summary>
              <TransactionsSummary transactions={getTransactions()} />
            </summary>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <For each={getTransactions()}>
                  {(transaction) => (
                    <tr>
                      <td>
                        <HTMLDate value={transaction.date} />
                      </td>
                      <td>
                        <Highlighted
                          value={transaction.description}
                          regexp={props.regexp}
                        />
                      </td>
                      <td>
                        <HTMLNumber
                          value={transaction.amount}
                          highlight
                          money
                        />
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </details>
        )}
      </Show>
    </section>
  );
}
