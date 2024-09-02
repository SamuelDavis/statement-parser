import {
  ExtendProps,
  includes,
  isArray,
  isHtml,
  isNumber,
  NormalHeader,
  normalHeaders,
} from "../types.ts";
import uploadState from "../state/uploadState.ts";
import { createSignal, For, splitProps } from "solid-js";
import HtmlErrorList from "../html/HtmlErrorList.tsx";

type Props = ExtendProps<
  "select",
  { id: NormalHeader; options: string[] },
  "onInput" | "name" | "id" | "aria-invalid" | "aria-describedby" | "required"
>;
export default function HeaderSelect(props: Props) {
  const [local, parent] = splitProps(props, ["id", "options"]);
  const errorListId = `${local.id}-errors`;
  const [getError, setError] = createSignal<undefined | string>();
  const getIsInvalid = () => Boolean(getError());

  function onInput(e: Event) {
    const select = e.target;
    if (!isHtml("select", select)) throw new TypeError();
    const { id, value } = select;
    if (!includes(normalHeaders, id)) throw new TypeError();
    if (!includes(local.options, value)) {
      setError(undefined);
      uploadState.addHeader(id, undefined);
    } else {
      const error = setError(validate(id, value));
      uploadState.addHeader(id, error ? undefined : value);
    }
  }

  return (
    <fieldset>
      <label for={local.id}>The {local.id} can be found in...</label>
      <select
        onInput={onInput}
        name={local.id}
        id={local.id}
        aria-describedby={errorListId}
        aria-invalid={getIsInvalid() || undefined}
        required
        {...parent}
      >
        <option value="">...</option>
        <For each={local.options}>
          {(value) => <option value={value}>{value}</option>}
        </For>
      </select>
      <HtmlErrorList id={errorListId}>{getError()}</HtmlErrorList>
    </fieldset>
  );
}

function validate(normal: NormalHeader, value: string): undefined | string {
  const fields = uploadState.getFields(value);
  if (!isArray(fields)) throw new TypeError();

  switch (normal) {
    case "date":
      for (const [row, field] of Object.entries(fields))
        if (!isNumber(new Date(field).getTime()))
          return `"${field}" is not a valid date on row ${parseInt(row) + 1}.`;
      break;
    case "amount":
      for (const [row, field] of Object.entries(fields))
        if (!isNumber(parseFloat(field)))
          return `"${field}" is not a valid number on row ${parseInt(row) + 1}.`;
      break;
  }
  return undefined;
}
