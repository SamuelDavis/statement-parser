import { A } from "@solidjs/router";
import { type ChartProps, Line } from "solid-chartjs";
import { createMemo, createSignal, For } from "solid-js";
import TransactionsSummary from "../Components/TransactionsSummary";
import TransactionsTable from "../Components/TransactionsTable";
import { derived, tags } from "../state";
import {
  assert,
  type GroupBy,
  groupBy,
  isValueOf,
  type Tag,
  type Targeted,
  type Transaction,
} from "../types";
import { persist, undefineFalsy } from "../utilities";

export default function App() {
  if (!undefineFalsy(derived.getTaggedTransactions()))
    return (
      <article>
        <p>
          No data available. Try <A href="/upload">uploading</A> some.
        </p>
      </article>
    );

  const [getGroupBy, setGroupBy] = persist(createSignal<GroupBy>(groupBy[1]), {
    key: "group-by",
    driver: "query",
  });
  const [getFilterByTags, setFilterByTags] = persist(
    createSignal<Tag["value"][]>([]),
    {
      key: "filter-by-tag",
      driver: "query",
    },
  );
  const getTransactionsFilteredBy = createMemo(() => {
    const filterByTags = getFilterByTags();
    const transactions = derived.getTaggedTransactions();
    return undefineFalsy(filterByTags)
      ? transactions.filter(
          (transaction) =>
            transaction.tags.some((tag) => filterByTags.includes(tag.value)) ||
            (transaction.tags.length === 0 &&
              filterByTags.includes("untagged")),
        )
      : transactions;
  });

  const getTransactionsGroupedBy = createMemo(() => {
    const groupBy = getGroupBy();
    const map = new Map<Date, Transaction[]>();
    for (const transaction of getTransactionsFilteredBy()) {
      const date = groupByTransform(groupBy, transaction.date);
      if (!map.has(date)) map.set(date, []);
      map.get(date)?.push(transaction);
    }
    return Array.from(map.entries())
      .map(([date, transactions]) => ({
        date,
        transactions,
      }))
      .reverse();
  });

  const getChartData = createMemo((): ChartProps["data"] => {
    const groups = getTransactionsGroupedBy();
    const totals = groups.map((group) =>
      sum(group.transactions.map((v) => v.amount)),
    );
    const absolute = totals.map((_, i, a) => sum(a.slice(0, i)));

    return {
      labels: groups.map((group) => group.date.toLocaleDateString()),
      datasets: [
        {
          label: "absolute",
          data: absolute,
          backgroundColor(ctx: any) {
            const current = absolute[ctx.index] ?? 0;
            const prev = absolute[ctx.index - 1] ?? current;
            return current >= prev ? "green" : "red";
          },
          segment: {
            borderColor(ctx: any) {
              const current = ctx.p0.y;
              const prev = ctx.p1.y;
              return current >= prev ? "green" : "red";
            },
          },
        },
        {
          label: "trend",
          data: trend(absolute),
          segment: {
            backgroundColor: "yellow",
            borderColor: "yellow",
          },
        },
      ],
    };
  });

  function onSubmit(event: Targeted<SubmitEvent>): void {
    event.preventDefault();
  }

  function onGroupBy(event: Targeted<InputEvent, HTMLSelectElement>): void {
    const { value } = event.currentTarget;
    assert(isValueOf, value, groupBy);
    setGroupBy(value);
  }

  function onFilterByTags(
    event: Targeted<InputEvent, HTMLSelectElement>,
  ): void {
    setFilterByTags(
      [...event.currentTarget.selectedOptions].map((option) => option.value),
    );
  }

  function onFilterByAllTags(): void {
    setFilterByTags(tags.getValues());
  }

  function onFilterByNoneTags(): void {
    setFilterByTags([]);
  }

  return (
    <article>
      <form onSubmit={onSubmit}>
        <label>
          <span>Group By</span>
          <select onInput={onGroupBy}>
            <For each={groupBy}>
              {(value) => (
                <option value={value} selected={getGroupBy() === value}>
                  {value}
                </option>
              )}
            </For>
          </select>
        </label>
        <fieldset>
          <label>
            <span>Filter By Tags</span>
            <select onInput={onFilterByTags} multiple>
              <option value="untagged">untagged</option>
              <For each={tags.getValues()}>
                {(value) => (
                  <option
                    value={value}
                    selected={getFilterByTags().includes(value)}
                  >
                    {value}
                  </option>
                )}
              </For>
            </select>
          </label>
          <button type="button" onClick={onFilterByAllTags}>
            All
          </button>
          <button type="button" onClick={onFilterByNoneTags}>
            None
          </button>
        </fieldset>
      </form>
      <details open>
        <summary>Graph</summary>
        <Line
          data={getChartData()}
          options={{
            responsive: true,
            maintainAspectratio: false,
          }}
        />
      </details>
      <details open>
        <summary>
          <TransactionsSummary transactions={getTransactionsFilteredBy()} />
        </summary>
        <TransactionsTable transactions={getTransactionsFilteredBy()} />
      </details>
    </article>
  );
}

function groupByTransform(groupBy: GroupBy, date: Date): Date {
  const ret = new Date(date);
  let day = date.getDate();
  if (groupBy === "month") day = 1;
  if (groupBy === "week") day = Math.floor(date.getDate() / 7) * 7 + 1;
  ret.setDate(day);
  return ret;
}

function trend(arr: number[], smooth = 3): number[] {
  return arr.map((_, i, a) =>
    sum(a.slice(Math.max(0, i - smooth), i + 1 + smooth)),
  );
}

function sum(array: number[]): number {
  return array.reduce((acc, n) => acc + n, 0) / array.length;
}
