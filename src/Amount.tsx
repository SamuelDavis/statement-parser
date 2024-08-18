import { ExtendProps } from "./types.ts";
import { JSX, splitProps } from "solid-js";

type Props = ExtendProps<
  "span",
  { value: number; style?: JSX.CSSProperties },
  "children"
>;
export default function Amount(props: Props) {
  const [local, parent] = splitProps(props, ["value", "style"]);
  const getColor = (): undefined | JSX.CSSProperties["color"] => {
    if (local.value > 0) return "lightgreen";
    if (local.value < 0) return "pink";
    return undefined;
  };

  return (
    <span {...parent} style={{ ...local.style, color: getColor() }}>
      ${local.value.toFixed(2)}
    </span>
  );
}
