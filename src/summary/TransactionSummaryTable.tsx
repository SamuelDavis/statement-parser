import { createMemo, createSignal, For } from "solid-js";
import HtmlIcon from "../html/HtmlIcon.tsx";
import { ExtendProps, isHtml, isProperty } from "../types.ts";
import statementsState from "../state/statementsState.ts";
import HtmlDate from "../html/HtmlDate.tsx";
import HtmlAmount from "../html/HtmlAmount.tsx";
import { textToRegexp } from "../utilities.tsx";
import { isSameDay } from "date-fns";

type Props = ExtendProps<"table", {}, "children">;
export default function TransactionSummaryTable(props: Props) {
  const [getFilters, setFilters] = createSignal<{
    date: undefined | Date;
    description: undefined | string;
    amount: undefined | number;
  }>({
    date: undefined,
    description: undefined,
    amount: undefined,
  });

  const getFilterChecks = createMemo(() => {
    const { date, description, amount } = getFilters();
    const dateTest =
      date === undefined ? undefined : (check: Date) => isSameDay(date, check);
    let descriptionTest: undefined | ((check: string) => boolean);
    const roundedAmount =
      amount === undefined
        ? undefined
        : amount > 0
          ? Math.floor(amount)
          : Math.ceil(amount);
    const amountTest =
      roundedAmount === undefined
        ? undefined
        : (check: number) => {
            check = check > 0 ? Math.floor(check) : Math.ceil(check);
            return check === roundedAmount;
          };

    try {
      const descriptionRegexp =
        description === undefined ? undefined : textToRegexp(description);
      descriptionTest =
        descriptionRegexp === undefined
          ? undefined
          : (check) => descriptionRegexp.test(check);
    } catch (e) {
      descriptionTest =
        description === undefined
          ? undefined
          : (check) => check.toLowerCase().includes(description.toLowerCase());
    }

    return { dateTest, descriptionTest, amountTest };
  });

  const getTransactions = () => {
    const { dateTest, descriptionTest, amountTest } = getFilterChecks();
    return statementsState.getTransactions().filter((tx) => {
      if (dateTest && !dateTest(tx.date)) return false;
      if (descriptionTest && !descriptionTest(tx.description)) return false;
      if (amountTest && !amountTest(tx.amount)) return false;
      return true;
    });
  };
  const getDateRange = createMemo(() => {
    const transactions = getTransactions();
    if (transactions.length === 0) return;
    const minDate = transactions[0].date;
    const maxDate = transactions[transactions.length - 1].date;
    const [min, max] = [minDate, maxDate].map((date) => {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}-${month}-${day}`;
    });
    return { min, max };
  });

  function onInput(e: Pick<Event, "target">) {
    const input = e.target;
    if (!isHtml("input", input)) throw new TypeError();
    const {
      name,
      value: description,
      valueAsNumber: amount,
      valueAsDate: date,
    } = input;
    const value = { date, description, amount }[name] || undefined;
    setFilters((filters) => {
      if (!isProperty(filters, name)) throw new TypeError();
      return { ...filters, [name]: value };
    });
  }

  return (
    <table {...props} style={{ display: "inline-table" }}>
      <thead>
        <tr>
          <th style={{ width: "10%" }}>
            <label for="date">Date</label>
            <small>(Work in Progress)</small>
          </th>
          <th style={{ "min-width": "100%" }}>
            <label for="description">Description</label>
            <small>Supports regular expressions</small>
          </th>
          <th style={{ width: "20%" }}>
            <label for="amount">Amount</label>
            <small>Rounded towards 0</small>
          </th>
        </tr>
        <tr>
          <th>
            <SearchControl
              type="date"
              id="date"
              name="date"
              min={getDateRange()?.min}
              max={getDateRange()?.max}
              onInput={onInput}
            />
          </th>
          <th>
            <SearchControl
              type="text"
              id="description"
              name="description"
              onInput={onInput}
            />
          </th>
          <th>
            <SearchControl
              type="number"
              id="amount"
              name="amount"
              onInput={onInput}
            />
          </th>
        </tr>
      </thead>
      <tbody>
        <For each={getTransactions()}>
          {(transaction) => (
            <tr>
              <td>
                <HtmlDate value={transaction.date} />
              </td>
              <td>{transaction.description}</td>
              <td>
                <HtmlAmount value={transaction.amount} />
              </td>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  );
}

function SearchControl(
  props: ExtendProps<
    "input",
    { onInput: (event: { target: HTMLInputElement }) => void },
    "ref"
  >,
) {
  let ref: undefined | HTMLInputElement;
  const onClick = () => {
    if (!ref) return;
    ref.value = "";
    props.onInput({ target: ref });
  };
  return (
    <fieldset role="group">
      <input ref={ref} {...props} />
      <HtmlIcon kind="clear" onClick={onClick} />
    </fieldset>
  );
}
