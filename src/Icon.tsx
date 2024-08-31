import { ExtendProps } from "./types.ts";
import { mergeProps } from "solid-js";

type Props = ExtendProps<"i", { kind: string }, "children">;
export default function Icon(props: Props) {
  props = mergeProps({ children: props.kind }, props);
  return (
    <i
      {...props}
      title={props.title ?? props.kind}
      role={props.role ?? props.onClick ? "button" : undefined}
      class="material-icons"
    />
  );
}
