import Navigation from "./Navigation.tsx";
import StatementSummaryTable from "./StatementSummaryTable.tsx";
import ModalAnchor from "./ModalAnchor.tsx";
import UploadModal from "./UploadModal.tsx";
import statementsState from "./state/statementsState.ts";
import TaggingModal from "./TaggingModal.tsx";
import TagSummaryTable from "./TagSummaryTable.tsx";
import SpendingSummaryTable from "./SpendingSummaryTable.tsx";
import tagsState from "./state/tagsState.ts";
import { Show } from "solid-js";
import TagDetails from "./TagDetails.tsx";

export default function App() {
  return (
    <main>
      <header>
        <Navigation>
          <ModalAnchor modal={UploadModal}>Upload</ModalAnchor>
          <ModalAnchor
            disabled={statementsState.getUntaggedTransactionCount() === 0}
            modal={TaggingModal}
          >
            Tag Statements ({statementsState.getUntaggedTransactionCount()})
          </ModalAnchor>
        </Navigation>
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
