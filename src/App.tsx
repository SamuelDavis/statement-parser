import { createEffect } from "solid-js";
import {
  assert,
  assertIsArray,
  isArray,
  isObject,
  isProperty,
  NormalRow,
  parseStatement,
  Statement,
} from "./types.ts";
import TagForm from "./TagForm.tsx";
import { createSignal } from "./utils.ts";
import UploadFlow from "./UploadFlow";
import { Modal } from "./Modal.tsx";

function App() {
  const [getStatements, setStatements] = createSignal<Statement[]>([], {
    storageKey: "statements",
    storageParser: (value) => assert(isArray, value).map(parseStatement),
  });
  const [getMatches, setMatches] = createSignal<Record<string, string[]>>(
    {},
    {
      storageKey: "matches",
      storageParser: (value) =>
        Object.values(assert(isObject, value)).every(assertIsArray) && value,
    },
  );

  createEffect(() => {
    const statements = getStatements();
    if (statements.length)
      localStorage.setItem("statements", JSON.stringify(statements));
  });

  function onSubmit(_: Event, name: string, rows: NormalRow[]) {
    setStatements((statements) => [
      ...statements.filter((statement) => statement.name !== name),
      { name, rows, date: new Date() },
    ]);
  }

  function onMatch(_: Event, match: string, tag: string) {
    setMatches((matches) =>
      isProperty(matches, match) && matches[match].includes(tag)
        ? matches
        : { ...matches, [match]: [...(matches[match] ?? []), tag] },
    );
  }

  function onRemoveTag(match: string, tag: string) {
    setMatches((matches) =>
      isProperty(matches, match)
        ? { ...matches, [match]: matches[match].filter((v) => v !== tag) }
        : matches,
    );
  }

  return (
    <main>
      <article>
        <header>
          <nav>
            <ul>
              <li>
                <Modal title="Upload a new Bank statement" anchor="Upload">
                  <UploadFlow onSubmit={onSubmit} />
                </Modal>
              </li>
              <li>
                <Modal title="Tag Transactions" anchor="Tags">
                  <TagForm
                    matches={getMatches()}
                    onSubmit={onMatch}
                    onRemoveTag={onRemoveTag}
                    statements={getStatements()}
                  />
                </Modal>
              </li>
            </ul>
          </nav>
        </header>
      </article>
    </main>
  );
}

export default App;
