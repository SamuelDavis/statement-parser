import { ExtendPropsChildless } from "./types.ts";
import {
  createEffect,
  createSignal,
  JSX,
  mergeProps,
  Show,
  splitProps,
  ValidComponent,
} from "solid-js";
import { Dynamic } from "solid-js/web";

type Props = ExtendPropsChildless<
  "article",
  {
    anchor: JSX.Element;
    title: JSX.Element;
    open?: false | boolean;
    component?: ValidComponent;
    callback?: (close: () => void) => JSX.Element;
  }
>;
export default function Modal(props: Props) {
  props = mergeProps({ open: false }, props);
  const [local, parent] = splitProps(props, [
    "anchor",
    "title",
    "open",
    "component",
    "callback",
  ]);
  const [getOpen, setOpen] = createSignal(local.open);
  const open = () => setOpen(true);
  const close = () => setOpen(false);
  const getChildren = () => {
    if (local.callback) return local.callback(close);
    if (local.component) return <Dynamic component={local.component} />;
    throw new TypeError();
  };
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
            {getChildren()}
          </article>
        </dialog>
      </Show>
    </>
  );
}
