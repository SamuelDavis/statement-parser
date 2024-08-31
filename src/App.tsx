import Navigation from "./Navigation.tsx";
import StatementSummaryTable from "./StatementSummaryTable.tsx";
import ModalAnchor from "./ModalAnchor.tsx";
import UploadModal from "./UploadModal.tsx";
import statementsState from "./state/statementsState.ts";
import TaggingModal from "./TaggingModal.tsx";
import TagSummaryTable from "./TagSummaryTable.tsx";
import SpendingSummaryTable from "./SpendingSummaryTable.tsx";
import tagsState from "./state/tagsState.ts";

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
        <SpendingSummaryTable tag={tagsState.getTagByLabel("doctor")} />
        <TagSummaryTable />
      </article>
    </main>
  );
}
