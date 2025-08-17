import { createSignal, Show } from "solid-js";
import DataList from "../Components/DataList";
import TransactionsTable from "../Components/TransactionsTable";
import { derived, tags } from "../state";
import { Flags, type Tag, type Targeted } from "../types";
import { persist, undefineFalsy } from "../utilities";

export default function Sandbox() {
  const [getSearch, setSearch] = persist(createSignal(""), {
    key: "q",
    driver: "query",
  });
  const getRegexp = () => undefineFalsy(new RegExp(getSearch(), Flags));
  const getTransactions = () =>
    derived.getTransactions({ matching: getRegexp() });
  const getFirstUntagged = () => derived.getUntaggedTransactions()[0];

  function onSubmit(event: Targeted<SubmitEvent>): void {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const search = undefineFalsy(data.get("search")?.toString());
    const text = undefineFalsy(data.get("text")?.toString());
    const ignore = data.get("ignore")?.toString() === "on";
    if (!search || !text) return;

    const tag: Tag = { regexp: new RegExp(search, Flags), value: text, ignore };
    if (!getFirstUntagged().description.match(tag.regexp)) {
      alert(`Search not found in transaction description.`);
      return;
    }

    tags.add(tag);
    setSearch("");
    event.currentTarget.reset();
  }

  function onInput(event: Targeted<InputEvent>): void {
    setSearch(event.currentTarget.value);
  }

  return (
    <article>
      <h1>Tagging</h1>
      <section>
        <form onSubmit={onSubmit}>
          <h2>Search & Tag Transactions</h2>
          <label>
            <span>Omit from Calculations</span>
            <input type="checkbox" name="ignore" />
          </label>
          <fieldset role="group">
            <input
              placeholder="search"
              type="search"
              name="search"
              onInput={onInput}
              value={getSearch()}
              list="tag-sources"
              required
            />
            <DataList id="tag-sources" options={tags.getSources()} />
            <input
              placeholder="tag..."
              type="text"
              name="text"
              list="tag-values"
              required
            />
            <DataList id="tag-values" options={tags.getValues()} />
            <input type="submit" />
          </fieldset>
          <Show when={getFirstUntagged()}>
            {(get) => (
              <aside>
                <h3>Next Untagged Transaction</h3>
                <TransactionsTable
                  highlight={getRegexp()}
                  transactions={[get()]}
                />
              </aside>
            )}
          </Show>
        </form>
      </section>
      <hr />
      <section>
        <h2>Transactions</h2>
        <TransactionsTable
          controls={true}
          highlight={getRegexp()}
          transactions={getTransactions()}
          tags={true}
        />
      </section>
    </article>
  );
}
