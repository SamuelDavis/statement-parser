import { ExtendProps } from "../types.ts";
import { children, For, Show, splitProps } from "solid-js";

type Props = ExtendProps<"ul">;
export default function HtmlFlexGroup(props: Props) {
  const [local, parent] = splitProps(props, ["children"]);
  const resolved = children(() => local.children);
  const getChildren = () => resolved.toArray();
  return (
    <Show when={getChildren().length > 0}>
      <ul
        {...parent}
        style={{
          margin: 0,
          padding: 0,
          display: "flex",
          "flex-direction": "row",
          "flex-wrap": "wrap",
          gap: "1em",
          "max-width": "100%",
          overflow: "auto",
        }}
      >
        <For each={getChildren()}>
          {(child) => (
            <li style={{ "list-style-type": "none", margin: 0, padding: 0 }}>
              {child}
            </li>
          )}
        </For>
      </ul>
    </Show>
  );
}
