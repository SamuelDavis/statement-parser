import { A } from "@solidjs/router";
import { ErrorBoundary, For, type ParentProps, Show } from "solid-js";
import { assert, isInstanceOf } from "../types";

export default function Layout(props: ParentProps) {
  return (
    <main>
      <header>
        <nav>
          <ul>
            <li>
              <A href="/">Home</A>
            </li>
            <For
              each={["Upload", "Statements", "Transactions", "Tags", "Tagging"]}
            >
              {(label) => (
                <li>
                  <A href={`/${label.toLowerCase()}`}>{label}</A>
                </li>
              )}
            </For>
          </ul>
        </nav>
      </header>
      <ErrorBoundary fallback={onError}>{props.children}</ErrorBoundary>
    </main>
  );
}

function onError(error: unknown, reset: () => void) {
  console.error(error);
  const onClearStorage = () => {
    localStorage.clear();
    window.location.reload();
  };
  assert(isInstanceOf, error, Error);
  const [message, ...trace] = error.stack?.split("\n") ?? [];
  return (
    <dialog open>
      <article>
        <header>
          <a href="#" type="button" rel="prev" onClick={reset} />
          <h1>{error.name}</h1>
        </header>
        <Show when={isInstanceOf(error, TypeError)}>
          <button type="button" onClick={onClearStorage}>
            Clear Storage
          </button>
        </Show>
        <p>{error.message}</p>
        <details open>
          <summary>Trace</summary>
          <output>{message}</output>
          <ol>
            <For each={trace}>{(line) => <li>{line}</li>}</For>
          </ol>
        </details>
      </article>
    </dialog>
  );
}
