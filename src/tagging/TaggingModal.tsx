import HtmlModal from "../html/HtmlModal.tsx";
import statementsState from "../state/statementsState.ts";
import TaggingForm from "./TaggingForm.tsx";
import { ExtendProps, Statement } from "../types.ts";
import { Show, splitProps } from "solid-js";
import derivedState from "../state/derivedState.ts";

type Props = ExtendProps<
  typeof HtmlModal,
  { statement?: Statement },
  "header" | "body"
>;
export default function TaggingModal(props: Props) {
  const [local, parent] = splitProps(props, ["statement"]);
  const getTransactions = () =>
    local.statement?.transactions ?? statementsState.getTransactions();
  const getHasTransactions = () => getTransactions().length > 0;
  return (
    <HtmlModal
      {...parent}
      header={`${derivedState.getUntaggedTransactionCount()} untagged transactions remain.`}
      body={
        <Show
          when={getHasTransactions()}
          fallback={<p>No untagged transactions remain.</p>}
        >
          {<TaggingForm transactions={getTransactions()} />}
        </Show>
      }
    />
  );
}
