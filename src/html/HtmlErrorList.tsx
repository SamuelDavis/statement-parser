import { ExtendProps } from "../types.ts";
import { children, For, Show, splitProps } from "solid-js";

type Props = ExtendProps<"ul">;
export default function HtmlErrorList(props: Props) {
  const [local, parent] = splitProps(props, ["children"]);
  const resolved = children(() => local.children);
  const getChildren = () => resolved.toArray();
  return (
    <Show when={getChildren().length > 0}>
      <ul {...parent}>
        <For each={getChildren()}>{(child) => <li>{child}</li>}</For>
      </ul>
    </Show>
  );
}
