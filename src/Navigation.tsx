import { ExtendPropsChildless, Statement } from "./types.ts";
import { statements } from "./state.ts";
import Modal from "./Modal.tsx";
import UploadForm from "./UploadFlow/UploadForm.tsx";
import TagForm from "./Tags/TagForm.tsx";
import TagNext from "./TagNext.tsx";

type Props = ExtendPropsChildless<"nav">;

export function Navigation(props: Props) {
  function onUpload(close: () => void, statement: Statement) {
    if (statements.statementNameExists(statement.name))
      if (!confirm(`Overwrite existing statement "${statement.name}"?`)) return;
    statements.addStatement(statement);
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
        <li>
          <Modal anchor="Tags" title="Tags">
            <TagForm />
          </Modal>
        </li>
        <li>
          <Modal anchor="Tag Next" title="Tag Next">
            <TagNext />
          </Modal>
        </li>
      </ul>
    </nav>
  );
}
