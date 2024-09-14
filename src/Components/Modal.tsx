import { Portal } from "solid-js/web";
import {
  JSX,
  onCleanup,
  onMount,
  Show,
  splitProps,
  useContext,
} from "solid-js";
import { ModalContext } from "./Anchor.tsx";
import { ExtendProps } from "../types.ts";

type Props = ExtendProps<"dialog", { header?: JSX.Element }, "open">;

export default function Dialog(props: Props) {
  const [local, parent] = splitProps(props, ["header", "children"]);
  const modalContext = useContext(ModalContext);
  const [getOpen, setOpen] = modalContext.open;
  const onClose = () => setOpen(false);

  const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose();
  onMount(() => window.addEventListener("keydown", onKeyDown));
  onCleanup(() => window.removeEventListener("keydown", onKeyDown));

  return (
    <Show when={getOpen()}>
      <Portal mount={document.body}>
        <dialog open={getOpen()} {...parent}>
          <article>
            <Show when={local.header}>
              {(getHeader) => (
                <header>
                  <a
                    role="button"
                    aria-label="Close"
                    rel="prev"
                    onClick={onClose}
                  />
                  <p>
                    <strong>{getHeader()}</strong>
                  </p>
                </header>
              )}
            </Show>
            {local.children}
          </article>
        </dialog>
      </Portal>
    </Show>
  );
}
