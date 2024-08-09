import { ExtendPropsChildless, Statement } from "./types.ts";
import appState from "./appState.ts";
import Modal from "./Modal.tsx";
import UploadForm from "./UploadFlow/UploadForm.tsx";

type Props = ExtendPropsChildless<"nav">;

export function Navigation(props: Props) {
  function onUpload(close: () => void, statement: Statement) {
    if (appState.statementNameExists(statement.name))
      if (!confirm(`Overwrite existing statement "${statement.name}"?`)) return;
    appState.addStatement(statement);
    close();
  }

  return (
    <nav {...props}>
      <ul>
        <li>
          <Modal anchor="Upload" title="Upload">
            {(close) => <UploadForm onSubmit={onUpload.bind(null, close)} />}
          </Modal>
        </li>
      </ul>
    </nav>
  );
}
