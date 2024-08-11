import {
  ExtendPropsChildless,
  isHtml,
  NormalHeader,
  Tag,
  TextSegment as TTextSegment,
} from "../types.ts";
import { createSignal, For } from "solid-js";
import ErrorList from "../ErrorList.tsx";
import { statements, tags } from "../state.ts";
import { parseRegex, regexToString, stringToRegex, uniq } from "../utils.ts";
import TextSegment from "../TextSegment.tsx";
import { debounce } from "@solid-primitives/scheduled";

type Props = ExtendPropsChildless<"form", {}, "onSubmit">;

export default function TagForm(props: Props) {
  const [getText, setText] = createSignal("");
  const [getRegex, setRegex] = createSignal<undefined | RegExp>();
  const [getError, setError] = createSignal<undefined | string>();
  const hasError = () => Boolean(getError());
  const getMatchingStatements = (): {
    segments: TTextSegment[];
    tags: Tag["text"][];
  }[] => {
    const regex = getRegex();
    const allTags = tags.getTags();
    return statements
      .getStatementRows()
      .filter(
        ({ [NormalHeader.Description]: value }) => regex?.test(value) ?? true,
      )
      .map(({ [NormalHeader.Description]: value }) => {
        const segments = regex
          ? parseRegex(regex, value)
          : [{ match: false, value }];
        return {
          segments,
          tags: uniq(
            allTags
              .filter((tag) => tag.regex.test(value))
              .map((tag) => tag.text),
          ),
        };
      });
  };
  const getRegexStrings = () =>
    uniq(tags.getTags().map(({ regex }) => regexToString(regex)));
  const getMatchingTexts = () => {
    const regex = getRegex();
    const regexString = regex ? regexToString(regex) : undefined;
    const allTags = tags.getTags();
    const matching = regexString
      ? allTags.filter(({ regex }) => regexToString(regex) === regexString)
      : allTags;
    return uniq(matching.map(({ text }) => text));
  };

  function onSubmit(e: Event) {
    e.preventDefault();
    const form = e.target;
    if (!isHtml("form", form)) throw new TypeError();
    const text = getText();
    const regex = getRegex();
    if (hasError() || !text || !regex) return;
    tags.addTag({ text, regex });
    setText("");
    setRegex(undefined);
    form.reset();
  }

  function onTextInput(e: Event) {
    const input = e.target;
    if (!isHtml("input", input)) throw new TypeError();
    setText(input.value);
  }

  function onRegexInput(e: Event) {
    const input = e.target;
    if (!isHtml("input", input)) throw new TypeError();
    const { value } = input;
    try {
      setRegex(value ? stringToRegex(value) : undefined);
      setError(undefined);
    } catch (e) {
      setRegex(undefined);
      if (e instanceof Error) return setError(e.message);
      setError("Something went wrong.");
      console.error(e);
    }
  }

  return (
    <form onSubmit={onSubmit} {...props}>
      <fieldset role="group">
        <label>
          <span>Regex</span>
          <input
            type="text"
            onInput={debounce(onRegexInput, 250)}
            list="regex-list"
            aria-describedby="regex-errors"
            aria-invalid={hasError() || undefined}
            required
          />
          <datalist id="regex-list">
            <For each={getRegexStrings()}>
              {(regex) => <option value={regex} />}
            </For>
          </datalist>
        </label>
        <label>
          <span>Text</span>
          <input type="text" onInput={onTextInput} list="text-list" required />
          <datalist id="text-list">
            <For each={getMatchingTexts()}>
              {(text) => <option value={text} />}
            </For>
          </datalist>
        </label>
      </fieldset>
      <ErrorList id="regex-errors">{getError()}</ErrorList>
      <input type="submit" />
      <table>
        <thead>
          <tr>
            <th>{NormalHeader.Description}</th>
            <th>Tags</th>
          </tr>
        </thead>
        <tbody>
          <For each={getMatchingStatements()}>
            {({ segments, tags }) => (
              <tr>
                <td>
                  <For each={segments}>
                    {(segment) => <TextSegment segment={segment} />}
                  </For>
                </td>
                <td>
                  <For each={tags}>{(tag) => <div>{tag}</div>}</For>
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </form>
  );
}
