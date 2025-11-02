import { splitProps } from "solid-js";
import type { ExtendProps } from "@samueldavis/tslib";

type Props = ExtendProps<
  "span",
  { value: Date; format?: Intl.DateTimeFormatOptions },
  "children"
>;

export default function HTMLDate(props: Props) {
  const [local, parent] = splitProps(props, ["value", "format"]);
  return (
    <span {...parent}>
      {local.value.toLocaleDateString("en-US", local.format)}
    </span>
  );
}
