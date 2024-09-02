import { Signal } from "solid-js";
import { Statement } from "../types.ts";
import statementsState from "../state/statementsState.ts";
import HtmlModal from "../html/HtmlModal.tsx";
import uploadState from "../state/uploadState.ts";
import UploadFlow from "./UploadFlow.tsx";

type Props = { isOpen: Signal<boolean> };
export default function UploadModal(props: Props) {
  const [getIsOpen, setIsOpen] = props.isOpen;

  function onSubmit(statement: Statement) {
    if (
      statementsState.statementExists(statement) &&
      !confirm(`A statement named ${statement.name} already exists. Overwrite?`)
    )
      return;
    statementsState.addStatement(statement);
    uploadState.reset();
    setIsOpen(false);
  }

  return (
    <HtmlModal
      isOpen={props.isOpen}
      header={`Step ${uploadState.getStep() + 1} / ${uploadState.getMaxStep() + 1}: ${uploadState.getStepLabel()}`}
      body={<UploadFlow onSubmit={onSubmit} />}
    />
  );
}
