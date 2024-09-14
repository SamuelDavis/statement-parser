import { createSignal, Setter, splitProps } from "solid-js";
import {
  ExtendProps,
  isArray,
  isHtml,
  TargetedEvent,
  Upload,
} from "../types.ts";
import Papa from "papaparse";
import ErrorList from "../Components/ErrorList.tsx";

type Props = ExtendProps<
  "input",
  { setUpload: Setter<undefined | Upload> },
  | "onInput"
  | "type"
  | "id"
  | "name"
  | "accept"
  | "required"
  | "aria-describedby"
  | "aria-invalid"
>;

export default function UploadFileInput(props: Props) {
  const [local, parent] = splitProps(props, ["setUpload"]);
  const [getErrors, setErrors] = createSignal<undefined | string[]>();
  const getIsInvalid = () => Boolean(getErrors());

  async function onFileUpload(
    event: TargetedEvent<HTMLInputElement, InputEvent>,
  ) {
    local.setUpload(undefined);
    setErrors(undefined);

    const input = event.target;
    if (!isHtml("input", input)) throw new TypeError();

    const file = input.files?.item(0);
    if (!(file instanceof File))
      return setErrors([`The ${input.name} is required.`]);

    const name = file.name;
    const text = await file.text();
    const parsed = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: "greedy",
    });
    const headers = parsed.meta.fields;
    if (!isArray(headers)) throw new TypeError();
    const rows = parsed.data;
    const errors = parsed.errors.map(
      (e) => `${e.message} on row ${(e.row ?? 0) + 1}`,
    );

    if (headers.length === 0)
      return setErrors([`There appear to be no headers in the file.`]);

    if (rows.length === 0)
      return setErrors([`There appear to be no rows in the file.`]);

    if (errors.length > 0) return setErrors(errors);

    local.setUpload({ name, headers, rows });
  }

  return (
    <fieldset>
      <label for="file">Upload a CSV of bank transaction&hellip;</label>
      <input
        onInput={onFileUpload}
        type="file"
        id="file"
        name="file"
        accept="text/csv"
        required
        aria-describedby="file-errors"
        aria-invalid={getIsInvalid() || undefined}
        {...parent}
      />
      <ErrorList id="file-errors">{getErrors()}</ErrorList>
    </fieldset>
  );
}
