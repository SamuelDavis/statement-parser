import UploadFlow from "./UploadFlow";
import { createEffect, createSignal, Show } from "solid-js";
import { hasProperty, NormalRow, Statement } from "./types.ts";
import { StatementTable } from "./StatementTable.tsx";
import TagForm from "./TagForm.tsx";

function loadStatements(): Statement[] {
  const localStatements = JSON.parse(
    localStorage.getItem("statements") ?? "",
  ) as Statement[];
  if (!Array.isArray(localStatements)) throw new TypeError();

  return localStatements.map(({ rows, ...statement }) => ({
    ...statement,
    rows: rows.map(({ date, description, amount }) => ({
      date: new Date(date.toString()),
      description,
      amount: parseFloat(amount.toString()),
    })),
  }));
}

function App() {
  const [getOpen, setOpen] = createSignal(false);
  const [getStatements, setStatements] =
    createSignal<Statement[]>(loadStatements());
  const [getRegExp, setRegExp] = createSignal<RegExp | undefined>();
  const [getMatches, setMatches] = createSignal<Record<string, string[]>>({});
  const getRows = () =>
    getStatements()
      .flatMap((statement) => statement.rows)
      .filter((row) => getRegExp()?.test(row.description) ?? true);

  createEffect(() => {
    const statements = getStatements();
    if (statements.length)
      localStorage.setItem("statements", JSON.stringify(statements));
  });

  function onSubmit(_: Event, name: string, rows: NormalRow[]) {
    setOpen(false);
    setStatements((statements) => [
      ...statements.filter((statement) => statement.name !== name),
      { name, rows, date: new Date() },
    ]);
  }

  function onInput(_: Event, regex: undefined | RegExp) {
    setRegExp(regex);
  }

  function onMatch(_: Event, match: string, tag: string) {
    setMatches((matches) => {
      return hasProperty(matches, match) && matches[match].includes(tag)
        ? matches
        : { ...matches, [match]: [...(matches[match] ?? []), tag] };
    });
  }

  function onRemoveTag(match: string, tag: string) {
    setMatches((matches) => {
      return hasProperty(matches, match)
        ? { ...matches, [match]: matches[match].filter((v) => v !== tag) }
        : matches;
    });
  }

  return (
    <main>
      <article>
        <header>
          <button onClick={() => setOpen(true)}>Upload</button>
        </header>
        <TagForm
          onInput={onInput}
          matches={getMatches()}
          onSubmit={onMatch}
          onRemoveTag={onRemoveTag}
        />
        <StatementTable rows={getRows()} regex={getRegExp()} />
      </article>
      <Show when={getOpen()}>
        <dialog open>
          <article>
            <header>
              <a
                role="button"
                href="#"
                rel="prev"
                onClick={() => setOpen(false)}
                aria-label="close"
              />
              <p>
                <strong>Upload a new Bank statement</strong>
              </p>
            </header>
            <UploadFlow onSubmit={onSubmit} />
          </article>
        </dialog>
      </Show>
    </main>
  );
}

export default App;
