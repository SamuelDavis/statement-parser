import { splitProps } from "solid-js";
import type { ExtendProps } from "../types";

type Props = ExtendProps<"span", { value: Date }, "children">;

export default function HTMLDate(props: Props) {
  const [local, parent] = splitProps(props, ["value"]);
  return <span {...parent}>{local.value.toLocaleDateString()}</span>;
}
