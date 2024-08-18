import {
  ExtendPropsChildless,
  isHtml,
  NormalHeader,
  Statement,
} from "./types.ts";
import { For, Show } from "solid-js";
import ErrorList from "./ErrorList.tsx";
import { statements, tags } from "./state.ts";
import Amount from "./Amount.tsx";
import Date from "./Date.tsx";
import { createSignal, parseRegex, stringToRegex } from "./utils.ts";
import TextSegment from "./TextSegment.tsx";
import { debounce } from "@solid-primitives/scheduled";

type Props = ExtendPropsChildless<"form", {}, "onSubmit">;
export default function TagNext(props: Props) {
  const [getError, setError] = createSignal<undefined | string>(undefined);
  const [getRegex, setRegex] = createSignal<undefined | RegExp>(undefined);
  const getHasError = () => Boolean(getError());
  const getUntagged = () =>
    statements.getStatementRows().filter((row) => {
      return !tags.getTagsMatch(row[NormalHeader.Description]);
    });
  const getNextUntagged = (): undefined | Statement["rows"][number] =>
    getUntagged()[0];
  const getMatchingRows = () => {
    const regex = getRegex();
    if (!regex) return [];
    return statements
      .getStatementRows()
      .filter((row) => regex.test(row[NormalHeader.Description]))
      .map((row) => ({
        ...row,
        [NormalHeader.Description]: parseRegex(
          regex,
          row[NormalHeader.Description],
        ),
      }));
  };

  function onSubmit(e: Event) {
    e.preventDefault();
    const form = e.target;
    if (!isHtml("form", form)) throw new TypeError();
    const data = new FormData(form);
    const text = data.get("text")?.toString().trim().toLowerCase();
    const regex = data.get("regex")?.toString().trim().toLowerCase();
    const statement = getNextUntagged();
    if (!statement || !text || !regex) return;
    try {
      if (!stringToRegex(regex).test(statement[NormalHeader.Description]))
        return setError("Regex does not match description.");
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      else console.error(e);
      return;
    }

    setError(undefined);
    setRegex(undefined);
    tags.addTag({ text, regex });
    form.reset();
  }

  function onInput(e: Event) {
    const input = e.target;
    if (!isHtml("input", input)) throw new TypeError();
    try {
      setRegex(stringToRegex(input.value));
    } catch (e) {
      setRegex(undefined);
    }
  }

  return (
    <Show
      when={getNextUntagged()}
      fallback={<div>There are no untagged statements!</div>}
    >
      {(getRow) => {
        return (
          <form onSubmit={onSubmit} {...props}>
            <h5>{getUntagged().length} remaining</h5>
            <section>
              <header role="group">
                <span>
                  Date: <Date value={getRow()[NormalHeader.Date]} />
                </span>
                <span>
                  Amount: <Amount value={getRow()[NormalHeader.Amount]} />
                </span>
              </header>
              <blockquote>{getRow()[NormalHeader.Description]}</blockquote>
            </section>
            <fieldset role="group">
              <label>
                <span>Text</span>
                <input type="text" name="text" required list="text-list" />
              </label>
              <datalist id="text-list">
                <For each={tags.getTexts()}>
                  {(regex) => <option value={regex} />}
                </For>
              </datalist>
              <label>
                <span>Regex</span>
                <input
                  onInput={debounce(onInput, 200)}
                  type="text"
                  name="regex"
                  required
                  aria-invalid={getHasError() || undefined}
                  aria-describedby="regex-errors"
                  list="regex-list"
                  placeholder={getRow()[NormalHeader.Description]}
                />
              </label>
              <datalist id="regex-list">
                <For each={tags.getRegexes()}>
                  {(regex) => <option value={regex} />}
                </For>
              </datalist>
            </fieldset>
            <input type="submit" />
            <ErrorList id="regex-errors">{getError()}</ErrorList>
            <section>
              <table>
                <thead>
                  <tr>
                    <th>{NormalHeader.Date}</th>
                    <th>{NormalHeader.Description}</th>
                    <th>{NormalHeader.Amount}</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={getMatchingRows()}>
                    {(row) => (
                      <tr>
                        <td>
                          <Date value={row[NormalHeader.Date]} />
                        </td>
                        <td>
                          <For each={row[NormalHeader.Description]}>
                            {(segment) => <TextSegment segment={segment} />}
                          </For>
                          )
                        </td>
                        <td>
                          <Amount value={row[NormalHeader.Amount]} />
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </section>
          </form>
        );
      }}
    </Show>
  );
}
