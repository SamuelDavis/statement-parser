import { ExtendProps } from "../types.ts";
import { splitProps } from "solid-js";

type Props = ExtendProps<"canvas">;
export default function Chart(props: Props) {
  const [, parent] = splitProps(props, []);
  return <canvas {...parent} />;
}
