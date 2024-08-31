import {
  ExtendProps,
  isHtml,
  Statement,
  TextSegment as TextSegmentType,
  Transaction,
} from "./types.ts";
import { createSignal, For, Show, splitProps } from "solid-js";
import HtmlDate from "./Date.tsx";
import Amount from "./Amount.tsx";
import { debounce } from "@solid-primitives/scheduled";
import ErrorList from "./ErrorList.tsx";
import { parseTextIntoSegments } from "./utilities.tsx";
import TextSegment from "./TextSegment.tsx";
import statementsState from "./state/statementsState.ts";
import tagsState from "./state/tagsState.ts";

type SegmentedTransaction = Transaction & { segments: TextSegmentType[] };

type Props = ExtendProps<
  "form",
  {
    statement?: Statement;
  },
  "children" | "onSubmit"
>;
export default function TaggingForm(props: Props) {
  const [local, parent] = splitProps(props, ["statement"]);
  const [getError, setError] = createSignal<undefined | string>();
  const [getRegexp, setRegexp] = createSignal<undefined | RegExp>();
  const getIsInvalid = () => Boolean(getError());
  const getTransactions = () =>
    local.statement?.transactions ?? statementsState.getTransactions();
  const getSegmentedTransaction = (): undefined | SegmentedTransaction => {
    const regexp = getRegexp();
    const untaggedTransactions = statementsState.getUntaggedTransactions();
    const transaction: undefined | Transaction = untaggedTransactions[0];
    if (!transaction) return undefined;
    const segments: TextSegmentType[] = regexp
      ? parseTextIntoSegments(regexp, transaction.description)
      : [{ value: transaction.description, match: false }];
    return transaction ? { ...transaction, segments } : undefined;
  };
  const getMatchingSegmentedTransactions = (): SegmentedTransaction[] => {
    const regexp = getRegexp();
    if (!regexp) return [];
    return getTransactions()
      .filter((transaction) => regexp.test(transaction.description))
      .map((transaction) => ({
        ...transaction,
        segments: parseTextIntoSegments(regexp, transaction.description),
      }));
  };

  function onTextInput(e: Event) {
    const input = e.target;
    if (!isHtml("input", input)) throw new TypeError();

    if (input.value.trim().length === 0) {
      setRegexp(undefined);
      setError(undefined);
      return;
    }

    try {
      setRegexp(new RegExp(input.value, "gi"));
      setError(undefined);
    } catch (e) {
      if (!(e instanceof Error)) throw new TypeError();
      setRegexp(undefined);
      setError(e.message.replace(/\/gi/, "/"));
    }
  }

  function onSubmit(e: Event) {
    e.preventDefault();
    if (getIsInvalid()) return;

    const form = e.target;
    if (!isHtml("form", form)) throw new TypeError();

    const data = new FormData(form);
    const label = data.get("label")?.toString();
    const text = data.get("text")?.toString();
    if (!(label && text)) return;

    tagsState.addTag({ label, text });
    setRegexp(undefined);
    form.reset();
  }

  return (
    <Show
      when={getSegmentedTransaction()}
      fallback={<p>No untagged transactions remain.</p>}
    >
      {(getTransaction) => {
        const totalTransactions = getTransactions().length;
        const totalUntagged = statementsState.getUntaggedTransactionCount();
        const remaining = totalTransactions - totalUntagged;

        return (
          <form {...parent} onSubmit={onSubmit}>
            <section>
              <label>
                <span>
                  {remaining} of {totalTransactions}
                </span>
                <progress max={totalTransactions} value={remaining} />
              </label>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <HtmlDate value={getTransaction().date} />
                    </td>
                    <td>
                      <Amount value={getTransaction().amount} />
                    </td>
                  </tr>
                </tbody>
              </table>
              <blockquote>
                <For each={getTransaction().segments}>
                  {(segment) => <TextSegment value={segment} />}
                </For>
              </blockquote>
            </section>
            <fieldset>
              <label for="label">Label</label>
              <input
                type="text"
                id="label"
                name="label"
                list="label-list"
                required
              />
              <datalist id="label-list">
                <For each={tagsState.getLabels()}>
                  {(value) => <option value={value} />}
                </For>
              </datalist>
            </fieldset>
            <fieldset>
              <label for="text">text</label>
              <input
                onInput={debounce(onTextInput, 200)}
                type="text"
                id="text"
                name="text"
                list="text-list"
                aria-invalid={getIsInvalid() || undefined}
                aria-describedby="text-error"
                required
              />
              <ErrorList id="text-error">{getError()}</ErrorList>
              <datalist id="text-list">
                <For each={tagsState.getTexts()}>
                  {(value) => <option value={value} />}
                </For>
              </datalist>
            </fieldset>
            <fieldset>
              <input type="submit" />
            </fieldset>
            <output>
              <details open>
                <summary>Matching Transactions</summary>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={getMatchingSegmentedTransactions()}>
                      {(transaction) => (
                        <tr>
                          <td>
                            <HtmlDate value={transaction.date} />
                          </td>
                          <td>
                            <For each={transaction.segments}>
                              {(segment) => <TextSegment value={segment} />}
                            </For>
                          </td>
                          <td>
                            <Amount value={transaction.amount} />
                          </td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </details>
            </output>
          </form>
        );
      }}
    </Show>
  );
}
