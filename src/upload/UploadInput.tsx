import { createSignal } from "solid-js";
import { isArray, isHtml } from "../types.ts";
import { parse } from "papaparse";
import HtmlErrorList from "../html/HtmlErrorList.tsx";

import uploadState from "../state/uploadState.ts";

export default function UploadInput() {
  const [getErrors, setErrors] = createSignal<string[]>([]);
  const getIsInvalid = () => getErrors().length > 0;

  async function onInput(e: Event) {
    e.preventDefault();
    const input = e.target;
    if (!isHtml("input", input)) throw new TypeError();

    const file = input.files?.item(0);
    if (!(file instanceof File)) {
      setErrors([]);
      uploadState.setUpload(undefined);
      return;
    }

    const { data, errors, meta } = parse<Record<string, string>>(
      await file.text(),
      { skipEmptyLines: "greedy", header: true },
    );

    setErrors(errors.map((e) => `${e.message} on row ${(e.row ?? 0) + 1}.`));
    if (errors.length > 0) return;

    if (!isArray(meta.fields)) throw new TypeError();
    uploadState.setUpload({
      name: file.name,
      headers: meta.fields,
      rows: data,
    });
  }

  return (
    <fieldset>
      <label>
        <span>Statement CSV</span>
        <input
          onInput={onInput}
          type="file"
          id="upload"
          name="upload"
          accept="text/csv"
          aria-labelledby="upload-errors"
          aria-invalid={getIsInvalid() || undefined}
          required
        />
      </label>
      <HtmlErrorList id="upload-errors">{getErrors()}</HtmlErrorList>
    </fieldset>
  );
}
