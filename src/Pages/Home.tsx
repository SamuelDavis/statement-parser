import {
  Show,
  useContext,
  For,
  createSignal,
  createMemo,
  onMount,
  type Accessor,
  splitProps,
  Switch,
  Match,
} from "solid-js";
import { AppState } from "../Context";
import { A, useParams } from "@solidjs/router";
import {
  assert,
  isNonNullable,
  isOf,
  type ExtendProps,
  type Targeted,
} from "@samueldavis/solidlib";
import type { Transaction, Tag } from "../types";
import { isBefore, startOfISOWeek, startOfYear } from "date-fns";
import HTMLDate from "../Components/HTMLDate";
import HTMLNumber from "../Components/HTMLNumber";
import { startOfMonth } from "date-fns/fp";
import { Line } from "solid-chartjs";
import { Chart, Colors, Legend, Title, Tooltip } from "chart.js";
import type { Signal } from "solid-js/types/server/reactive.js";

const chartNames = [
  "absolute-totals",
  "total-change",
  "percent-change",
] as const;
type ChartName = (typeof chartNames)[number];
const intervals = ["WEEK", "MONTH", "YEAR"] as const;
type Interval = (typeof intervals)[number];
type Bucket = { date: Date; transactions: Transaction[] };
const intervalTransformers: Record<Interval, (date: Date) => Date> = {
  WEEK: startOfISOWeek,
  MONTH: startOfMonth,
  YEAR: startOfYear,
};

export default function Home() {
  const state = useContext(AppState);
  assert(isNonNullable, state);
  const interval = createSignal<Interval>("WEEK");
  const tags = createSignal<Tag["regexp"]["source"][]>([]);
  const [getInterval] = interval;
  const [getTags] = tags;

  const getBuckets = createMemo((): Bucket[] => {
    const tags = getTags();
    const regexp =
      tags.length > 0 ? new RegExp(`(${tags.join(")|(")})`, "gi") : undefined;
    const transactions = regexp
      ? state.getTransactions().filter((tx) => tx.description.match(regexp))
      : state.getTransactions();
    const interval = getInterval();

    const buckets = transactions.reduce((acc, transaction) => {
      const weekStart = intervalTransformers[interval](
        transaction.date,
      ).getTime();
      if (acc.get(weekStart)?.push(transaction) === undefined)
        acc.set(weekStart, [transaction]);
      return acc;
    }, new Map<number, Transaction[]>());

    return [...buckets.entries()]
      .sort(([a], [b]) => b - a)
      .map(([ts, transactions]) => ({
        date: new Date(ts),
        transactions,
      }));
  });

  return (
    <article>
      <Show
        when={state.getStatements().length > 0}
        fallback={
          <p>
            No statements available. <A href={"/upload"}>Try uploading one</A>.
          </p>
        }
      >
        <section>
          <h2>Tags</h2>
          <p>You have {state.getTags().length} tag(s).</p>
        </section>
        <section>
          <h2>Statements</h2>
          <p>You have {state.getStatements().length} statement(s).</p>
        </section>
        <section>
          <h2>Transactions</h2>
          <p>You have {state.getTransactions().length} transaction(s).</p>
        </section>
        <Graph getBuckets={getBuckets} tags={tags} interval={interval} />
        <Table getBuckets={getBuckets} />
      </Show>
    </article>
  );
}

