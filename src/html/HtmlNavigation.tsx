import { ExtendProps, isObject } from "../types.ts";
import { children, For, splitProps } from "solid-js";

type Props = ExtendProps<"nav">;
export default function HtmlNavigation(props: Props) {
  const [local, parent] = splitProps(props, ["children"]);
  const resolved = children(() => local.children);
  const getChildren = () => resolved.toArray().filter(isObject);

  return (
    <nav {...parent}>
      <ul>
        <For each={getChildren()}>{(child) => <li>{child}</li>}</For>
      </ul>
    </nav>
  );
}
