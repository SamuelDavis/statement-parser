import { ExtendProps } from "../types.ts";
import Modal from "../Components/Modal.tsx";
import { mergeProps, useContext } from "solid-js";
import { ModalContext } from "../Components/Anchor.tsx";
import UploadForm from "./UploadForm.tsx";

type Props = ExtendProps<typeof Modal>;

export default function UploadModal(props: Props) {
  props = mergeProps(props, { header: "Upload a Bank Statement" });
  const [, setOpen] = useContext(ModalContext).open;
  const onSubmit = () => setOpen(false);
  return (
    <Modal {...props}>
      <UploadForm onSubmit={onSubmit} />
    </Modal>
  );
}
