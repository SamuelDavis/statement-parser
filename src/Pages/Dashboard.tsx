import Anchor from "../Components/Anchor";
import UploadModal from "../Upload/UploadModal.tsx";
import TaggingModal from "../Tagging/TaggingModal.tsx";

export default function Dashboard() {
  return (
    <article>
      <header>
        <h1>Dashboard</h1>
      </header>
      <section>
        <h3>Quick Actions</h3>
        <ul>
          <li>
            <Anchor modal={UploadModal}>Upload a new Bank Statement</Anchor>
          </li>
          <li>
            <Anchor modal={TaggingModal}>Tag Untagged Transactions</Anchor>
          </li>
        </ul>
      </section>
      <section>
        <h1>Segments</h1>
      </section>
    </article>
  );
}
