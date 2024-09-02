import { ExtendProps } from "../types.ts";
import { JSX, splitProps } from "solid-js";

type Props = ExtendProps<
  "span",
  { value: number; style?: JSX.CSSProperties },
  "children"
>;
export default function HtmlAmount(props: Props) {
  const [local, parent] = splitProps(props, ["value", "style"]);
  const getStyle = (): JSX.CSSProperties => ({
    ...(local.style ?? {}),
    color:
      local.style?.color ?? local.value < 0
        ? "pink"
        : local.value > 0
          ? "lightgreen"
          : undefined,
  });

  return (
    <span style={getStyle()} {...parent}>
      ${local.value.toFixed(2)}
    </span>
  );
}
