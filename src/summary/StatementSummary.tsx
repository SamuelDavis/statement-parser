import { ExtendProps, Statement, Transaction } from "../types.ts";
import { createMemo, For, splitProps } from "solid-js";
import {
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
} from "date-fns";
import HtmlLabel from "../html/HtmlLabel.tsx";
import HtmlDate from "../html/HtmlDate.tsx";
import HtmlAmount from "../html/HtmlAmount.tsx";
import HtmlFlexGroup from "../html/HtmlFlexGroup.tsx";

type Props = ExtendProps<"article", { statement: Statement }>;

export default function StatementSummary(props: Props) {
  const [local, parent] = splitProps(props, ["statement"]);
  const getMinDate = () => local.statement.transactions[0].date;
  const getMaxDate = () => local.statement.transactions.slice(-1)[0].date;
  const getSumTotal = () =>
    local.statement.transactions.reduce((s, t) => s + t.amount, 0);
  const getAverages = createMemo(() => {
    const sumTotal = getSumTotal();
    const minDate = getMinDate();
    const maxDate = getMaxDate();
    const numDays = differenceInCalendarDays(minDate, maxDate);
    const numWeeks = differenceInCalendarWeeks(minDate, maxDate);
    const numMonths = differenceInCalendarMonths(minDate, maxDate);
    const perTransaction = sumTotal / local.statement.transactions.length;
    const perDay = sumTotal / numDays;
    const perWeek = sumTotal / numWeeks;
    const perMonth = sumTotal / numMonths;
    return { perTransaction, perDay, perMonth, perWeek };
  });
  const getExtremeTransactions = createMemo(() => {
    let max: Transaction[] = [];
    let min: Transaction[] = [];
    for (const transaction of local.statement.transactions) {
      if (max.length === 0) max = [transaction];
      else if (max.some((max) => max.amount < transaction.amount))
        max = [transaction];
      else if (max.every((max) => max.amount === transaction.amount))
        max.push(transaction);
      if (min.length === 0) min = [transaction];
      else if (min.some((min) => min.amount > transaction.amount))
        min = [transaction];
      else if (min.every((min) => min.amount === transaction.amount))
        min.push(transaction);
    }
    return { max, min };
  });

  return (
    <article {...parent}>
      <HtmlFlexGroup>
        <section>
          <h5>Details</h5>
          <dl>
            <dt>Name</dt>
            <dd>{local.statement.name}</dd>
            <dt>Date...</dt>
            <dd>
              <HtmlLabel value="Created">
                <HtmlDate value={local.statement.date} />
              </HtmlLabel>
            </dd>
            <dd>
              <HtmlLabel value="From">
                <HtmlDate value={getMinDate()} />
              </HtmlLabel>
            </dd>
            <dd>
              <HtmlLabel value="To">
                <HtmlDate value={getMaxDate()} />
              </HtmlLabel>
            </dd>
            <dt>Total Transactions</dt>
            <dd>{local.statement.transactions.length}</dd>
          </dl>
        </section>
        <section>
          <h5>Finances</h5>
          <dl>
            <dt>Sum Total</dt>
            <dd>
              <HtmlAmount value={getSumTotal()} />
            </dd>
            <dt>Average per...</dt>
            <dl>
              <dd>
                <HtmlLabel value="Transaction">
                  <HtmlAmount value={getAverages().perTransaction} />
                </HtmlLabel>
              </dd>
              <dd>
                <HtmlLabel value="Day">
                  <HtmlAmount value={getAverages().perDay} />
                </HtmlLabel>
              </dd>
              <dd>
                <HtmlLabel value="Week">
                  <HtmlAmount value={getAverages().perWeek} />
                </HtmlLabel>
              </dd>
              <dd>
                <HtmlLabel value="Month">
                  <HtmlAmount value={getAverages().perMonth} />
                </HtmlLabel>
              </dd>
            </dl>
            <dt>Highest Transaction(s)</dt>
            <For each={getExtremeTransactions().max}>
              {(transaction) => (
                <dd>
                  <HtmlAmount value={transaction.amount} />
                </dd>
              )}
            </For>
            <dt>Lowest Transaction(s)</dt>
            <For each={getExtremeTransactions().min}>
              {(transaction) => (
                <dd>
                  <HtmlAmount value={transaction.amount} />
                </dd>
              )}
            </For>
          </dl>
        </section>
      </HtmlFlexGroup>
    </article>
  );
}
