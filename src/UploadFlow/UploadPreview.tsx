import { ExtendProps, normalHeaders, NormalRow } from "../types.ts";
import { For, mergeProps, splitProps } from "solid-js";

type Props = ExtendProps<
  "table",
  {
    rows: NormalRow[];
    maxRows?: number;
  }
>;
export default function UploadPreview(props: Props) {
  const defaulted = mergeProps(props, { maxRows: 5 });
  const [local, parent] = splitProps(defaulted, ["rows", "maxRows"]);

  return (
    <table {...parent}>
      <thead>
        <tr>
          <For each={normalHeaders}>{(normal) => <th>{normal}</th>}</For>
        </tr>
      </thead>
      <tbody>
        <For each={local.rows.slice(0, local.maxRows)}>
          {(row) => (
            <tr>
              <For each={normalHeaders}>
                {(normal) => {
                  switch (normal) {
                    case "date":
                      return <td>{row[normal].toLocaleDateString()}</td>;
                    default:
                      return <td>{row[normal]}</td>;
                  }
                }}
              </For>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  );
}
