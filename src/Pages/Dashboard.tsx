import Anchor from "../Components/Anchor";
import UploadModal from "../Upload/UploadModal.tsx";
import TaggingModal from "../Tagging/TaggingModal.tsx";

export default function Dashboard() {
  return (
    <article>
      <header>
        <h1>Dashboard</h1>
      </header>
      <dl>
        <dt>Quick Actions</dt>
        <dd>
          <Anchor modal={UploadModal}>Upload a new Bank Statement</Anchor>
        </dd>
        <dd>
          <Anchor modal={TaggingModal}>Tag Untagged Transactions</Anchor>
        </dd>
      </dl>
    </article>
  );
}
