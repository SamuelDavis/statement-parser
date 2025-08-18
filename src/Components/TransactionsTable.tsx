import { createSignal, For, Show, splitProps } from "solid-js";
import { tags } from "../state";
import {
  type ExtendProps,
  type Targeted,
  type Transaction,
  transactionFields,
} from "../types";
import { undefineFalsy } from "../utilities";
import HTMLDate from "./HTMLDate";
import HTMLNumber from "./HTMLNumber";
import HTMLText from "./HTMLText";
import { A } from "@solidjs/router";

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
  const [getUntaggedOnly, setUntaggedOnly] = createSignal(false);
  const getTransactions = () => {
    const untagged = getUntaggedOnly();
    return untagged
      ? local.transactions.filter(
          (transaction) =>
            !tags
              .get()
              .some((tag) => transaction.description.match(tag.regexp)),
        )
      : local.transactions;
  };

  function onUntaggedOnly(event: Targeted<InputEvent>): void {
    setUntaggedOnly(event.currentTarget.checked);
  }

  if (getTransactions().length === 0) return <p>No transactions available.</p>;

  return (
    <table {...parent}>
      <Show when={local.controls}>
        <thead>
          <tr>
            <th colspan={transactionFields.length}>
              <details open>
                <summary>Options</summary>
                <label>
                  <input
                    type="checkbox"
                    onInput={onUntaggedOnly}
                    checked={getUntaggedOnly()}
                  />
                  <span>Untagged Only</span>
                </label>
              </details>
            </th>
          </tr>
        </thead>
      </Show>
      <thead>
        <tr>
          <th colspan={transactionFields.length}>
            <p>
              <output>{getTransactions().length}</output> transactions with a
              value of{" "}
              <HTMLNumber
                value={getTransactions()
                  .filter((transaction) => {
                    const matching = tags.matching(transaction);
                    return (
                      matching.length === 0 ||
                      matching.some((tag) => !tag.ignore)
                    );
                  })
                  .reduce((acc, tx) => acc + tx.amount, 0)}
              />{" "}
              from <HTMLDate value={getTransactions().slice(-1)[0].date} /> to{" "}
              <HTMLDate value={getTransactions()[0].date} />.
            </p>
          </th>
        </tr>
        <tr>
          <For each={transactionFields}>{(field) => <th>{field}</th>}</For>
        </tr>
      </thead>
      <tbody>
        <For each={getTransactions()}>
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
