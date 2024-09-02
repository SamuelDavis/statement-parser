import { ExtendProps, GroupBy, isHtml, isValue, Tag } from "../types.ts";
import { For, Show, splitProps } from "solid-js";
import statementsState from "../state/statementsState.ts";
import {
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  isAfter,
  isBefore,
  isSameDay,
} from "date-fns";
import { ChartConfiguration } from "chart.js/auto";
import tagsState from "../state/tagsState.ts";
import HtmlChart from "../html/HtmlChart.tsx";
import { createSignal } from "../utilities.tsx";

type Props = ExtendProps<"article", { tag?: Tag }>;

export default function TagSummary(props: Props) {
  const [local, parent] = splitProps(props, ["tag"]);
  const [getTag, setTag] = createSignal<undefined | Tag>(local.tag, {
    storageKey: "summary-tag:tag",
  });
  const [getGroupBy, setGroupBy] = createSignal(GroupBy.Week, {
    storageKey: "summary-tag:group-by",
  });
  const getGroupByOptions = (): GroupBy[] => Object.values(GroupBy);
  const getRegexp = () => {
    const tag = getTag();
    return tag ? new RegExp(tag.text, "gi") : undefined;
  };
  const getTransactions = () => {
    const regexp = getRegexp();
    return regexp
      ? statementsState
          .getTransactions()
          .filter((transaction) => regexp.test(transaction.description))
      : [];
  };
  const getIntervalCallback = () => {
    switch (getGroupBy()) {
      case GroupBy.Day:
        return eachDayOfInterval;
      case GroupBy.Week:
        return eachWeekOfInterval;
      case GroupBy.Month:
        return eachMonthOfInterval;
    }
  };
  const getDateRange = (): Date[] => {
    const transactions = statementsState.getTransactions();
    if (transactions.length === 0) return [];
    const intervalCallback = getIntervalCallback();
    const start = transactions[0].date;
    const end = transactions.slice(-1)[0].date;
    return intervalCallback({ start, end });
  };
  const getConfig = (): undefined | ChartConfiguration<"line"> => {
    const tag = getTag();
    const dateRange = getDateRange();
    const transactions = getTransactions();
    const data = dateRange.map((date, index, array) => {
      const next = array[index + 1];
      return transactions
        .filter((transaction) => {
          if (isBefore(transaction.date, date)) return false;
          if (next)
            if (
              isSameDay(transaction.date, next) ||
              isAfter(transaction.date, next)
            )
              return false;
          return true;
        })
        .reduce((s, t) => s + t.amount, 0);
    });

    if (tag && dateRange && transactions)
      return {
        type: "line",
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
        data: {
          labels: dateRange.map((date) => date.toLocaleDateString()),
          datasets: [
            {
              label: tag.label,
              data,
              fill: {
                target: "origin",
                above: "lightgreen",
                below: "pink",
              },
            },
          ],
        },
      };
    return undefined;
  };

  function onLabelInput(e: Event) {
    const select = e.target;
    if (!isHtml("select", select)) throw new TypeError();
    const { value } = select;
    setTag(value ? tagsState.getTagByLabel(value) : undefined);
  }

  function onGroupingInput(e: Event) {
    const select = e.target;
    if (!isHtml("select", select)) throw new TypeError();
    const { value } = select;
    if (!isValue(GroupBy, value)) throw new TypeError();
    setGroupBy(value);
  }

  return (
    <article {...parent}>
      <header>
        <h1>Tags</h1>
        <fieldset>
          <label for="label">Label</label>
          <select name="label" id="label" onInput={onLabelInput}>
            <option />
            <For each={tagsState.getLabels()}>
              {(label) => (
                <option value={label} selected={label === getTag()?.label}>
                  {label}
                </option>
              )}
            </For>
          </select>
        </fieldset>
        <fieldset>
          <label for="grouping">Group By</label>
          <select name="grouping" id="grouping" onInput={onGroupingInput}>
            <For each={getGroupByOptions()}>
              {(option) => (
                <option value={option} selected={option === getGroupBy()}>
                  {option}
                </option>
              )}
            </For>
          </select>
        </fieldset>
      </header>
      <Show when={getConfig()}>
        {(getConfig) => <HtmlChart config={getConfig()} />}
      </Show>
    </article>
  );
}
