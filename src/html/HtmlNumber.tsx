import { ExtendProps } from "../types.ts";
import { splitProps } from "solid-js";

type Props = ExtendProps<"span", { value: number }, "children">;
export default function HtmlNumber(props: Props) {
  const [local, parent] = splitProps(props, ["value"]);
  return <span {...parent}>{local.value.toLocaleString()}</span>;
}
