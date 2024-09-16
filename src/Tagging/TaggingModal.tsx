import { ExtendProps } from "../types.ts";
import Modal from "../Components/Modal.tsx";
import { mergeProps, useContext } from "solid-js";
import { ModalContext } from "../Components/Anchor.tsx";
import TaggingForm from "./TaggingForm.tsx";

type Props = ExtendProps<typeof Modal>;

export default function TaggingModal(props: Props) {
  props = mergeProps(props, { header: "Transaction Tagging" });
  const [, setOpen] = useContext(ModalContext).open;
  const onSubmit = () => setOpen(false);
  return (
    <Modal {...props}>
      <TaggingForm onSubmit={onSubmit} />
    </Modal>
  );
}
