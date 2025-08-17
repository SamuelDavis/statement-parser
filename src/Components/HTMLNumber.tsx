import { mergeProps, splitProps } from "solid-js";
import type { ExtendProps } from "../types";

type Props = ExtendProps<
  "span",
  { value: number; locale?: string; currency?: boolean; precision?: number },
  "children"
>;
export default function HTMLNumber(props: Props) {
  props = mergeProps({ locale: "en-US", precision: 2, currency: true }, props);
  const [local, parent] = splitProps(props, [
    "value",
    "locale",
    "currency",
    "precision",
  ]);

  return (
    <span
      classList={{
        currency: local.currency,
        positive: local.currency && local.value > 0,
        negative: local.currency && local.value < 0,
      }}
      {...parent}
    >
      {local.value.toLocaleString(local.locale, {
        minimumFractionDigits: local.precision,
        maximumFractionDigits: local.precision,
      })}
    </span>
  );
}
