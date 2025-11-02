import type { ExtendProps } from "@samueldavis/tslib";
import { mergeProps, splitProps } from "solid-js";

type Props = ExtendProps<
  "span",
  { value: number; money?: boolean; precision?: number; highlight?: boolean }
>;
export default function HTMLNumber(props: Props) {
  const merged = mergeProps(
    {
      highlight: false,
      money: false,
      precision: props.money ? 2 : Number.isInteger(props.value) ? 0 : 2,
      fill: true,
    },
    props,
  );
  const [local, parent] = splitProps(merged, [
    "value",
    "highlight",
    "money",
    "precision",
  ]);
  const getClassList: () => Record<string, boolean> = () => ({
    ...(parent.classList ?? {}),
    money: local.money,
    positive: local.highlight && local.value > 0,
    negative: local.highlight && local.value < 0,
  });

  return (
    <span {...parent} classList={getClassList()}>
      <span>
        {local.value.toLocaleString("en-US", {
          minimumFractionDigits: local.precision,
          maximumFractionDigits: local.precision,
        })}
      </span>
    </span>
  );
}
