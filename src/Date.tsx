import { ExtendPropsChildless } from "./types.ts";
import { splitProps } from "solid-js";

type Props = ExtendPropsChildless<"span", { value: Date }>;

export default function Date(props: Props) {
  const [local, parent] = splitProps(props, ["value"]);
  return <span {...parent}>{local.value.toLocaleDateString()}</span>;
}
