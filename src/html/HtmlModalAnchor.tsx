import { Component, createSignal, JSX, Signal, splitProps } from "solid-js";
import { ExtendProps, isFunction } from "../types.ts";

type Props = ExtendProps<
  "button",
  {
    open?: boolean;
    modal:
      | ((args: { isOpen: Signal<boolean> }) => JSX.Element)
      | Component<{ isOpen: Signal<boolean> }>;
  }
>;
export default function HtmlModalAnchor(props: Props) {
  const [local, parent] = splitProps(props, ["open", "onClick", "modal"]);
  const isOpen = createSignal(local.open ?? false);
  const [_, setIsOpen] = isOpen;

  function onClick(
    e: MouseEvent & { target: Element; currentTarget: HTMLButtonElement },
  ) {
    setIsOpen(true);
    if (isFunction(local.onClick)) local.onClick(e);
  }

  return (
    <>
      <button onClick={onClick} {...parent} />
      {local.modal({ isOpen })}
    </>
  );
}
