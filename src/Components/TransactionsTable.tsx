import { For, Show } from "solid-js";
import { extract, HTMLDate } from "@samueldavis/solidlib";
import type { TaggedTransaction, Transaction } from "../types";
import Money from "./Money";

type Props = {
  transactions: (Transaction | TaggedTransaction)[];
  highlight?: RegExp;
  current?: string;
};

type Part = { text: string; match: boolean };

export default function TransactionsTable(props: Props) {
  return (
    <figure>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <For
            each={props.transactions}
            fallback={
              <tr>
                <td colspan={3}>No transactions.</td>
              </tr>
            }
          >
            {(transaction) => (
              <tr>
                <td>
                  <HTMLDate value={transaction.date} />
                </td>
                <td>
                  <Description
                    text={transaction.description}
                    highlight={props.highlight}
                  />
                  <Show when={extract(transaction, "tags")}>
                    {(getTagged) => (
                      <Tags tags={getTagged().tags} current={props.current} />
                    )}
                  </Show>
                </td>
                <td>
                  <Money value={transaction.amount} />
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </figure>
  );
}

function Description(props: { text: string; highlight?: RegExp }) {
  const getParts = (): Part[] => {
    if (!props.highlight) return [{ text: props.text, match: false }];
    const parts: Part[] = [];
    let from = 0;
    for (const match of props.text.matchAll(props.highlight)) {
      const to = match.index + match[0].length;
      parts.push({ text: props.text.slice(from, match.index), match: false });
      parts.push({ text: match[0], match: true });
      from = to;
    }
    parts.push({ text: props.text.slice(from), match: false });
    return parts.filter((part) => part.text.length > 0);
  };

  return (
    <p>
      <For each={getParts()}>
        {(part) => (
          <Show when={part.match} fallback={part.text}>
            <mark>{part.text}</mark>
          </Show>
        )}
      </For>
    </p>
  );
}

function Tags(props: { tags: string[]; current?: string }) {
  return (
    <ul data-pills>
      <For each={props.tags}>
        {(tag) => (
          <li data-current={tag === props.current || undefined}>{tag}</li>
        )}
      </For>
    </ul>
  );
}
