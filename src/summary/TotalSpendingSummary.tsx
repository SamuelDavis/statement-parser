import statementsState from "../state/statementsState.ts";
import { eachWeekOfInterval, isAfter, isBefore, isSameDay } from "date-fns";
import { ChartConfiguration } from "chart.js/auto";
import tagsState from "../state/tagsState.ts";
import HtmlChart from "../html/HtmlChart.tsx";
import { ExtendProps } from "../types.ts";
import { textToRegexp } from "../utilities.tsx";

type Props = ExtendProps<"article">;
export default function TotalSpendingSummary(props: Props) {
  const getDateRange = (): Date[] => {
    const transactions = statementsState.getTransactions();
    if (transactions.length === 0) return [];
    const start = transactions[0].date;
    const end = transactions.slice(-1)[0].date;
    return eachWeekOfInterval({ start, end });
  };
  const getConfig = (): ChartConfiguration<"line"> => {
    const transactions = statementsState.getTransactions();
    const dateRange = getDateRange();
    const labels = tagsState.getLabels();
    return {
      type: "line",
      options: { scales: { y: { beginAtZero: true } } },
      data: {
        labels: dateRange.map((date) => date.toLocaleDateString()),
        datasets: labels.map((label) => {
          const tag = tagsState.getTagByLabel(label);
          const data = dateRange.map((date, index, array) => {
            const next = array[index + 1];
            return transactions
              .filter((transaction) => {
                if (!tag) return false;
                if (!textToRegexp(tag.text).test(transaction.description))
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
          return {
            label,
            data,
            fill: { target: "origin", above: "lightgreen", below: "pink" },
          };
        }),
      },
    };
  };
  return (
    <article {...props}>
      <h1>Total Spending by Week</h1>
      <HtmlChart config={getConfig()} />
    </article>
  );
}
