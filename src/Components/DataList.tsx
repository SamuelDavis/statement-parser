import { For, splitProps } from "solid-js";
import type { ExtendProps } from "@samueldavis/solidlib";

type Props = ExtendProps<"datalist", { options: string[] }, "children">;

export default function DataList(props: Props) {
  const [local, parent] = splitProps(props, ["options"]);
  return (
    <datalist {...parent}>
      <For each={local.options}>{(value) => <option value={value} />}</For>
    </datalist>
  );
}
