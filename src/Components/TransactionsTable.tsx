import { A } from "@solidjs/router";
import { For, Show, splitProps } from "solid-js";
import { tags } from "../state";
import {
  type ExtendProps,
  type Transaction,
  transactionFields,
} from "../types";
import { undefineFalsy } from "../utilities";
import HTMLDate from "./HTMLDate";
import HTMLNumber from "./HTMLNumber";
import HTMLText from "./HTMLText";

export default function TransactionsTable(
  props: ExtendProps<
    "table",
    {
      transactions: Transaction[];
      controls?: boolean;
      highlight?: RegExp;
      tags?: boolean;
    },
    "children"
  >,
) {
  const [local, parent] = splitProps(props, [
    "transactions",
    "controls",
    "highlight",
    "tags",
  ]);

  if (local.transactions.length === 0) return <p>No transactions available.</p>;

  return (
    <table {...parent}>
      <thead>
        <tr>
          <For each={transactionFields}>{(field) => <th>{field}</th>}</For>
        </tr>
      </thead>
      <tbody>
        <For each={local.transactions}>
          {(transaction) => {
            return (
              <>
                <tr>
                  <For each={transactionFields}>
                    {(field) => {
                      switch (field) {
                        case "date":
                          return (
                            <td>
                              <HTMLDate value={transaction[field]} />
                            </td>
                          );
                        case "description":
                          return (
                            <td>
                              <HTMLText
                                value={transaction[field]}
                                mark={local.highlight}
                              />
                            </td>
                          );
                        case "amount":
                          return (
                            <td>
                              <HTMLNumber value={transaction[field]} />
                            </td>
                          );
                      }
                    }}
                  </For>
                </tr>
                <Show when={local.tags}>
                  <Show when={undefineFalsy(tags.matching(transaction))}>
                    {(get) =>
                      get().length > 0 && (
                        <tr>
                          <td colspan={transactionFields.length}>
                            <ul>
                              <For each={get()}>
                                {(tag) => (
                                  <li>
                                    <A
                                      href={`/tags?q=${JSON.stringify(tag.value)}`}
                                    >
                                      {tag.value}
                                    </A>
                                  </li>
                                )}
                              </For>
                            </ul>
                          </td>
                        </tr>
                      )
                    }
                  </Show>
                </Show>
              </>
            );
          }}
        </For>
      </tbody>
    </table>
  );
}
