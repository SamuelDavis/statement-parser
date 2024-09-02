import { For } from "solid-js";
import HtmlDate from "./html/HtmlDate.tsx";
import HtmlAmount from "./html/HtmlAmount.tsx";
import { ExtendProps } from "./types.ts";
import statementsState from "./state/statementsState.ts";

type Props = ExtendProps<"table", {}, "children">;
export default function StatementSummaryTable(props: Props) {
  return (
    <table {...props}>
      <thead>
        <tr>
          <th>Name</th>
          <th>Created</th>
          <th>From</th>
          <th>To</th>
          <th># Transactions</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <For each={statementsState.getStatementSummaries()}>
          {(summary) => (
            <tr>
              <td>{summary.name}</td>
              <td>
                <HtmlDate value={summary.date} />
              </td>
              <td>
                <HtmlDate value={summary.from} />
              </td>
              <td>
                <HtmlDate value={summary.to} />
              </td>
              <td>{summary.transactionCount}</td>
              <td>
                <HtmlAmount value={summary.total} />
              </td>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  );
}
