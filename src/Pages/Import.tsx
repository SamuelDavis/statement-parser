import { createMemo, createSignal, For, Show } from "solid-js";
import {
  assert,
  HTMLDate,
  HTMLIcon,
  isInstanceOf,
  type Targeted,
} from "@samueldavis/solidlib";
import { useAppState } from "../state/AppState";
import {
  guessMapping,
  isCompleteMapping,
  parseRows,
  readCsv,
} from "../utils/parsing";
import {
  type FieldMapping,
  type TransactionField,
  transactionFields,
  type Upload,
} from "../types";
import TransactionsSummary from "../Components/TransactionsSummary";
import TransactionsTable from "../Components/TransactionsTable";

const previewSize = 5;

export default function Import() {
  const app = useAppState();
  const [getUpload, setUpload] = createSignal<undefined | Upload>();
  const [getMapping, setMapping] = createSignal<Partial<FieldMapping>>({});
  const [getReadError, setReadError] = createSignal<undefined | string>();

  const getParsed = createMemo(() => {
    const upload = getUpload();
    const mapping = getMapping();
    return upload && isCompleteMapping(mapping)
      ? parseRows(upload.rows, mapping)
      : undefined;
  });
  const getIsValid = () => {
    const parsed = getParsed();
    return (
      parsed !== undefined &&
      parsed.errors.length === 0 &&
      parsed.transactions.length > 0
    );
  };
  const getPreview = () =>
    getParsed()?.transactions.slice(0, previewSize) ?? [];

  async function onFile(event: Targeted<HTMLInputElement>): Promise<void> {
    setUpload(undefined);
    setMapping({});
    setReadError(undefined);
    const file = event.currentTarget.files?.item(0);
    if (!file) return;
    try {
      const upload = await readCsv(file);
      setUpload(upload);
      setMapping(guessMapping(upload.headers));
    } catch (error) {
      assert(isInstanceOf, error, Error);
      setReadError(error.message);
    }
  }

  function onMapField(
    field: TransactionField,
    event: Targeted<HTMLSelectElement>,
  ): void {
    const { value } = event.currentTarget;
    setMapping((mapping) => ({ ...mapping, [field]: value || undefined }));
  }

  function onSubmit(event: Targeted<HTMLFormElement, SubmitEvent>): void {
    event.preventDefault();
    const upload = getUpload();
    const parsed = getParsed();
    if (!upload || !parsed || !getIsValid()) return;
    app.addStatement({
      name: upload.name,
      date: new Date(),
      transactions: parsed.transactions,
    });
    setUpload(undefined);
    setMapping({});
    event.currentTarget.reset();
  }

  return (
    <article>
      <header>
        <h1>Import</h1>
      </header>
      <form onSubmit={onSubmit}>
        <label>
          Statement (.csv, dates as MM/DD/YYYY)
          <input type="file" accept=".csv,text/csv" onInput={onFile} required />
        </label>
        <Show when={getReadError()}>
          {(getError) => <pre role="alert">{getError()}</pre>}
        </Show>
        <Show when={getUpload()}>
          {(getUpload) => (
            <fieldset data-grid>
              <For each={transactionFields}>
                {(field) => (
                  <label>
                    {field}
                    <select onInput={[onMapField, field]}>
                      <option value="">&hellip;</option>
                      <For each={getUpload().headers}>
                        {(header) => (
                          <option
                            value={header}
                            selected={getMapping()[field] === header}
                          >
                            {header}
                          </option>
                        )}
                      </For>
                    </select>
                  </label>
                )}
              </For>
            </fieldset>
          )}
        </Show>
        <Show when={getParsed()}>
          {(getParsed) => (
            <>
              <Show when={getParsed().errors.length > 0}>
                <p role="alert">
                  {getParsed().errors.length} invalid values. Fix the CSV or
                  column mapping before importing.
                </p>
                <figure>
                  <table>
                    <thead>
                      <tr>
                        <th>Row</th>
                        <th>Field</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={getParsed().errors}>
                        {(error) => (
                          <tr>
                            <td>{error.line}</td>
                            <td>{error.field}</td>
                            <td>
                              <code>{JSON.stringify(error.value)}</code>
                            </td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </figure>
              </Show>
              <Show when={getIsValid()}>
                <p>
                  <TransactionsSummary
                    transactions={getParsed().transactions}
                  />
                </p>
                <TransactionsTable transactions={getPreview()} />
              </Show>
            </>
          )}
        </Show>
        <button type="submit" disabled={!getIsValid()}>
          Import
        </button>
      </form>
      <section>
        <h2>Statements</h2>
        <For each={app.getStatements()} fallback={<p>No statements.</p>}>
          {(statement) => (
            <article>
              <header data-row>
                <hgroup>
                  <h3>{statement.name}</h3>
                  <p>
                    Imported <HTMLDate value={statement.date} />
                  </p>
                </hgroup>
                <HTMLIcon
                  type="delete"
                  title="Delete statement"
                  onClick={[app.removeStatement, statement]}
                />
              </header>
              <TransactionsSummary transactions={statement.transactions} />
            </article>
          )}
        </For>
      </section>
    </article>
  );
}
