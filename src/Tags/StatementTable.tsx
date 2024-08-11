import { For, splitProps } from "solid-js";
import { statements } from "../state.ts";
import { ExtendPropsChildless } from "../types.ts";
import { parseRegex } from "../utils.ts";

type Props = ExtendPropsChildless<
  "table",
  {
    regex?: RegExp;
  }
>;

export default function StatementTable(props: Props) {
  const [local, parent] = splitProps(props, ["regex"]);
  return (
    <table {...parent}>
      <thead>
        <tr>
          <th colspan={2} />
          <th>
            <output>Count: {statements.getStatementRows().length}</output>
          </th>
        </tr>
        <tr>
          <th>date</th>
          <th>description</th>
          <th>amount</th>
        </tr>
      </thead>
      <tbody>
        <For each={statements.getStatementRows()}>
          {(row) => (
            <tr>
              <td>{row.Date.toLocaleDateString()}</td>
              <td>
                {local.regex
                  ? parseRegex(local.regex, row.Description).map((chunk) => (
                      <span style="background-color: rgba(255, 255, 0, 0.2);">
                        {chunk.value}
                      </span>
                    ))
                  : row.Description}
              </td>
              <td>${row.Amount.toFixed(2)}</td>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  );
}
