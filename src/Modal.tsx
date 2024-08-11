import { ExtendProps, isCallable } from "./types.ts";
import {
  createEffect,
  createSignal,
  JSX,
  mergeProps,
  Show,
  splitProps,
} from "solid-js";

type Props = ExtendProps<
  "article",
  {
    anchor: JSX.Element;
    title: JSX.Element;
    children: JSX.Element | ((close: () => void) => JSX.Element);
    open?: false | boolean;
  }
>;
export default function Modal(props: Props) {
  props = mergeProps({ open: false }, props);
  const [local, parent] = splitProps(props, [
    "anchor",
    "title",
    "children",
    "open",
  ]);
  const [getOpen, setOpen] = createSignal(local.open);
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
            {isCallable(local.children)
              ? local.children(close)
              : local.children}
          </article>
        </dialog>
      </Show>
    </>
  );
}