function Graph(
  props: ExtendProps<
    "article",
    {
      getBuckets: Accessor<Bucket[]>;
      tags: Signal<Tag["regexp"]["source"][]>;
      interval: Signal<Interval>;
    }
  >,
) {
  const params = useParams<{ chart?: ChartName }>();
  const getChartName = () => params.chart ?? chartNames[0];
  const state = useContext(AppState);
  assert(isNonNullable, state);
  const [local, parent] = splitProps(props, ["getBuckets", "tags", "interval"]);
  const [getTags, setTags] = local.tags;
  const [getInterval, setInterval] = local.interval;

  const getBuckets = createMemo(() =>
    [...local.getBuckets()].sort((a, b) => (isBefore(a.date, b.date) ? -1 : 1)),
  );

  onMount(() => {
    Chart.register(Title, Tooltip, Legend, Colors);
  });

  const getAbsoluteTotalData = () => {
    const buckets = getBuckets();
    const data = buckets.map((bucket) =>
      bucket.transactions.reduce((acc, tx) => acc + tx.amount, 0),
    );
    return {
      labels: buckets.map((bucket) => bucket.date.toLocaleDateString()),
      datasets: [
        {
          label: "Value",
          data,
        },
        { label: "Simple Moving Average", data: simpleMovingAverage(data) },
      ],
    };
  };

  const getTotalChangeData = () => {
    const buckets = getBuckets();
    const data = buckets
      .map((bucket) =>
        bucket.transactions.reduce((acc, tx) => acc + tx.amount, 0),
      )
      .map((v, i, a) => v - (a[i - 1] ?? v));

    return {
      labels: buckets.map((bucket) => bucket.date.toLocaleDateString()),
      datasets: [
        {
          label: "Value",
          data,
        },
        { label: "Simple Moving Average", data: simpleMovingAverage(data) },
      ],
    };
  };

  const getPercentChangeData = () => {
    const buckets = getBuckets();

    let data: number[] = [];
    let prev: undefined | number;

    for (const bucket of buckets) {
      const curr = bucket.transactions.reduce((acc, tx) => acc + tx.amount, 0);
      prev = prev ?? curr;
      data.push(((curr - prev) / prev) * 100);
      prev = curr;
    }

    return {
      labels: buckets.map((bucket) => bucket.date.toLocaleDateString()),
      datasets: [
        { label: "Value", data },
        { label: "Simple Moving Average", data: simpleMovingAverage(data) },
      ],
    };
  };

  function onSelectInterval(event: Targeted<HTMLSelectElement>): void {
    const { value } = event.currentTarget;
    if (isOf(value, intervals.concat())) setInterval(value);
  }

  function onSelectTag(event: Targeted<HTMLSelectElement>): void {
    setTags([...event.currentTarget.selectedOptions].map((o) => o.value));
  }

  function onTagAll(all: boolean): void {
    setTags(
      all ? (state?.getTags().map((tag) => tag.regexp.source) ?? []) : [],
    );
  }

  return (
    <article {...parent}>
      <h1>Data</h1>
      <aside>
        <fieldset>
          <label for="tags">Tags</label>
          <select id="tags" onChange={onSelectTag} multiple>
            <For each={state.getTags()}>
              {(tag) => (
                <option
                  value={tag.regexp.source}
                  selected={getTags().includes(tag.regexp.source)}
                >
                  {tag.value}
                </option>
              )}
            </For>
          </select>
          <div role="group">
            <button onClick={[onTagAll, true]}>All</button>
            <button onClick={[onTagAll, false]}>None</button>
          </div>
        </fieldset>
        <fieldset>
          <label for="interval">Interval</label>
          <select id="interval" onChange={onSelectInterval}>
            <For each={intervals}>
              {(interval) => (
                <option value={interval} selected={interval === getInterval()}>
                  {interval}
                </option>
              )}
            </For>
          </select>
        </fieldset>
      </aside>
      <nav>
        <ul>
          <li>
            <A href="/absolute-totals">Absolute Totals</A>
          </li>
          <li>
            <A href="/total-change">Total Change</A>
          </li>
          <li>
            <A href="/percent-change">Percent Change</A>
          </li>
        </ul>
      </nav>
      <section>
        <Switch>
          <Match when={getChartName() === "absolute-totals"}>
            <h2>Absolute Totals</h2>
            <Line data={getAbsoluteTotalData()} width={500} height={500} />
          </Match>
          <Match when={getChartName() === "total-change"}>
            <h2>Total Change</h2>
            <Line data={getTotalChangeData()} width={500} height={500} />
          </Match>
          <Match when={getChartName() === "percent-change"}>
            <h2>Percent Change</h2>
            <Line
              data={getPercentChangeData()}
              options={{
                scales: {
                  y: {
                    suggestedMin: -100,
                    suggestedMax: 100,
                  },
                },
              }}
              width={500}
              height={500}
            />
          </Match>
        </Switch>
      </section>
    </article>
  );
}

function Table(
  props: ExtendProps<"table", { getBuckets: Accessor<Bucket[]> }>,
) {
  const [local, parent] = splitProps(props, ["getBuckets"]);
  return (
    <table {...parent}>
      <thead>
        <tr>
          <th>Date</th>
          <th>Count</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <For each={local.getBuckets()}>
          {(bucket) => {
            const title = bucket.transactions
              .map((tx) => {
                const date = tx.date.toLocaleDateString();
                const amount = tx.amount.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2,
                });
                return `${date}\t${amount}\t${tx.description}`;
              })
              .join("\n");
            return (
              <tr title={title}>
                <td>
                  <HTMLDate value={bucket.date} />
                </td>
                <td>
                  <HTMLNumber value={bucket.transactions.length} />
                </td>
                <td>
                  <HTMLNumber
                    value={bucket.transactions.reduce(
                      (acc, tx) => acc + tx.amount,
                      0,
                    )}
                    highlight
                    money
                  />
                </td>
              </tr>
            );
          }}
        </For>
      </tbody>
    </table>
  );
}

function simpleMovingAverage(data: number[], smoothing: number = 3): number[] {
  return data.map(
    (_, i, a) =>
      Array(smoothing)
        .fill(a[0])
        .concat(a)
        .slice(i - smoothing + 1, i + 1)
        .reduce((acc, n) => acc + n, 0) / smoothing,
  );
}
