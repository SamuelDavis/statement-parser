import ErrorList from "../ErrorList.tsx";
import {
  ExtendProps,
  includes,
  isDate,
  isHtml,
  isNumber,
  NormalHeader,
  Upload,
} from "../types.ts";
import { createSignal, For, Show, splitProps } from "solid-js";

type Props = ExtendProps<
  "select",
  {
    upload: Upload;
    normal: NormalHeader;
    onInput: (value: undefined | string, normal: NormalHeader) => void;
  },
  "value" | "name" | "id" | "aria-invalid" | "aria-describedby" | "required"
>;
export default function HeaderSelect(props: Props) {
  const [local, parent] = splitProps(props, ["upload", "normal", "onInput"]);
  const [getIsFresh, setIsFresh] = createSignal(true);
  const [getValue, setValue] = createSignal("");
  const getIsInvalid = () => !getIsFresh() && Boolean(getError());
  const getError = () => {
    if (getIsFresh()) return undefined;

    const value = getValue();
    if (!includes(local.upload.headers, value))
      return `"${value}" is not a valid option.`;

    switch (local.normal) {
      case NormalHeader.Date:
        for (const [index, row] of Object.entries(local.upload.rows)) {
          if (!isDate(new Date(row[value])))
            return `"${row[value]}" on row ${Number(index) + 1} is not a date.`;
        }
        return undefined;
      case NormalHeader.Description:
        return undefined;
      case NormalHeader.Amount:
        for (const [index, row] of Object.entries(local.upload.rows)) {
          if (!isNumber(row[value]))
            return `"${row[value]}" on row ${Number(index) + 1} is not a number.`;
        }
        return undefined;
      default:
        throw new TypeError();
    }
  };

  function onInput(e: Event) {
    const select = e.target;
    if (!isHtml("select", select)) throw new TypeError();

    setValue(select.value);
    setIsFresh(false);

    local.onInput(getError() ? undefined : select.value, local.normal);
  }

  return (
    <fieldset>
      <label for={local.normal}>The {local.normal} is found in column:</label>
      <select
        onInput={onInput}
        value={getValue()}
        name={local.normal}
        id={local.normal}
        aria-invalid={getIsInvalid() || undefined}
        aria-describedby={`${local.normal}-errors`}
        required
        {...parent}
      >
        <Show when={getIsFresh()}>
          <option value="">...</option>
        </Show>
        <For each={local.upload.headers}>
          {(option) => (
            <option value={option} selected={option === getValue()}>
              {option}
            </option>
          )}
        </For>
      </select>
      <ErrorList id={`${local.normal}-errors`}>{getError()}</ErrorList>
    </fieldset>
  );
}
