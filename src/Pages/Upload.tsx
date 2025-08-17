import { parse } from "papaparse";
import { For, Show } from "solid-js";
import HTMLDate from "../Components/HTMLDate";
import HTMLNumber from "../Components/HTMLNumber";
import { statements, upload } from "../state";
import {
  assert,
  isArray,
  isInstanceOf,
  isString,
  type Targeted,
  type TransactionField,
  transactionFields,
} from "../types";

export default function Upload() {
  return (
    <article>
      <h1>Upload</h1>
      <form onSubmit={onSaveStatement}>
        <div>
          <label for="file">File</label>
          <input
            id="file"
            type="file"
            accept="text/csv"
            onInput={onFileChange}
            required
          />
        </div>
        <fieldset>
          <For each={transactionFields}>
            {(field) => (
              <div>
                <label for={field}>{field}</label>
                <select id={field} onInput={[onMapField, field]}>
                  <option value="">&hellip;</option>
                  <For each={upload.getFields()}>
                    {(value) => (
                      <option
                        value={value}
                        selected={upload.isSelected(field, value)}
                      >
                        {value}
                      </option>
                    )}
                  </For>
                </select>
              </div>
            )}
          </For>
        </fieldset>
        <Show when={upload.getStatement()?.transactions[0]}>
          {(get) => (
            <article>
              <h2>Preview</h2>
              <header role="group">
                <HTMLDate value={get().date} />
                <HTMLNumber value={get().amount} />
              </header>
              <q>{get().description}</q>
            </article>
          )}
        </Show>
        <input type="submit" />
      </form>
    </article>
  );
}

async function onFileChange(event: Targeted<InputEvent>): void {
  const item = event.currentTarget.files?.item(0);
  if (!isInstanceOf(item, File)) {
    upload.setUpload(undefined);
    return;
  }

  const text = await item.text();
  const result = parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: "greedy",
  });
  if (result.errors.length > 0) {
    console.error(result.errors);
    upload.setUpload(undefined);
    return;
  }

  const name = item.name;
  assert(isString, name);
  const fields = result.meta.fields;
  assert(isArray, fields);
  const rows = result.data;
  upload.setUpload({ name, fields, rows });
  for (const field of transactionFields)
    for (const value of fields)
      if (value.toLowerCase().includes(field)) {
        upload.mapField(field, value);
        break;
      }
}

function onMapField(
  field: TransactionField,
  event: Targeted<InputEvent, HTMLSelectElement>,
): void {
  upload.mapField(field, event.currentTarget.value);
}

function onSaveStatement(event: Targeted<SubmitEvent>): void {
  event.preventDefault();
  const statement = upload.getStatement();
  if (!statement) return;
  statements.add(statement);
  event.currentTarget.reset();
}
