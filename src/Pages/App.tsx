import { type ChartProps, Line } from "solid-chartjs";
import { createMemo, createSignal, For } from "solid-js";
import TransactionsTable from "../Components/TransactionsTable";
import { derived, tags } from "../state";
import {
  assert,
  Flags,
  type GroupBy,
  groupBy,
  isValueOf,
  type Tag,
  type Targeted,
} from "../types";
import { persist } from "../utilities";

export default function App() {
  const [getGroupBy, setGroupBy] = persist(createSignal<GroupBy>("week"), {
    key: "group-by",
    driver: "query",
  });
  const [getFilterByTag, setFilterByTag] = persist(
    createSignal<Tag["regexp"]["source"]>(""),
    { key: "filter-by", driver: "query" },
  );

  const getRegexp = () => {
    const source = getFilterByTag();
    return source === "" ? undefined : new RegExp(source, Flags);
  };

  const getTransactionsFilteredByTag = createMemo(() => {
    const transactions = derived.getTransactions().map((transaction) => ({
      ...transaction,
      tags: tags.matching(transaction),
    }));
    const regexp = getRegexp();
    return regexp === undefined
      ? transactions
      : transactions.filter((tx) => tx.description.match(regexp));
  });

  const getTransactionsGroupedBy = createMemo(() => {
    type Acc = Record<string, ReturnType<typeof getTransactionsFilteredByTag>>;
    const groupBy = getGroupBy();
    return getTransactionsFilteredByTag().reduce<Acc>((acc, transaction) => {
      const key = groupByTransform(groupBy, transaction.date).toISOString();
      acc[key] = acc[key] ?? [];
      acc[key].push(transaction);
      return acc;
    }, {});
  });

  const getTableData = createMemo(() => {
    let last = 0;
    return Object.entries(getTransactionsGroupedBy())
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([timestamp, transactions]) => {
        const groupBy = new Date(timestamp);
        const total = transactions
          .filter((transaction) => {
            return transaction.tags.length === 0
              ? true
              : transaction.tags.some((tag) => !tag.ignore);
          })
          .reduce((acc, transaction) => acc + transaction.amount, 0);
        const change = total - last;
        last = total;
        return {
          groupBy,
          total,
          change,
          transactions,
        };
      })
      .reverse();
  });

  const getChartData = (): ChartProps["data"] => {
    const transactions = getTableData()
      .map((v) => ({
        ...v,
        label: v.groupBy.toDateString(),
      }))
      .reverse();
    return {
      labels: transactions.map((t) => t.label),
      datasets: [
        {
          label: "total",
          data: transactions.map((v) => v.total),
          backgroundColor(ctx: any) {
            const current = transactions[ctx.index]?.total ?? 0;
            const prev = transactions[ctx.index - 1]?.total ?? current;
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
          label: "average",
          data: transactions.map((v, i, a) => {
            const current = v;
            const prev = a[i - 1] ?? current;
            return (current.total + prev.total) / 5;
          }),
          segment: {
            backgroundColor: "yellow",
            borderColor: "yellow",
          },
        },
      ],
    };
  };

  function groupByTransform(groupBy: GroupBy, date: Date): Date {
    const ret = new Date(date);
    let day = date.getDate();
    if (groupBy === "month") day = 1;
    if (groupBy === "week") day = Math.floor(date.getDate() / 7) * 7 + 1;
    ret.setDate(day);
    return ret;
  }

  function onSubmit(event: Targeted<SubmitEvent>) {
    event.preventDefault();
  }

  function onGroupBy(event: Targeted<InputEvent, HTMLSelectElement>): void {
    const value = event.currentTarget.value;
    assert(isValueOf, value, groupBy);
    setGroupBy(value);
  }

  function onFilterByTag(event: Targeted<InputEvent, HTMLSelectElement>): void {
    const value = event.currentTarget.value;
    setFilterByTag(value);
  }

  return (
    <article>
      <form onSubmit={onSubmit}>
        <div>
          <label for="group-by">Group By</label>
          <select name="group-by" id="group-by" onInput={onGroupBy}>
            <For each={groupBy}>
              {(value) => <option value={value}>{value}</option>}
            </For>
          </select>
        </div>
        <div>
          <label for="filter-by-tag">Filter By Tag</label>
          <select
            name="filter-by-tag"
            id="filter-by-tag"
            onInput={onFilterByTag}
          >
            <option value="">None</option>
            <For each={tags.get()}>
              {(tag) => <option value={tag.regexp.source}>{tag.value}</option>}
            </For>
          </select>
        </div>
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
      <details>
        <summary>Table</summary>
        <TransactionsTable
          transactions={getTableData().flatMap((value) => value.transactions)}
        />
      </details>
      <details>
        <summary>List</summary>
        <For each={getTableData()}>
          {(value) => <TransactionsTable transactions={value.transactions} />}
        </For>
      </details>
    </article>
  );
}
