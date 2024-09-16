import { ExtendProps } from "../types.ts";
import { mergeProps, splitProps } from "solid-js";

type Props = ExtendProps<"i", { value: string }, "children">;

export default function Icon(props: Props) {
  props = mergeProps(
    {
      title: props.value,
      role: props.role ?? (props.onClick ? "button" : undefined),
    },
    props,
    { class: `material-icons ${props.class}`.trim() },
  );
  const [local, parent] = splitProps(props, ["value"]);
  return <i {...parent}>{local.value}</i>;
}
