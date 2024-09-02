import { For, splitProps } from "solid-js";
import { ExtendProps, normalHeaders, Transaction } from "../types.ts";
import HtmlDate from "../html/HtmlDate.tsx";
import HtmlAmount from "../html/HtmlAmount.tsx";

type Props = ExtendProps<
  "details",
  { transactions: Transaction[] },
  "children"
>;
export default function UploadTransactionPreview(props: Props) {
  const [local, parent] = splitProps(props, ["transactions"]);
  return (
    <details {...parent}>
      <summary>Sample Results</summary>
      <p>Does this look right?</p>
      <table>
        <thead>
          <tr>
            <For each={normalHeaders}>{(normal) => <th>{normal}</th>}</For>
          </tr>
        </thead>
        <tbody>
          <For each={local.transactions}>
            {(row) => (
              <tr>
                <For each={normalHeaders}>
                  {(normal) => {
                    switch (normal) {
                      case "date":
                        return (
                          <td>
                            <HtmlDate value={row[normal]} />
                          </td>
                        );
                      case "description":
                        return <td>{row[normal]}</td>;
                      case "amount":
                        return (
                          <td>
                            <HtmlAmount value={row[normal]} />
                          </td>
                        );
                    }
                  }}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </details>
  );
}
