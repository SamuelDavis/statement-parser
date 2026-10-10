import { createMemo, For, Show } from "solid-js";
import { A } from "@solidjs/router";
import {
  assert,
  isNumber,
  isOf,
  preventDefault,
  type Targeted,
} from "@samueldavis/solidlib";
import { useAppState } from "../state/AppState";
import {
  bestFit,
  bucket,
  filterByTags,
  mean,
  movingAverage,
  sum,
} from "../utils/analysis";
import { formatPeriod } from "../utils/format";
import {
  createSearchParam,
  oneOfCodec,
  positiveIntegerCodec,
  stringsCodec,
} from "../state/searchParams";
import { periods, untagged } from "../types";
import Money from "../Components/Money";
import PeriodTable from "../Components/PeriodTable";
import TagSelect from "../Components/TagSelect";
import TransactionsSummary from "../Components/TransactionsSummary";
import TransactionsTable from "../Components/TransactionsTable";
import TrendChart from "../Components/TrendChart";

export default function Insights() {
  const app = useAppState();
  const [getIncluded, setIncluded] = createSearchParam(
    "include",
    [],
    stringsCodec,
  );
  const [getExcluded, setExcluded] = createSearchParam(
    "exclude",
    [],
    stringsCodec,
  );
  const [getPeriod, setPeriod] = createSearchParam(
    "period",
    "month",
    oneOfCodec(periods),
  );
  const [getWindow, setWindow] = createSearchParam(
    "window",
    3,
    positiveIntegerCodec,
  );

  const getTransactions = createMemo(() =>
    filterByTags(app.getTaggedTransactions(), getIncluded(), getExcluded()),
  );
  const getTagOptions = () => [untagged, ...app.getTagLabels()];
  const getTotals = createMemo(() => bucket(getTransactions(), getPeriod()));
  const getValues = () => getTotals().map((total) => total.total);
  const getFit = createMemo(() => bestFit(getValues()));
  const getAverage = () => movingAverage(getValues(), getWindow());
  const getLabels = () =>
    getTotals().map((total) => formatPeriod(total.start, getPeriod()));
  const getTotal = () =>
    sum(getTransactions().map((transaction) => transaction.amount));

  function onPeriod(event: Targeted<HTMLSelectElement>): void {
    const { value } = event.currentTarget;
    assert(isOf, value, periods);
    setPeriod(value);
  }

  function onWindow(event: Targeted<HTMLInputElement>): void {
    const { valueAsNumber } = event.currentTarget;
    if (isNumber(valueAsNumber) && valueAsNumber >= 1)
      setWindow(Math.floor(valueAsNumber));
  }

  return (
    <Show
      when={app.getTaggedTransactions().length > 0}
      fallback={
        <article>
          <p>
            No transactions yet. <A href="/import">Import</A> a statement.
          </p>
        </article>
      }
    >
      <article>
        <header>
          <h1>Insights</h1>
        </header>
        <form onSubmit={preventDefault}>
          <div data-grid>
            <label>
              Group by
              <select onInput={onPeriod}>
                <For each={periods}>
                  {(period) => (
                    <option value={period} selected={getPeriod() === period}>
                      {period}
                    </option>
                  )}
                </For>
              </select>
            </label>
            <label>
              Moving average ({getPeriod()}s)
              <input
                type="number"
                min="1"
                step="1"
                value={getWindow()}
                onInput={onWindow}
              />
            </label>
          </div>
          <div data-grid>
            <TagSelect
              label="Include tags"
              options={getTagOptions()}
              selected={getIncluded()}
              onChange={setIncluded}
            />
            <TagSelect
              label="Exclude tags"
              options={getTagOptions()}
              selected={getExcluded()}
              onChange={setExcluded}
            />
          </div>
        </form>
        <p>
          Total <Money value={getTotal()} /> · avg{" "}
          <Money value={mean(getValues())} />/{getPeriod()} · trend{" "}
          <Money value={getFit().slope} />/{getPeriod()}
        </p>
        <TrendChart
          labels={getLabels()}
          totals={getValues()}
          average={getAverage()}
          fit={getFit().points}
        />
        <PeriodTable totals={getTotals()} period={getPeriod()} />
        <details>
          <summary>
            <TransactionsSummary transactions={getTransactions()} />
          </summary>
          <TransactionsTable transactions={getTransactions()} />
        </details>
      </article>
    </Show>
  );
}
