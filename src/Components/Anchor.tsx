import {
  createContext,
  createSignal,
  splitProps,
  ValidComponent,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import { ExtendProps } from "../types.ts";

import { handle } from "../utilities.ts";

export const ModalContext = createContext({ open: createSignal(false) });

type Props = ExtendProps<"button", { modal: ValidComponent; open?: boolean }>;

export default function Anchor(props: Props) {
  const [local, parent] = splitProps(props, ["modal", "open", "onClick"]);
  const open = createSignal(local.open ?? false);
  const [, setOpen] = open;

  function onClick(event: MouseEvent) {
    setOpen(true);
    handle(local.onClick, event);
  }

  return (
    <ModalContext.Provider value={{ open }}>
      <button onClick={onClick} {...parent} />
      <Dynamic component={local.modal} />
    </ModalContext.Provider>
  );
}
