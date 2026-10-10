import { createEffect, onCleanup, onMount } from "solid-js";
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  type ChartData,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { formatMoney } from "../utils/format";

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
);

const colors = {
  positive: "#16a34a",
  negative: "#e11d48",
  average: "#0ea5e9",
  fit: "#f59e0b",
};

type Props = {
  labels: string[];
  totals: number[];
  average: number[];
  fit: number[];
};

export default function TrendChart(props: Props) {
  let canvas!: HTMLCanvasElement;

  const getData = (): ChartData<"bar" | "line", number[], string> => ({
    labels: props.labels,
    datasets: [
      {
        type: "bar",
        label: "Total",
        data: props.totals,
        backgroundColor: props.totals.map(getBarColor),
      },
      {
        type: "line",
        label: "Moving average",
        data: props.average,
        borderColor: colors.average,
        backgroundColor: colors.average,
        pointRadius: 0,
      },
      {
        type: "line",
        label: "Best fit",
        data: props.fit,
        borderColor: colors.fit,
        backgroundColor: colors.fit,
        borderDash: [6, 6],
        pointRadius: 0,
      },
    ],
  });

  onMount(() => {
    const chart = new Chart<"bar" | "line", number[], string>(canvas, {
      type: "bar",
      data: getData(),
      options: {
        scales: {
          y: { beginAtZero: true, ticks: { callback: formatTick } },
        },
        plugins: {
          tooltip: { callbacks: { label: formatTooltip } },
        },
      },
    });
    createEffect(() => {
      chart.data = getData();
      chart.update();
    });
    onCleanup(() => chart.destroy());
  });

  return (
    <figure>
      <canvas ref={canvas} />
    </figure>
  );
}

function getBarColor(value: number): string {
  return value < 0 ? colors.negative : colors.positive;
}

function formatTick(value: string | number): string {
  return formatMoney(Number(value));
}

function formatTooltip(context: {
  dataset: { label?: string };
  parsed: { y: number | null };
}): string {
  return `${context.dataset.label}: ${formatMoney(context.parsed.y ?? 0)}`;
}
