import type { ExtendPropsChildless, TextSegment } from "./types.ts";
import { JSX, splitProps } from "solid-js";

type Props = ExtendPropsChildless<
  "span",
  {
    segment: TextSegment;
    style?: JSX.CSSProperties;
  }
>;

export default function TextSegment(props: Props) {
  const [local, parent] = splitProps(props, ["segment", "style"]);
  const getStyle = (): JSX.CSSProperties => ({
    ...(local.style ?? {}),
    "background-color": local.segment.match
      ? "rgba(255, 255, 0, 0.2)"
      : local.style?.["background-color"],
  });

  return (
    <span style={getStyle()} {...parent}>
      {local.segment.value}
    </span>
  );
}
