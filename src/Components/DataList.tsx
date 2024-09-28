import { ExtendProps } from "../types.ts";
import { For, splitProps } from "solid-js";

type Props = ExtendProps<"datalist", { value: string[] }, "children">;

export default function DataList(props: Props) {
  const [local, parent] = splitProps(props, ["value"]);
  return (
    <datalist {...parent}>
      <For each={local.value}>{(value) => <option value={value} />}</For>
    </datalist>
  );
}
