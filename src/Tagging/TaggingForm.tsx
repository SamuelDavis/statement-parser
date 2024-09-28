import {
  batch,
  createEffect,
  createSignal,
  For,
  Show,
  splitProps,
} from "solid-js";
import { handle, stringToRegexp } from "../utilities.ts";
import Icon from "../Components/Icon.tsx";
import {
  ExtendProps,
  isHtml,
  Transaction,
  Transaction as TransactionType,
} from "../types.ts";
import ErrorList from "../Components/ErrorList.tsx";
import tags from "../State/tags.ts";
import DataList from "../Components/DataList.tsx";
import derived from "../State/derived.ts";
import DateStamp from "../Components/DateStamp.tsx";
import Amount from "../Components/Amount.tsx";
import Highlight from "../Components/Highlight.tsx";
import statements from "../State/statements.ts";
import createDebounce from "@solid-primitives/debounce";

type Props = ExtendProps<"form", {}, "children">;

export default function TaggingForm(props: Props) {
  const [local, parent] = splitProps(props, ["onSubmit"]);
  const [getText, setText] = createSignal<undefined | string>();
  const [getTextError, setTextError] = createSignal<undefined | string>();
  const [getLabel, setLabel] = createSignal<undefined | string>();
  const [getLabelError, setLabelError] = createSignal<undefined | string>();
  const [getLabels, setLabels] = createSignal<string[]>([]);
  const [getRegexp, setRegexp] = createSignal<undefined | RegExp>();
  const getUntaggedTransaction = (): undefined | TransactionType =>
    derived.getUntaggedTransactions()[0] ?? undefined;
  const [getMatchingTransactions, setMatchingTransactions] = createSignal<
    TransactionType[]
  >([]);
  const dbFn = createDebounce(
    (regexp: undefined | RegExp, tx: Transaction[]) => {
      return regexp
        ? tx.filter((transaction) => !regexp.test(transaction.description))
        : [];
    },
    200,
  );
  createEffect(() => {
    dbFn(getRegexp(), statements.getTransactions());
  });

  function onSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (getLabel()?.trim()) return onAddLabel();

    const text = getText();
    const labels = getLabels();
    if (!text || labels.length === 0) return;
    tags.addTags(...labels.map((label) => ({ label, text })));
    handle(local.onSubmit, event);
    batch(() => {
      setText(undefined);
      setRegexp(undefined);
      setLabel(undefined);
      setLabels([]);
    });
  }

  function onAddLabel() {
    const label = getLabel()?.trim();
    if (!label) return;
    setLabels((labels) => [...labels, label].unique());
    setLabel(undefined);
  }

  function onRemoveLabel(label: string) {
    setLabels((labels) => labels.filter((v) => v !== label));
    if (!getLabel()) setLabel(label);
  }

  function onTextInput(e: InputEvent) {
    if (!isHtml("input", e.target)) throw new TypeError();
    const { value } = e.target;
    const text = value.trim();
    try {
      setText(text);
      setRegexp(text ? stringToRegexp(text) : undefined);
      setTextError(undefined);
    } catch (e) {
      if (e instanceof Error) {
        setTextError(e.message);
      } else console.error(e);
    }
  }

  function onLabelInput(e: InputEvent) {
    if (!isHtml("input", e.target)) throw new TypeError();
    const { value } = e.target;
    setLabel(value);
    if (getLabels().includes(value ?? ""))
      setLabelError(`This transaction is already tagged with "${value}".`);
    else setLabelError(undefined);
  }

  return (
    <form onSubmit={onSubmit} {...parent}>
      <header>
        <Show
          when={getUntaggedTransaction()}
          fallback={<p>There are no untagged transactions.</p>}
        >
          {(getUntaggedTransaction) => {
            const transaction = getUntaggedTransaction();
            return (
              <aside>
                <PartialTransaction
                  transaction={transaction}
                  regexp={getRegexp()}
                />
              </aside>
            );
          }}
        </Show>
      </header>
      <hr />
      <fieldset>
        <label for="text">The text this tag matches&hellip;</label>
        <input
          value={getText() || ""}
          type="text"
          list="text-list"
          id="text"
          name="text"
          onInput={onTextInput}
          aria-describedby="text-errors"
          required
        />
        <DataList id="text-list" value={tags.getTexts()} />
        <ErrorList id="text-errors">{getTextError()}</ErrorList>
      </fieldset>
      <fieldset>
        <label for="name">
          <div>
            One or more tag names to associate with the matching the
            text&hellip;
          </div>
        </label>
        <div role="group">
          <input
            value={getLabel() || ""}
            type="text"
            list="label-list"
            id="label"
            name="label"
            onInput={onLabelInput}
            aria-describedby="label-errors"
            required={getLabels().length === 0}
            placeholder={getLabels().join(", ")}
          />
          <DataList id="label-list" value={tags.getLabels()} />
          <Icon value="add" onClick={onAddLabel} />
        </div>
        <ErrorList id="label-errors">{getLabelError()}</ErrorList>
        <Show when={getLabels().length > 0}>
          <ul>
            <For each={getLabels()}>
              {(name) => (
                <li>
                  <span>{name} </span>
                  <Icon value="remove" onClick={[onRemoveLabel, name]} />
                </li>
              )}
            </For>
          </ul>
        </Show>
      </fieldset>
      <input type="submit" value="Next" />
      <aside>
        <h5>Other Matching Transactions</h5>
        <ul>
          <For each={getMatchingTransactions()}>
            {(transaction) => (
              <PartialTransaction
                transaction={transaction}
                regexp={getRegexp()}
              />
            )}
          </For>
        </ul>
      </aside>
    </form>
  );
}

function PartialTransaction(props: {
  transaction: TransactionType;
  regexp?: RegExp;
}) {
  return (
    <>
      <dl role="group">
        <dt>Date</dt>
        <dd>
          <DateStamp value={props.transaction.date} />
        </dd>
        <dt>Amount</dt>
        <dd>
          <Amount value={props.transaction.amount} />
        </dd>
      </dl>
      <q>
        <Highlight value={props.regexp}>
          {props.transaction.description}
        </Highlight>
      </q>
    </>
  );
}
