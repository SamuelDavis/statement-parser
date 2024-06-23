import { ExtendProps, isHtml, Upload } from "../types.ts";
import { createSignal, splitProps } from "solid-js";
import ErrorList from "../ErrorList.tsx";
import { parse } from "papaparse";

type Props = ExtendProps<
  "fieldset",
  {
    onUpload: (upload: Upload) => void;
    onReset: () => void;
  }
>;

export default function FileInput(props: Props) {
  const [local, parent] = splitProps(props, ["onUpload", "onReset"]);
  const [getErrors, setErrors] = createSignal<string[]>([]);

  async function onInput(e: Event) {
    const input = e.target;
    if (!isHtml("input", input)) throw new TypeError();

    const file = input.files?.item(0);
    if (!(file instanceof File)) {
      setErrors([]);
      local.onReset();
      return;
    }

    const name = file.name;
    const text = await file.text();
    const parsed = parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: "greedy",
    });
    const {
      errors,
      meta: { fields: headers },
      data: rows,
    } = parsed;
    if (!Array.isArray(headers)) throw new TypeError();

    setErrors(errors.map(({ row, message }) => `${message} on row ${row}.`));
    if (errors.length === 0) local.onUpload({ name, headers, rows });
    else local.onReset();
  }

  return (
    <fieldset {...parent}>
      <label for="file">Statement</label>
      <input
        id="file"
        type="file"
        accept="text/csv"
        required
        aria-invalid={getErrors().length > 0 || undefined}
        aria-labelledby="file-errors"
        onInput={onInput}
      />
      <ErrorList id="file-errors">{getErrors()}</ErrorList>
    </fieldset>
  );
}
