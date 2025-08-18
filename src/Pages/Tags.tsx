import { createSignal, For, Show } from "solid-js";
import DataList from "../Components/DataList";
import HTMLIcon from "../Components/HTMLIcon";
import TransactionsTable from "../Components/TransactionsTable";
import { derived, tags } from "../state";
import { assert, isString, type Targeted } from "../types";
import { persist } from "../utilities";

export default function Tags() {
  const [getSearch, setSearch] = persist(createSignal(""), {
    key: "q",
    driver: "query",
  });
  const getTags = () => {
    const focus = getSearch();
    const allTags = tags.get();
    return focus ? allTags.filter((tag) => tag.value.match(focus)) : allTags;
  };

  function onFocus(event: Targeted<InputEvent>): void {
    setSearch(event.currentTarget.value);
  }

  return (
    <article>
      <header>
        <h1>Tags</h1>
        <input
          type="search"
          name="search"
          placeholder="search"
          list="tag-values"
          onInput={onFocus}
          value={getSearch()}
        />
        <DataList id="tag-values" options={tags.getValues()} />
      </header>
      <For each={getTags()} fallback={<p>No tags available.</p>}>
        {(tag) => {
          const [getIsEditing, setIsEditing] = createSignal(false);
          const transactions = derived.getTransactions({
            matching: tag.regexp,
          });

          function onSave(event: Targeted<SubmitEvent>): void {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const value = data.get("value")?.toString();
            const ignore = data.get("ignore")?.toString() === "on";
            assert(isString, value);
            tags.changeValue(tag, {
              ...tag,
              value,
              ignore,
            });
            setIsEditing(false);
          }

          return (
            <article>
              <header>
                <Show
                  when={getIsEditing()}
                  fallback={
                    <h2>
                      <HTMLIcon type="edit" onClick={[setIsEditing, true]} />
                      <span>{tag.value}</span>
                      <Show when={tag.ignore}>
                        <small>(ignored)</small>
                      </Show>
                    </h2>
                  }
                >
                  <form onSubmit={onSave}>
                    <label>
                      <span>Omit from Calculations</span>
                      <input
                        type="checkbox"
                        name="ignore"
                        checked={tag.ignore}
                      />
                    </label>
                    <fieldset role="group">
                      <button type="submit">
                        <HTMLIcon type="check" />
                      </button>
                      <input
                        type="text"
                        name="value"
                        value={tag.value}
                        required
                      />
                      <HTMLIcon type="close" onClick={[setIsEditing, false]} />
                    </fieldset>
                  </form>
                </Show>
                <q>{tag.regexp.source}</q>
              </header>
              <details>
                <summary>
                  Transactions (<output>{transactions.length}</output>)
                </summary>
                <TransactionsTable transactions={transactions} />
              </details>
            </article>
          );
        }}
      </For>
    </article>
  );
}
