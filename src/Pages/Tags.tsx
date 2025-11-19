import { useContext, For, createSignal, Show } from "solid-js";
import { AppState } from "../Context";
import TransactionsSummary from "../Components/TransactionsSummary";
import HTMLDate from "../Components/HTMLDate";
import Highlighted from "../Components/Highlighted";
import HTMLNumber from "../Components/HTMLNumber";
import {
  assert,
  HTMLIcon,
  isFunction,
  isNonNullable,
  Modal,
  type ExtendProps,
  type Targeted,
} from "@samueldavis/solidlib";
import { createRegexp, type Tag } from "../types";
import { A, useNavigate, useParams } from "@solidjs/router";

export default function Tags() {
  const state = useContext(AppState);
  assert(isNonNullable, state);
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const getTag = (): undefined | Tag => {
    const id = params.id ? decodeURI(params.id) : undefined;
    if (id) return state.getTags().find((tag) => tag.value === id);
    else return undefined;
  };
  const [getSearch, setSearch] = createSignal("");
  function onSearch(event: Targeted<HTMLInputElement>): void {
    setSearch(event.currentTarget.value);
  }
  const getRegExp = createRegexp(getSearch);
  const getTags = (): Tag[] => {
    const tags = state.getTags();
    const regexp = getRegExp();
    return regexp ? tags?.filter((tag) => tag.value.match(regexp)) : tags;
  };

  function onClose(event: Event): void {
    event.preventDefault();
    navigate("/tags");
  }

  return (
    <article>
      <Show when={getTag()}>
        {(getTag) => (
          <Modal onClose={onClose}>
            <article>
              <header>
                <strong>Editing Tag "{getTag().value}"</strong>
                <a href="#" rel="prev" onClick={onClose} />
              </header>
              <TagEditForm tag={getTag()} />
            </article>
          </Modal>
        )}
      </Show>
      <header>
        <label>
          <span>Search</span>
          <input type="search" value={getSearch()} onInput={onSearch} />
        </label>
      </header>
      <For each={getTags()} fallback={<dt>No tags have been defined.</dt>}>
        {(tag) => <TagTransactions tag={tag} regexp={getRegExp()} />}
      </For>
    </article>
  );
}

function TagTransactions(props: { tag: Tag; regexp?: RegExp }) {
  const state = useContext(AppState);
  assert(isNonNullable, state);
  const [getPromptDelete, setPromptDelete] = createSignal(false);
  const getTransactions = () =>
    state
      .getTransactions()
      .filter((tx) => tx.description.match(props.tag.regexp)) ?? [];
  const getSources = () =>
    state
      .getTags()
      .filter((tag) => tag.value === props.tag.value)
      .map((tag) => tag.regexp.source);

  function onDeleteApprove(): void {
    state?.removeTag(props.tag);
  }
  function onDeleteCancel(): void {
    setPromptDelete(false);
  }

  return (
    <article>
      <header>
        <h2>
          <span>{props.tag.value}</span>
          <A role="button" href={`/tags/${props.tag.value}`}>
            <HTMLIcon type="edit" />
          </A>
          <button onClick={[setPromptDelete, true]}>
            <HTMLIcon type="delete" />
          </button>
          <Modal when={getPromptDelete()} onClose={onDeleteCancel}>
            <article>
              <header>
                <strong>Delete tag {props.tag.value}?</strong>
                <a rel="prev" onClick={onDeleteCancel} />
              </header>
              <TransactionsSummary transactions={getTransactions()} />
              <section>
                <strong>Associated Searches:</strong>
                <ul>
                  <For each={getSources()}>
                    {(search) => (
                      <li>
                        <code>{search}</code>
                      </li>
                    )}
                  </For>
                </ul>
              </section>
              <footer>
                <button onClick={onDeleteApprove}>Yes</button>
                <button class="contrast" onclick={onDeleteCancel}>
                  No
                </button>
              </footer>
            </article>
          </Modal>
        </h2>
        <small>{props.tag.regexp.source}</small>
      </header>
      <Show
        when={getTransactions().length > 0}
        fallback={<TransactionsSummary transactions={[]} />}
      >
        <details>
          <summary>
            <TransactionsSummary transactions={getTransactions()} />
          </summary>
          <div>
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
          </div>
        </details>
      </Show>
    </article>
  );
}

function TagEditForm(props: ExtendProps<"form", { tag: Tag }>) {
  const state = useContext(AppState);
  assert(isNonNullable, state);
  const getSources = (): Tag["regexp"]["source"][] =>
    state
      .getTags()
      .filter((item) => item.value === props.tag.value)
      .map((tag) => tag.regexp.source);

  function onSubmit(event: Targeted<HTMLFormElement, SubmitEvent>): void {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = data.get("value")?.toString();
    const sources = data.getAll("source");

    if (isFunction(props.onSubmit)) props.onSubmit(event);
    event.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit}>
      <label>
        <span>Value</span>
        <input name="value" type="text" value={props.tag.value} required />
      </label>

      <fieldset>
        <legend>
          <strong>Searches</strong>
          <br />
          <small>Uncheck to Delete</small>
        </legend>
        <For each={getSources()}>
          {(source) => (
            <label>
              <input name="source" type="checkbox" value={source} checked />
              <span>{source}</span>
            </label>
          )}
        </For>
      </fieldset>
      <input type="submit" value="Save" />
    </form>
  );
}
