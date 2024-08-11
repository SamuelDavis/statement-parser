import { statements, tags } from "./state.ts";
import {
  ExtendPropsChildless,
  isHtml,
  NormalHeader,
  normalHeaders,
} from "./types.ts";
import { createSignal, For, Show } from "solid-js";
import { stringToRegex } from "./utils.ts";
import ErrorList from "./ErrorList.tsx";

type Props = ExtendPropsChildless<"form", {}, "onSubmit">;
export default function TagNext(props: Props) {
  const [getError, setError] = createSignal<undefined | string>();
  const getHasError = () => Boolean(getError());
  const getNextUntagged = () => {
    const allTags = tags.getTags();
    const allRows = statements.getStatementRows();
    return allRows.find(
      (row) =>
        !allTags.some((tag) => tag.regex.test(row[NormalHeader.Description])),
    );
  };

  function onSubmit(e: Event) {
    e.preventDefault();
    const form = e.target;
    if (!isHtml("form", form)) throw new TypeError();
    const data = new FormData(form);
    const text = data.get("text")?.toString();
    const regexString = data.get("regex")?.toString();
    if (!text || !regexString) return;
    try {
      const regex = stringToRegex(regexString);
      tags.addTag({ text, regex });
      form.reset();
    } catch (e) {
      if (e instanceof Error) return setError(e.message);
      console.error(e);
    }
  }

  return (
    <Show
      when={getNextUntagged()}
      fallback={<div>There are no untagged statements!</div>}
    >
      {(getRow) => {
        if (!getRow()) return null;
        return (
          <form onSubmit={onSubmit} {...props}>
            <table>
              <thead>
                <tr>
                  <For each={normalHeaders}>
                    {(normal) => <th>{normal}</th>}
                  </For>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <For each={normalHeaders}>
                    {(normal) => {
                      switch (normal) {
                        case NormalHeader.Date:
                          return (
                            <td>{getRow()[normal].toLocaleDateString()}</td>
                          );
                        case NormalHeader.Amount:
                          return <td>${getRow()[normal]}</td>;
                        default:
                          return <td>{getRow()[normal]}</td>;
                      }
                    }}
                  </For>
                </tr>
              </tbody>
            </table>
            <fieldset role="group">
              <label>
                <span>Regex</span>
                <input
                  type="text"
                  name="regex"
                  required
                  aria-invalid={getHasError() || undefined}
                  aria-describedby="regex-errors"
                />
              </label>
              <label>
                <span>Text</span>
                <input type="text" name="text" required />
              </label>
            </fieldset>
            <input type="submit" />
            <ErrorList id="regex-errors">{getError()}</ErrorList>
          </form>
        );
      }}
    </Show>
  );
}
