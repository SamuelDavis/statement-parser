import HtmlNavigation from "./html/HtmlNavigation.tsx";
import HtmlModalAnchor from "./html/HtmlModalAnchor.tsx";
import statementsState from "./state/statementsState.ts";
import TaggingModal from "./tagging/TaggingModal.tsx";
import { For } from "solid-js";
import UploadModal from "./upload/UploadModal.tsx";
import StatementSummary from "./summary/StatementSummary.tsx";
import HtmlFlexGroup from "./html/HtmlFlexGroup.tsx";
import TagSummary from "./summary/TagSummary.tsx";
import TotalSpendingSummary from "./summary/TotalSpendingSummary.tsx";
import derivedState from "./state/derivedState.ts";

export default function App() {
  return (
    <main>
      <header>
        <HtmlNavigation>
          <HtmlModalAnchor modal={UploadModal}>Upload</HtmlModalAnchor>
          <HtmlModalAnchor
            disabled={derivedState.getUntaggedTransactionCount() === 0}
            modal={TaggingModal}
          >
            Tag Statements ({derivedState.getUntaggedTransactionCount()})
          </HtmlModalAnchor>
        </HtmlNavigation>
      </header>
      <hr />
      <article>
        <section>
          <h1>Statements</h1>
          <HtmlFlexGroup>
            <For each={statementsState.getStatements()}>
              {(statement) => <StatementSummary statement={statement} />}
            </For>
          </HtmlFlexGroup>
        </section>
      </article>
      <TotalSpendingSummary />
      <TagSummary />
    </main>
  );
}
