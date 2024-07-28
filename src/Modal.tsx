import { JSX, ParentProps, Show } from "solid-js";
import { createSignal } from "./utils.ts";

export function Modal(
  props: ParentProps & { title: JSX.Element; anchor: JSX.Element },
) {
  const [getOpen, setOpen] = createSignal(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>{props.anchor}</button>
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
                <strong>{props.title}</strong>
              </p>
            </header>
            {props.children}
          </article>
        </dialog>
      </Show>
    </>
  );
}
