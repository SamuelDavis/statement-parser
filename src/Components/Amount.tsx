import { ExtendProps } from "../types.ts";
import { splitProps } from "solid-js";
import Number from "./Number.tsx";

type Props = ExtendProps<"span", { value: number }, "children">;

export default function Amount(props: Props) {
  const [local, parent] = splitProps(props, ["value"]);
  return (
    <span {...parent}>
      $<Number value={local.value} />
    </span>
  );
}
