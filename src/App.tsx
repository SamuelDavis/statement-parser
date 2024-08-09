import { Navigation } from "./Navigation.tsx";
import { UploadTable } from "./UploadTable.tsx";

export default function App() {
  return (
    <>
      <header>
        <Navigation />
      </header>
      <main>
        <section>
          <UploadTable />
        </section>
      </main>
    </>
  );
}
