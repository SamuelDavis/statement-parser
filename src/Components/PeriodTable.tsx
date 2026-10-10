import { For } from "solid-js";
import { HTMLNumber } from "@samueldavis/solidlib";
import { formatPeriod } from "../utils/format";
import type { Period, PeriodTotal } from "../types";
import Money from "./Money";

type Props = {
  totals: PeriodTotal[];
  period: Period;
};

export default function PeriodTable(props: Props) {
  const getRows = () => [...props.totals].reverse();

  return (
    <figure>
      <table>
        <thead>
          <tr>
            <th>Period</th>
            <th>Total</th>
            <th>Change</th>
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          <For each={getRows()}>
            {(row) => (
              <tr>
                <td>{formatPeriod(row.start, props.period)}</td>
                <td>
                  <Money value={row.total} />
                </td>
                <td>
                  <Money value={row.delta} />
                </td>
                <td>
                  <HTMLNumber
                    value={row.percent}
                    precision={1}
                    highlight
                    options={{ style: "percent" }}
                  />
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </figure>
  );
}
