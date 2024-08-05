import { ExtendProps } from "./types.ts";
import { createEffect, createSignal, JSX, Show, splitProps } from "solid-js";

type Props = ExtendProps<
  "article",
  {
    anchor: JSX.Element;
    title: JSX.Element;
    children: (close: () => void) => JSX.Element;
  }
>;
export default function Modal(props: Props) {
  const [local, parent] = splitProps(props, ["anchor", "title", "children"]);
  const [getOpen, setOpen] = createSignal(false);
  const open = () => setOpen(true);
  const close = () => setOpen(false);
  let ref: undefined | HTMLDialogElement;

  createEffect(() => getOpen() && ref?.focus());

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") close();
  }

  return (
    <>
      <span role="button" onClick={open}>
        {local.anchor}
      </span>
      <Show when={getOpen()}>
        <dialog ref={ref} onKeyDown={onKeyDown} open>
          <article {...parent}>
            <header>
              <a role="button" aria-label="Close" rel="prev" onClick={close} />
              <p>
                <strong>{local.title}</strong>
              </p>
            </header>
            {local.children(close)}
          </article>
        </dialog>
      </Show>
    </>
  );
}
