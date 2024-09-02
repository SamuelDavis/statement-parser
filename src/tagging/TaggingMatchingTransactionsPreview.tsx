import { ExtendProps, SegmentedTransaction } from "../types.ts";
import { For, splitProps } from "solid-js";
import statementsState from "../state/statementsState.ts";
import { parseTextIntoSegments } from "../utilities.tsx";
import { TransactionSummary } from "../summary/TransactionSummary.tsx";
import HtmlTextSegment from "../html/HtmlTextSegment.tsx";

type Props = ExtendProps<"details", { regexp: RegExp }>;
export default function TaggingMatchingTransactionsPreview(props: Props) {
  const [local, parent] = splitProps(props, ["regexp"]);
  const getMatchingSegmentedTransactions = (): SegmentedTransaction[] =>
    statementsState
      .getTransactions()
      .filter((transaction) => local.regexp.test(transaction.description))
      .map((transaction) => ({
        ...transaction,
        segments: parseTextIntoSegments(local.regexp, transaction.description),
      }));
  return (
    <details {...parent}>
      <summary>Matching Transactions</summary>
      <For each={getMatchingSegmentedTransactions()}>
        {(transaction) => (
          <TransactionSummary transaction={transaction}>
            <For each={transaction.segments}>
              {(segment) => <HtmlTextSegment value={segment} />}
            </For>
          </TransactionSummary>
        )}
      </For>
    </details>
  );
}
