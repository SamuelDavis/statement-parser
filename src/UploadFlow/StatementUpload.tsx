import { createSignal, splitProps } from "solid-js";
import { ExtendProps, isArray, isHtml, Upload } from "../types.ts";
import { parse } from "papaparse";
import ErrorList from "../ErrorList.tsx";

type Props = ExtendProps<
  "input",
  {
    onUpload: (upload: undefined | Upload) => void;
  },
  | "type"
  | "id"
  | "accept"
  | "onInput"
  | "required"
  | "aria-invalid"
  | "aria-describedby"
>;
export default function StatementUpload(props: Props) {
  const [local, parent] = splitProps(props, ["onUpload"]);
  const [getErrors, setErrors] = createSignal<string[]>([]);
  const getIsInvalid = () => getErrors().length > 0;

  async function onInput(e: Event) {
    const input = e.target;
    if (!isHtml("input", input)) throw new TypeError();

    const file = input.files?.item(0);
    if (!(file instanceof File)) {
      const label = input.labels?.item(0).textContent;
      if (!label) throw new TypeError();
      setErrors([`${label} is required.`]);
      local.onUpload(undefined);
      return;
    }

    const text = await file.text();
    const parsed = parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: "greedy",
    });

    const errors = parsed.errors;
    if (errors.length > 0) {
      setErrors(errors.map((e) => `${e.message} on row ${(e.row ?? 0) + 1}.`));
      local.onUpload(undefined);
      return;
    }

    const name = file.name;
    const rows = parsed.data;
    const headers = parsed.meta.fields;
    if (!isArray(headers)) throw new TypeError();
    local.onUpload({ name, headers, rows });
  }

  return (
    <fieldset>
      <label for="statement">Statement</label>
      <input
        type="file"
        id="statement"
        accept="text/csv"
        onInput={onInput}
        required
        aria-invalid={getIsInvalid() || undefined}
        aria-describedby="statement-errors"
        {...parent}
      />
      <ErrorList id="statement-errors">{getErrors()}</ErrorList>
    </fieldset>
  );
}
