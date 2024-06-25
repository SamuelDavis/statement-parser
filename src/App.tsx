import UploadFlow from "./UploadFlow";
import { createSignal, Show } from "solid-js";
import { NormalRow } from "./types.ts";

function App() {
  const [getOpen, setOpen] = createSignal(false);

  function onSubmit(_: Event, name: string, rows: NormalRow[]) {
    setOpen(false);
    console.group(name);
    console.log(rows);
    console.groupEnd();
  }

  return (
    <main>
      <header>
        <button onClick={() => setOpen(true)}>Upload</button>
      </header>
      <Show when={getOpen()}>
        <dialog open>
          <article>
            <header>
              <a
                role="button"
                href="#"
                rel="prev"
                onClick={() => setOpen(false)}
                aria-label="close"
              />
              <p>
                <strong>Upload a new Bank statement</strong>
              </p>
            </header>
            <UploadFlow onSubmit={onSubmit} />
          </article>
        </dialog>
      </Show>
    </main>
  );
}

export default App;
