import { For, useContext, createSignal, createMemo } from "solid-js";
import { AppState } from "../Context";
import HTMLDate from "../Components/HTMLDate";
import HTMLNumber from "../Components/HTMLNumber";
import type { Targeted } from "@samueldavis/tslib";
import type { Transaction } from "../types";
import Highlighted from "../Components/Highlighted";

export default function Transactions() {
  const state = useContext(AppState);
  const [getSearch, setSearch] = createSignal("");
  const getRegExp = (): undefined | RegExp => {
    const search = getSearch();
    if (!search.trim()) return undefined;

    try {
      return new RegExp(getSearch(), "gi");
    } catch (error) {
      console.error(error);
      return undefined;
    }
  };
  const getTransactions = createMemo((): Transaction[] => {
    const regexp = getRegExp();
    const transactions = state?.getTransactions() ?? [];
    return regexp
      ? transactions.filter((tx) => tx.description.match(regexp))
      : transactions;
  });
  const getTotal = createMemo(() =>
    getTransactions().reduce((acc, transaction) => acc + transaction.amount, 0),
  );

  function onSearch(event: Targeted<HTMLInputElement>): void {
    setSearch(event.currentTarget.value);
  }

  return (
    <article>
      <header>
        <label>
          <span>Search</span>
          <input type="search" value={getSearch()} onInput={onSearch} />
        </label>
        <p>
          <HTMLNumber value={getTransactions().length} /> memos totalling{" "}
          <HTMLNumber value={getTotal()} highlight money />.
        </p>
      </header>
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
            {(row) => (
              <tr>
                <td>
                  <HTMLDate value={row.date} />
                </td>
                <td>
                  <Highlighted value={row.description} regexp={getRegExp()} />
                </td>
                <td>{<HTMLNumber value={row.amount} highlight money />}</td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </article>
  );
}
