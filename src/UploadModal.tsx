import { Statement } from "./types.ts";
import Modal from "./Modal.tsx";
import UploadFlow from "./UploadFlow.tsx";
import { Signal } from "solid-js";
import uploadState from "./state/uploadState.ts";
import statementsState from "./state/statementsState.ts";

type Props = { isOpen: Signal<boolean> };
export default function UploadModal(props: Props) {
  const [_, setIsOpen] = props.isOpen;

  function onSubmit(statement: Statement) {
    if (
      statementsState.statementExists(statement) &&
      !confirm(`A statement named ${statement.name} already exists. Overwrite?`)
    )
      return;
    statementsState.addStatement(statement);
    setIsOpen(false);
  }

  return (
    <Modal
      isOpen={props.isOpen}
      header={`Step ${uploadState.getStep() + 1} / ${uploadState.getMaxStep() + 1}: ${uploadState.getStepLabel()}`}
      body={<UploadFlow onSubmit={onSubmit} />}
    />
  );
}
