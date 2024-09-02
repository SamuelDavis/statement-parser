import { ExtendProps } from "../types.ts";
import { createEffect, onCleanup, splitProps } from "solid-js";
import { Chart, ChartConfiguration } from "chart.js/auto";

type Props = ExtendProps<"canvas", { config: ChartConfiguration }>;
export default function HtmlChart(props: Props) {
  const [local, parent] = splitProps(props, ["config"]);
  let ref: undefined | HTMLCanvasElement;
  let chart: undefined | Chart;

  createEffect(() => {
    chart?.destroy();
    chart = ref ? new Chart(ref, local.config) : undefined;
  });
  onCleanup(() => chart?.destroy());

  return <canvas ref={ref} {...parent} />;
}
