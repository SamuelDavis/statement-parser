import { For } from "solid-js";
import { statements } from "./state.ts";
import { ExtendPropsChildless } from "./types.ts";

type Props = ExtendPropsChildless<"table">;

export function UploadTable(props: Props) {
  return (
    <table {...props}>
      <thead>
        <tr>
          <th>Name</th>
          <th>Date</th>
          <th>Rows</th>
        </tr>
      </thead>
      <tbody>
        <For
          each={statements.getStatements()}
          fallback={<td colspan={3}>No statements uploaded...</td>}
        >
          {(statement) => (
            <tr>
              <td>{statement.name}</td>
              <td>{statement.date.toLocaleDateString()}</td>
              <td>{statement.rows.length.toLocaleString()}</td>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  );
}
