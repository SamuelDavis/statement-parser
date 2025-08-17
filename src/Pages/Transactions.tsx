import { createSignal } from "solid-js";
import TransactionsTable from "../Components/TransactionsTable";
import { derived } from "../state";
import { Flags, type Targeted } from "../types";
import { persist, undefineFalsy } from "../utilities";

export default function Transactions() {
  const [getSearch, setSearch] = persist(createSignal(""), {
    key: "q",
    driver: "query",
  });
  const getTransactions = () =>
    derived.getTransactions({
      matching: undefineFalsy(new RegExp(getSearch(), Flags)),
    });

  function onSearch(event: Targeted<InputEvent>): void {
    setSearch(event.currentTarget.value);
  }

  return (
    <article>
      <header>
        <h1>Transactions</h1>
        <input type="search" onInput={onSearch} value={getSearch()} />
      </header>
      <TransactionsTable
        transactions={getTransactions()}
        controls={true}
        tags={true}
      />
    </article>
  );
}
