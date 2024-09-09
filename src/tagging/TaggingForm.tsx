import {
  ExtendProps,
  isHtml,
  SegmentedTransaction,
  TextSegment,
  Transaction,
} from "../types.ts";
import { createMemo, createSignal, For, Show, splitProps } from "solid-js";
import { debounce } from "@solid-primitives/scheduled";
import HtmlErrorList from "../html/HtmlErrorList.tsx";
import { parseTextIntoSegments, textToRegexp } from "../utilities.tsx";
import tagsState from "../state/tagsState.ts";
import TransactionSummary from "../summary/TransactionSummary.tsx";
import HtmlTextSegment from "../html/HtmlTextSegment.tsx";
import TaggingMatchingTransactionsPreview from "./TaggingMatchingTransactionsPreview.tsx";

type Props = ExtendProps<
  "form",
  { transactions: Transaction[] },
  "children" | "onSubmit"
>;
export default function TaggingForm(props: Props) {
  const [local, parent] = splitProps(props, ["transactions"]);
  const [getError, setError] = createSignal<undefined | string>();
  const [getRegexp, setRegexp] = createSignal<undefined | RegExp>();
  const getIsInvalid = () => Boolean(getError());
  const getUntaggedTransactions = createMemo(() => {
    let transactions = local.transactions;
    // why doesn't the first filter work?
    for (let i = 0; i < 2; i++)
      transactions = transactions.filter(
        (transaction) => !tagsState.isTagged(transaction),
      );
    return transactions;
  });
  const getTotalTransactions = () => local.transactions.length;
  const getTotalUntaggedTransactions = () => getUntaggedTransactions().length;
  const getTotalRemainingTransactions = () =>
    getTotalTransactions() - getTotalUntaggedTransactions();
  const getSegmentedTransaction = (): undefined | SegmentedTransaction => {
    const regexp = getRegexp();
    const untaggedTransactions = getUntaggedTransactions();
    const transaction = untaggedTransactions[0];
    if (!transaction) return undefined;
    const segments: TextSegment[] = regexp
      ? parseTextIntoSegments(regexp, transaction.description)
      : [{ value: transaction.description, match: false }];
    return { ...transaction, segments };
  };

  function onTextInput(e: Event) {
    const transaction = getSegmentedTransaction();
    if (!transaction) return;
    const input = e.target;
    if (!isHtml("input", input)) throw new TypeError();

    if (input.value.trim().length === 0) {
      setRegexp(undefined);
      setError(undefined);
      return;
    }

    try {
      const regexp = textToRegexp(input.value);
      if (regexp.test(transaction.description)) {
        setRegexp(regexp);
        setError(undefined);
      } else {
        setRegexp(undefined);
        setError("Text does not match Transaction Description.");
      }
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
    <form {...parent} onSubmit={onSubmit}>
      <header>
        <span>
          {`${getTotalRemainingTransactions()} of ${getTotalTransactions()}`}
        </span>
        <progress
          max={getTotalTransactions()}
          value={getTotalRemainingTransactions()}
        />
        <Show
          when={getSegmentedTransaction()}
          fallback={<p>No more untagged transactions.</p>}
        >
          {(getSegmentedTransaction) => (
            <TransactionSummary transaction={getSegmentedTransaction()}>
              <For each={getSegmentedTransaction().segments}>
                {(segment) => <HtmlTextSegment value={segment} />}
              </For>
            </TransactionSummary>
          )}
        </Show>
      </header>
      <fieldset>
        <label for="label">Label</label>
        <input type="text" id="label" name="label" list="label-list" required />
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
        <HtmlErrorList id="text-error">{getError()}</HtmlErrorList>
        <datalist id="text-list">
          <For each={tagsState.getTexts()}>
            {(value) => <option value={value} />}
          </For>
        </datalist>
      </fieldset>
      <fieldset>
        <input type="submit" />
      </fieldset>
      <Show when={getRegexp()} fallback={<p>No Matching Transactions</p>}>
        {(getRegexp) => (
          <TaggingMatchingTransactionsPreview open regexp={getRegexp()} />
        )}
      </Show>
    </form>
  );
}
