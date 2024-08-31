import Modal from "./Modal.tsx";
import statementsState from "./state/statementsState.ts";
import TaggingForm from "./TaggingForm.tsx";
import { ExtendProps } from "./types.ts";

type Props = ExtendProps<typeof Modal, {}, "header" | "body">;

export default function TaggingModal(props: Props) {
  return (
    <Modal
      {...props}
      header={`${statementsState.getUntaggedTransactionCount()} untagged transactions remain.`}
      body={TaggingForm}
    />
  );
}
