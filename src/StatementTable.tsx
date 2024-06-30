import { For, splitProps } from "solid-js";
import { ExtendProps, NormalRow } from "./types.ts";

type Props = ExtendProps<
  "table",
  {
    rows: NormalRow[];
  }
>;

export function StatementTable(props: Props) {
  const [local, parent] = splitProps(props, ["rows"]);
  return (
    <table {...parent}>
      <thead>
        <tr>
          <th colspan={2} />
          <th>
            <output>Count: {local.rows.length}</output>
          </th>
        </tr>
        <tr>
          <th>date</th>
          <th>description</th>
          <th>amount</th>
        </tr>
      </thead>
      <tbody>
        <For each={local.rows}>
          {(row) => (
            <tr>
              <td>{row.date.toLocaleDateString()}</td>
              <td>{row.description.toString()}</td>
              <td>${row.amount.toFixed(2)}</td>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  );
}
