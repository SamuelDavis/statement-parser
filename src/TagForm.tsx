import { ExtendProps, isHtml } from "./types.ts";
import { createSignal, For, Show, splitProps } from "solid-js";
import { debounce } from "@solid-primitives/scheduled";
import ErrorList from "./ErrorList.tsx";
import styles from "./index.module.css";

type Props = ExtendProps<
  "form",
  {
    onInput: (e: Event, r: RegExp | undefined) => void;
    onSubmit: (e: Event, name: string, tag: string) => void;
    onRemoveTag: (match: string, tag: string) => void;
    matches: Record<string, string[]>;
  }
>;

export default function TagForm(props: Props) {
  const [local, parent] = splitProps(props, [
    "onInput",
    "onSubmit",
    "onRemoveTag",
    "matches",
  ]);
  const [getError, setError] = createSignal<string | undefined>();
  const [getMatch, setMatch] = createSignal("");
  const getMatches = () => Object.keys(local.matches);
  const getTags = () =>
    Object.values(local.matches).reduce(
      (acc, list) =>
        list.reduce((acc, tag) => {
          if (!acc.includes(tag)) acc.push(tag);
          return acc;
        }, acc),
      [],
    );
  const getMatchingTags = () => local.matches[getMatch()] ?? [];
  const update = debounce((e: Event, value: string) => {
    try {
      const regex = value.length ? new RegExp(value, "gi") : undefined;
      local.onInput?.(e, regex);
      setError(undefined);
      console.debug({ regex });
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      else console.error(e);
      console.error(e);
    }
  });
  let tags: HTMLInputElement | undefined;

  function onInput(e: Event) {
    const input = e.target;
    if (!isHtml("input", input)) throw new TypeError();
    const { value } = input;
    setMatch(value);
    update(e, value);
  }

  function onSubmit(e: Event) {
    e.preventDefault();
    const form = e.target;
    if (!isHtml("form", form)) throw new TypeError();

    const data = new FormData(form);
    const name = data.get("match")?.toString();
    const tag = data.get("tag")?.toString();

    console.debug({ name, tag });

    if (!(tag && name)) return;

    local.onSubmit(e, name, tag);
    if (tags) tags.value = "";
  }

  function onClick(_: Event, tag: string) {
    local.onRemoveTag(getMatch(), tag);
  }

  return (
    <form onSubmit={onSubmit} {...parent}>
      <fieldset class={styles.TagFieldset}>
        <label>
          <span>Match</span>
          <input
            type="text"
            name="match"
            onInput={debounce(onInput, 200)}
            aria-labelledby="match-errors"
            aria-invalid={Boolean(getError()) || undefined}
            value={getMatch()}
            list="matches"
            required
          />
        </label>
        <label class={styles.Tags}>
          <span>tag</span>
          <input
            type="text"
            id="tag"
            name="tag"
            list="tags"
            ref={tags}
            required
          />
          <Show when={getMatchingTags().length > 0}>
            <ul>
              <For each={getMatchingTags()}>
                {(tag) => (
                  <li>
                    <span>{tag}</span>
                    <button
                      aria-label="remove"
                      type="button"
                      onClick={(e) => onClick(e, tag)}
                    >
                      &times;
                    </button>
                  </li>
                )}
              </For>
            </ul>
          </Show>
        </label>
      </fieldset>
      <ErrorList id="match-errors">{getError()}</ErrorList>
      <datalist id="matches">
        <For each={getMatches()}>{(match) => <option value={match} />}</For>
      </datalist>
      <datalist id="tags">
        <For each={getTags()}>{(tag) => <option value={tag} />}</For>
      </datalist>
      <input type="submit" />
    </form>
  );
}
