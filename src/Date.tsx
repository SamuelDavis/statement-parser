import { ExtendProps } from "./types.ts";
import { splitProps } from "solid-js";

type Props = ExtendProps<"span", { value: Date }, "children">;
export default function Date(props: Props) {
  const [local, parent] = splitProps(props, ["value"]);
  return <span {...parent}>{local.value.toLocaleDateString()}</span>;
}
