import { For, Show, splitProps } from "solid-js";
import { ExtendProps, includes, isHtml, Tag, Transaction } from "./types.ts";
import tagsState from "./state/tagsState.ts";
import statementsState from "./state/statementsState.ts";
import HtmlDate from "./Date.tsx";
import { createSignal } from "./utilities.tsx";
import LineChart from "./LineChart.tsx";
import { ChartConfiguration } from "chart.js/auto";
import Amount from "./Amount.tsx";

export default function TagDetails() {
  const [getTag, setTag] = createSignal<undefined | Tag>(undefined, {
    storageKey: "details-tag",
  });

  function onInput(e: Event) {
    const select = e.target;
    if (!isHtml("select", select)) throw new TypeError();
    const { value } = select;
    setTag(tagsState.getTagByLabel(value));
  }

  return (
    <article>
      <form>
        <fieldset>
          <label for="tag">Tag</label>
          <select name="tag" id="tag" onInput={onInput}>
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
      </form>
      <Show when={getTag()}>{(getTag) => <TagArticle tag={getTag()} />}</Show>
    </article>
  );
}

type Props = ExtendProps<"article", { tag: Tag }>;

enum GroupBy {
  Day = "day",
  Week = "week",
  Month = "month",
}

function setDateToFirst(date: Date): Date {
  date = new Date(date);
  date.setDate(1);
  return date;
}

function TagArticle(props: Props) {
  const [local, parent] = splitProps(props, ["tag"]);
  const getGroupByOptions = () => Object.values(GroupBy);
  const [getGroupBy, setGroupBy] = createSignal(GroupBy.Day, {
    storageKey: "tag-group-by",
  });
  const getTexts = () => local.tag.text.split("|");
  const getRegexp = () => new RegExp(local.tag.text, "gi");
  const getTransactions = () =>
    statementsState
      .getTransactions()
      .filter((transaction) => getRegexp().test(transaction.description))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  const getMinDate = () => getTransactions().slice(0, 1)[0].date;
  const getMaxDate = () => getTransactions().slice(-1)[0].date;
  const getDateRange = () => {
    const groupBy = getGroupBy();
    const minDate = setDateToFirst(getMinDate());
    const maxDate = setDateToFirst(getMaxDate());
    maxDate.setMonth(maxDate.getMonth() + 1);
    let dates: Date[] = [];
    for (let i = new Date(minDate); i <= maxDate; ) {
      dates.push(new Date(i));
      switch (groupBy) {
        case GroupBy.Day:
          i.setDate(i.getDate() + 1);
          break;
        case GroupBy.Week:
          i.setDate(i.getDate() + 7);
          break;
        case GroupBy.Month:
          i.setMonth(i.getMonth() + 1);
          break;
      }
    }
    return dates;
  };
  const getNextDate = (date: Date): undefined | Date => {
    const dates = getDateRange();
    const index = dates.findIndex(
      (d) => d.toDateString() === date.toDateString(),
    );
    return dates[index + 1];
  };
  const getTransactionsByDate = (from: Date): Transaction[] => {
    const transactions = getTransactions();
    const to = getNextDate(from);
    return transactions.filter(
      (transaction) => transaction.date >= from && to && transaction.date < to,
    );
  };

  const getLabels = () => getDateRange().map((date) => date.toDateString());
  const getData = () =>
    getDateRange().map(
      (date) => -getTransactionsByDate(date).reduce((s, t) => s + t.amount, 0),
    );
  const getTotal = () => getTransactions().reduce((s, t) => s + t.amount, 0);
  const getPerDateAverage = () => getTotal() / getDateRange().length;
  const getPerTransactionAverage = () => getTotal() / getTransactions().length;
  const getConfig = (): ChartConfiguration => ({
    type: "line",
    options: {},
    data: {
      labels: getLabels(),
      datasets: [
        {
          label: local.tag.label,
          data: getData(),
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.3,
        },
      ],
    },
  });

  return (
    <article {...parent}>
      <h1>{local.tag.label}</h1>
      <h3 role="group">
        <output>
          From: <HtmlDate value={getMinDate()} />
        </output>
        <output>
          To: <HtmlDate value={getMaxDate()} />
        </output>
      </h3>
      <h3 role="group">
        <output>
          Total: <Amount value={getTotal()} />
        </output>
        <output>
          Per Transaction: <Amount value={getPerTransactionAverage()} />
        </output>
        <output>
          Per Date: <Amount value={getPerDateAverage()} />
        </output>
      </h3>
      <ul role="group">
        <For each={getTexts()}>{(text) => <li>{text}</li>}</For>
      </ul>
      <fieldset>
        <label for="group_by">Group By</label>
        <select
          name="group_by"
          id="group_by"
          onInput={(e) =>
            includes(getGroupByOptions(), e.target.value) &&
            setGroupBy(e.target.value)
          }
        >
          <For each={getGroupByOptions()}>
            {(option) => (
              <option value={option} selected={option === getGroupBy()}>
                {option}
              </option>
            )}
          </For>
        </select>
      </fieldset>
      <LineChart config={getConfig()} />
      <ul>
        <For each={getDateRange()}>
          {(date) => {
            const transactions = getTransactionsByDate(date);
            return transactions.length === 0 ? undefined : (
              <li>
                <output>{transactions.length}</output>
                <span> - </span>
                <HtmlDate value={date} />
              </li>
            );
          }}
        </For>
      </ul>
    </article>
  );
}
