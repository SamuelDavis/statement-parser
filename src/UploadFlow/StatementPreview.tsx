import {
  ExtendProps,
  NormalHeader,
  normalHeaders,
  Statement,
} from "../types.ts";
import { For, mergeProps, Show, splitProps } from "solid-js";

type Props = ExtendProps<
  "table",
  { previewLength?: number; statement: Statement }
>;
export default function StatementPreview(props: Props) {
  const defaultProps = mergeProps({ previewLength: 3 }, props);
  const [local, parent] = splitProps(defaultProps, [
    "previewLength",
    "statement",
  ]);
  const getPreviewRows = () =>
    local.statement.rows.slice(0, local.previewLength);
  const getRemainingRowCount = () =>
    Math.max(0, local.statement.rows.length - local.previewLength);
  const getHasMoreRows = () => getRemainingRowCount() > 0;

  return (
    <table {...parent}>
      <thead>
        <tr>
          <For each={normalHeaders}>{(normal) => <th>{normal}</th>}</For>
        </tr>
      </thead>
      <tbody>
        <For each={getPreviewRows()}>
          {(row) => (
            <tr>
              <For each={normalHeaders}>
                {(normal) => {
                  switch (normal) {
                    case NormalHeader.Date:
                      return <td>{row[normal].toLocaleDateString()}</td>;
                    default:
                      return <td>{row[normal].toString()}</td>;
                  }
                }}
              </For>
            </tr>
          )}
        </For>
        <Show when={getHasMoreRows()}>
          <tr>
            <td colspan={normalHeaders.length}>
              {getRemainingRowCount()} more rows...
            </td>
          </tr>
        </Show>
      </tbody>
    </table>
  );
}
