import {
  assert,
  isArray,
  isInstanceOf,
  isNonNullable,
  type Targeted,
} from "@samueldavis/solidlib";
import { For, useContext } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { parse } from "papaparse";
import { AppState } from "../Context";
import { fields, type Known, type Transaction } from "./../types.ts";

type LocalState = {
  name: string;
  fields: string[];
  rows: Record<string, string>[];
  fieldMap: Partial<Record<Known, string>>;
};

export default function Upload() {
  const state = useContext(AppState);
  assert(isNonNullable, state);

  const [localState, setLocalState] = createStore<LocalState>({
    name: "",
    fields: [],
    rows: [],
    fieldMap: {},
  });
  const reset = () =>
    setLocalState({
      name: "",
      fields: [],
      rows: [],
      fieldMap: {},
    });

  async function onFile(event: Targeted<HTMLInputElement>): Promise<void> {
    const file = event.currentTarget.files?.item(0);
    if (!isInstanceOf(file, File)) {
      reset();
      return;
    }

    const name = file.name;
    const text = await file.text();
    const data = parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: "greedy",
    });
    const { errors, data: rows, meta } = data;
    const { fields } = meta;

    if (errors.length)
      throw new Error(
        errors
          .map((error) => `${error.code}: ${error.message} on ${error.row}`)
          .join("\n"),
      );

    assert(isArray, fields);
    setLocalState({ name, fields, rows, fieldMap: {} });
  }
  function onSelect(field: Known, event: Targeted<HTMLSelectElement>): void {
    setLocalState(
      produce((state) => {
        state.fieldMap[field] = event.currentTarget.value;
      }),
    );
  }
  function transform(key: Known, value: string) {
    switch (key) {
      case "date":
        return new Date(value);
      case "description":
        return String(value);
      case "amount":
        return Number(value);
    }
  }
  function onSubmit(event: Targeted<HTMLFormElement>): void {
    event.preventDefault();
    assert(isNonNullable, state);
    const mapping = Object.entries(localState.fieldMap) as [Known, string][];
    const rows: Transaction[] = localState.rows.map((row) =>
      mapping.reduce(
        (acc, [a, b]) => ({ ...acc, [a]: transform(a, row[b]) }),
        {} as Transaction,
      ),
    );
    state.addStatement({
      name: localState.name,
      date: new Date(),
      rows: rows,
    });
    reset();
    event.currentTarget.reset();
  }

  return (
    <article>
      <form onSubmit={onSubmit}>
        <label>
          <span>File</span>
          <input type="file" accept="text/csv" required onChange={onFile} />
        </label>
        <fieldset>
          <legend>Fields</legend>
          <For each={fields}>
            {(field) => (
              <label>
                <span>{field}</span>
                <select onChange={[onSelect, field]} required>
                  <option>...</option>
                  <For each={localState.fields}>
                    {(field) => <option value={field}>{field}</option>}
                  </For>
                </select>
              </label>
            )}
          </For>
        </fieldset>
        <input type="submit" />
      </form>
    </article>
  );
}
