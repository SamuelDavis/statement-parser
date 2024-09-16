import {
  ExtendProps,
  isDate,
  isHtml,
  isNumber,
  isString,
  NormalHeader,
  Upload,
} from "../types.ts";
import { createSignal, For, Setter, splitProps } from "solid-js";
import ErrorList from "../Components/ErrorList.tsx";

type Props = ExtendProps<
  "select",
  {
    normal: NormalHeader;
    upload: Upload;
    setMapping: Setter<Partial<Record<NormalHeader, string>>>;
  },
  "name" | "id" | "aria-describedby" | "required"
>;

export default function UploadHeaderSelect(props: Props) {
  const [local, parent] = splitProps(props, ["normal", "upload", "setMapping"]);
  const [getErrors, setErrors] = createSignal<undefined | string[]>(undefined);

  function onInput(event: InputEvent) {
    const select = event.target;
    if (!isHtml("select", select)) throw new TypeError();
    const { value } = select;

    if (!value)
      return local.setMapping(({ [local.normal]: _, ...mapping }) => mapping);

    try {
      validate(local.normal, value, local.upload.rows);
      local.setMapping((mapping) => ({ ...mapping, [local.normal]: value }));
      setErrors(undefined);
    } catch (error) {
      local.setMapping(({ [local.normal]: _, ...mapping }) => mapping);
      if (error instanceof Error) setErrors([error.message]);
      else console.error(error);
    }
  }

  return (
    <fieldset>
      <label for={local.normal}>
        Specify which column refers to the <em>{local.normal}</em>&hellip;
      </label>
      <select
        onInput={onInput}
        name={local.normal}
        id={local.normal}
        aria-describedby={`${local.normal}-errors`}
        required
        {...parent}
      >
        <option />
        <For each={local.upload.headers}>
          {(option) => (
            <option value={option} selected={option === parent.value}>
              {option}
            </option>
          )}
        </For>
      </select>
      <ErrorList id={`${local.normal}-errors`}>{getErrors()}</ErrorList>
    </fieldset>
  );
}

function validate(normal: NormalHeader, header: string, rows: Upload["rows"]) {
  switch (normal) {
    case "date":
      rows.forEach((row, i) => {
        const value = row[header];
        const date = new Date(value);
        if (!isDate(date))
          throw new TypeError(
            `"${value}" on row ${i + 1} is not a valid ${normal}.`,
          );
      });
      break;
    case "description":
      rows.forEach((row, i) => {
        const value = row[header];
        if (!isString(value) || !value)
          throw new TypeError(
            `"${value}" on row ${i + 1} is not a valid ${normal}.`,
          );
      });
      break;
    case "amount":
      rows.forEach((row, i) => {
        const value = row[header];
        const amount = parseFloat(value);
        if (!isNumber(amount))
          throw new TypeError(
            `"${value}" on row ${i + 1} is not a valid ${normal}.`,
          );
      });
      break;
  }
}
