import { children, For, Show, splitProps } from "solid-js";
import { ExtendProps } from "../types.ts";

type Props = ExtendProps<"ul">;

export default function Nav(props: Props) {
  const [local, parent] = splitProps(props, ["children"]);
  const getChildren = children(() => local.children).toArray;
  return (
    <Show when={getChildren().length > 0}>
      <ul {...parent}>
        <For each={getChildren()}>{(child) => <li>{child}</li>}</For>
      </ul>
    </Show>
  );
}
