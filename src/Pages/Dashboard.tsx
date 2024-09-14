import Anchor from "../Components/Anchor";
import UploadModal from "../Upload/UploadModal.tsx";

export default function Dashboard() {
  return (
    <article>
      <header>
        <h1>Dashboard</h1>
      </header>
      <section>
        <Anchor modal={UploadModal}>Upload a new Bank Statement</Anchor>
      </section>
    </article>
  );
}
