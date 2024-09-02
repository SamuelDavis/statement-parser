import { ExtendProps } from "../types.ts";
import {
  Component,
  JSX,
  onCleanup,
  onMount,
  Show,
  Signal,
  splitProps,
} from "solid-js";
import { renderElementOrComponent } from "../utilities.tsx";

type Props = ExtendProps<
  "dialog",
  {
    isOpen: Signal<boolean>;
    header?: Component | JSX.Element;
    body?: Component | JSX.Element;
  },
  "children"
>;
export default function HtmlModal(props: Props) {
  const [local, parent] = splitProps(props, ["isOpen", "header", "body"]);

  const [getIsOpen, setIsOpen] = local.isOpen;
  const close = () => setIsOpen(false);
  const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && close();

  onMount(() => window.addEventListener("keydown", onKeyDown));
  onCleanup(() => window.removeEventListener("keydown", onKeyDown));

  return (
    <Show when={getIsOpen()}>
      <dialog open {...parent}>
        <article>
          <header>
            <a role="button" aria-label="Close" rel="prev" onClick={close} />
            {renderElementOrComponent(local.header)}
          </header>
          {renderElementOrComponent(local.body)}
        </article>
      </dialog>
    </Show>
  );
}
