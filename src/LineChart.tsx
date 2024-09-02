import { createSignal, onCleanup, onMount, splitProps } from "solid-js";
import { Chart, ChartConfiguration } from "chart.js/auto";
import { ExtendProps, isHtml } from "./types.ts";

type Props = ExtendProps<"canvas", { config: ChartConfiguration }>;
export default function LineChart(props: Props) {
  const [local, parent] = splitProps(props, ["config"]);
  const [getChart, setChart] = createSignal<undefined | Chart>();
  let ref: undefined | HTMLCanvasElement;

  onMount(() => {
    isHtml("canvas", ref) && setChart(new Chart(ref, local.config));
  });
  onCleanup(() => {
    return getChart()?.destroy();
  });

  return <canvas ref={ref} {...parent} />;
}
