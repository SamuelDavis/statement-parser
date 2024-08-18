import { For, splitProps } from "solid-js";
import { ExtendPropsChildless, NormalHeader, Statement } from "./types.ts";
import Amount from "./Amount.tsx";

type Props = ExtendPropsChildless<
  "table",
  {
    regex?: RegExp;
    rows: Statement["rows"];
  }
>;

export default function StatementTable(props: Props) {
  const [local, parent] = splitProps(props, ["regex", "rows"]);
  const getEarliestDate = () =>
    local.rows.reduce((acc, row) => {
      return acc.getTime() < row[NormalHeader.Date].getTime()
        ? acc
        : row[NormalHeader.Date];
    }, new Date());
  const getLatestDate = () =>
    local.rows.reduce((acc, row) => {
      return acc.getTime() < row[NormalHeader.Date].getTime()
        ? row[NormalHeader.Date]
        : acc;
    }, new Date());
  const getSumTotal = () => {
    return local.rows.reduce((acc, row) => acc + row[NormalHeader.Amount], 0);
  };
  return (
    <table {...parent}>
      <thead>
        <tr>
          <td>Date Range</td>
          <td>Total Records</td>
          <td>Sum Total</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <span>{getEarliestDate().toLocaleDateString()}</span>
            <span>-</span>
            <span>{getLatestDate().toLocaleDateString()}</span>
          </td>
          <td>{local.rows.length}</td>
          <td>
            <Amount value={getSumTotal()} />
          </td>
        </tr>
      </tbody>
      <thead>
        <tr>
          <th>{NormalHeader.Date}</th>
          <th>{NormalHeader.Description}</th>
          <th>{NormalHeader.Amount}</th>
        </tr>
      </thead>
      <tbody>
        <For each={local.rows}>
          {(row) => (
            <tr>
              <td>{row[NormalHeader.Date].toLocaleDateString()}</td>
              <td>{row[NormalHeader.Description]}</td>
              <td>${row[NormalHeader.Amount].toFixed(2)}</td>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  );
}
