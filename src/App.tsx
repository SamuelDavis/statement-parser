import { Navigation } from "./Navigation.tsx";
import { UploadTable } from "./UploadTable.tsx";
import { For } from "solid-js";
import { statements, tags } from "./state.ts";
import StatementTable from "./StatementTable.tsx";

export default function App() {
  return (
    <>
      <header>
        <Navigation />
      </header>
      <main>
        <section>
          <UploadTable />
        </section>
        <section>
          <For each={tags.getUniqueTagTexts()}>
            {(text) => (
              <details>
                <summary>{text}</summary>
                <StatementTable
                  rows={statements.getStatementRowsByTags(
                    tags.getTagsByText(text),
                  )}
                />
              </details>
            )}
          </For>
        </section>
      </main>
    </>
  );
}
