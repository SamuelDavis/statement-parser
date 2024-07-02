import { For, splitProps } from "solid-js";
import { ExtendProps, NormalRow } from "./types.ts";
import styles from "./index.module.css";

type Props = ExtendProps<
  "table",
  {
    rows: NormalRow[];
    regex?: RegExp;
  }
>;

export function StatementTable(props: Props) {
  const [local, parent] = splitProps(props, ["rows", "regex"]);
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
              <td>
                {local.regex
                  ? parseRegex(local.regex, row.description).map((chunk) => (
                      <span classList={{ [styles.Match]: chunk.match }}>
                        {chunk.value}
                      </span>
                    ))
                  : row.description}
              </td>
              <td>${row.amount.toFixed(2)}</td>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  );
}

type Match = {
  value: string;
  match: boolean;
};

function parseRegex(regex: RegExp, text: string): Match[] {
  let position = 0;
  let chunks: Match[] = [];
  for (const match of text.matchAll(regex)) {
    const {
      index,
      [0]: { length },
    } = match;
    if (index > position) {
      chunks.push({ value: text.slice(position, index), match: false });
    }
    position = index + length;
    chunks.push({ value: text.slice(index, position), match: true });
  }
  if (position < text.length)
    chunks.push({ value: text.slice(position), match: false });

  return chunks;
}
