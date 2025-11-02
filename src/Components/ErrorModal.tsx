import { For } from "solid-js";

export default function ErrorModal(props: { error: Error; reset: () => void }) {
  const getErrorLines = () => props.error.message.split("\n") ?? [];
  const getStackLines = () => props.error.stack?.split("\n") ?? [];
  const getFirst = () => getStackLines()[0] ?? undefined;
  const getRest = () => getStackLines().slice(1);

  return (
    <dialog open>
      <article>
        <header>
          <h1>Something went wrong.</h1>
        </header>
        <ul>
          <For each={getErrorLines()}>{(line) => <li>{line}</li>}</For>
        </ul>
        <details>
          <summary>Trace</summary>
          <dl>
            <dt>{getFirst()}</dt>
            <For each={getRest()}>{(line) => <dd>{line}</dd>}</For>
          </dl>
        </details>
        <footer>
          <button onClick={props.reset}>Reset</button>
        </footer>
      </article>
    </dialog>
  );
}
