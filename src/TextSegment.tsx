import type { ExtendProps, TextSegment } from "./types.ts";
import { JSX, splitProps } from "solid-js";

type Props = ExtendProps<
  "span",
  { value: TextSegment; style?: JSX.CSSProperties },
  "children"
>;
export default function TextSegment(props: Props) {
  const [local, parent] = splitProps(props, ["value", "style"]);
  const getStyle = (): JSX.CSSProperties => ({
    ...(local.style ?? {}),
    "background-color": local.value.match
      ? "rgba(255, 255, 0, 0.2)"
      : local.style?.["background-color"],
  });

  return (
    <span style={getStyle()} {...parent}>
      {local.value.value}
    </span>
  );
}
