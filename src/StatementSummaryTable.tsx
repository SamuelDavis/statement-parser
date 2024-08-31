import { For } from "solid-js";
import Date from "./Date.tsx";
import Amount from "./Amount.tsx";
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
                <Date value={summary.date} />
              </td>
              <td>
                <Date value={summary.from} />
              </td>
              <td>
                <Date value={summary.to} />
              </td>
              <td>{summary.transactionCount}</td>
              <td>
                <Amount value={summary.total} />
              </td>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  );
}
