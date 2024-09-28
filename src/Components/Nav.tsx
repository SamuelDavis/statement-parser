import { children, For, splitProps } from "solid-js";
import { ExtendProps } from "../types.ts";

type Props = ExtendProps<"nav">;
export default function Nav(props: Props) {
  const [local, parent] = splitProps(props, ["children"]);
  const getChildren = children(() => local.children).toArray;
  return (
    <nav {...parent}>
      <ul>
        <For each={getChildren()}>{(child) => <li>{child}</li>}</For>
      </ul>
    </nav>
  );
}
