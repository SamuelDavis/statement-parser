import { A } from "@solidjs/router";
import { ErrorBoundary, For, Suspense, type ParentProps } from "solid-js";

const links = [
  { href: "/", label: "Insights" },
  { href: "/import", label: "Import" },
  { href: "/tagging", label: "Tagging" },
  { href: "/tags", label: "Tags" },
] as const;

export default function Layout(props: ParentProps) {
  return (
    <>
      <header>
        <nav>
          <ul>
            <li>
              <strong>Statement Parser</strong>
            </li>
          </ul>
          <ul>
            <For each={links}>
              {(link) => (
                <li>
                  <A href={link.href} end>
                    {link.label}
                  </A>
                </li>
              )}
            </For>
          </ul>
        </nav>
      </header>
      <main>
        <ErrorBoundary fallback={ErrorDialog}>
          <Suspense fallback={<progress />}>{props.children}</Suspense>
        </ErrorBoundary>
      </main>
    </>
  );
}

function ErrorDialog(error: unknown, reset: () => void) {
  console.error(error);

  function onClearStorage(): void {
    localStorage.clear();
    window.location.reload();
  }

  return (
    <dialog open>
      <article>
        <header>
          <h2>Something went wrong</h2>
        </header>
        <pre>{error instanceof Error ? error.stack : String(error)}</pre>
        <footer>
          <button type="button" class="secondary" onClick={onClearStorage}>
            Clear Storage
          </button>
          <button type="button" onClick={reset}>
            Retry
          </button>
        </footer>
      </article>
    </dialog>
  );
}
