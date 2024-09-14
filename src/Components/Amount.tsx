import { ExtendProps } from "../types.ts";
import { splitProps } from "solid-js";

type Props = ExtendProps<"span", { value: number }, "children">;

export default function Amount(props: Props) {
  const [local, parent] = splitProps(props, ["value"]);
  return <span {...parent}>${local.value.toFixed(2)}</span>;
}
