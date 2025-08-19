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
  const [getUntaggedOnly, setUntaggedOnly] = createSignal(false);
  const getRegexp = () => undefineFalsy(new RegExp(getSearch(), Flags));
  const getTransactions = () =>
    derived.findTransactions({
      matching: getRegexp(),
      untagged: getUntaggedOnly(),
    });
  const getFirstUntagged = () => derived.getUntaggedTransactions()[0];

  function onSubmit(event: Targeted<SubmitEvent>): void {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const search = undefineFalsy(data.get("search")?.toString());
    const text = undefineFalsy(data.get("text")?.toString());
    if (!search || !text) return;

    const tag: Tag = { regexp: new RegExp(search, Flags), value: text };
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

  function onUntaggedOnly(event: Targeted<InputEvent>): void {
    setUntaggedOnly(event.currentTarget.checked);
  }

  return (
    <article>
      <h1>Tagging</h1>
      <section>
        <form onSubmit={onSubmit}>
          <h2>Search & Tag Transactions</h2>
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
        <header role="group">
          <h2>Transactions</h2>
          <label>
            <span>Untagged Only</span>
            <input
              type="checkbox"
              onInput={onUntaggedOnly}
              checked={getUntaggedOnly()}
            />
          </label>
        </header>
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
