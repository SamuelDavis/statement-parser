import { ExtendProps } from "../types.ts";
import { splitProps } from "solid-js";

type Props = ExtendProps<"label", { value: string }>;
export default function HtmlLabel(props: Props) {
  const [local, parent] = splitProps(props, ["value", "children"]);
  return (
    <label {...parent}>
      <span>{local.value}: </span>
      {local.children}
    </label>
  );
}
