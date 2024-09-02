import HtmlNavigation from "./html/HtmlNavigation.tsx";
import StatementSummaryTable from "./StatementSummaryTable.tsx";
import HtmlModalAnchor from "./html/HtmlModalAnchor.tsx";
import statementsState from "./state/statementsState.ts";
import TaggingModal from "./TaggingModal.tsx";
import TagSummaryTable from "./TagSummaryTable.tsx";
import SpendingSummaryTable from "./SpendingSummaryTable.tsx";
import tagsState from "./state/tagsState.ts";
import { Show } from "solid-js";
import TagDetails from "./TagDetails.tsx";
import UploadModal from "./upload/UploadModal.tsx";

export default function App() {
  return (
    <main>
      <header>
        <HtmlNavigation>
          <HtmlModalAnchor modal={UploadModal}>Upload</HtmlModalAnchor>
          <HtmlModalAnchor
            disabled={statementsState.getUntaggedTransactionCount() === 0}
            modal={TaggingModal}
          >
            Tag Statements ({statementsState.getUntaggedTransactionCount()})
          </HtmlModalAnchor>
        </HtmlNavigation>
      </header>
      <hr />
      <article>
        <StatementSummaryTable />
        <TagDetails />
        <Show when={tagsState.getTagByLabel("doctor")}>
          {(getTag) => <SpendingSummaryTable tag={getTag()} />}
        </Show>
        <TagSummaryTable />
      </article>
    </main>
  );
}
