import { mergeProps, splitProps } from "solid-js";
import type { ExtendProps } from "../types";

type Props = ExtendProps<"i", { type: "edit" | "check" | "close" }, "children">;
export default function HTMLIcon(props: Props) {
  props = mergeProps(
    {
      role: props.onClick ? ("button" as const) : undefined,
      title: props.type,
    },
    props,
  );
  const [local, parent] = splitProps(props, ["type", "classList"]);
  const getClassList = (): NonNullable<Props["classList"]> => ({
    ...(local.classList ?? {}),
    "material-icons": true,
  });
  return (
    <i classList={getClassList()} {...parent}>
      {local.type}
    </i>
  );
}
