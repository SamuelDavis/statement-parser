import UploadForm from "./UploadFlow/UploadForm.tsx";
import Modal from "./Modal.tsx";

export default function App() {
  return (
    <main>
      <Modal anchor="Upload" title="Upload">
        {(close) => <UploadForm onSubmit={close} />}
      </Modal>
    </main>
  );
}
