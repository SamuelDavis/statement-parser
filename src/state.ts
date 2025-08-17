import type { ChartProps } from "solid-chartjs";
import { createEffect, createMemo, createRoot, createSignal } from "solid-js";
import {
  assert,
  type FieldMapping,
  Flags,
  type GroupBy,
  groupBy,
  isArray,
  isInstanceOf,
  isNumber,
  isObject,
  isString,
  Flags as RegExpFlags,
  type Statement,
  statementFields,
  type Tag,
  type Transaction,
  type TransactionField,
  tagFields,
  transactionFields,
  type Upload,
} from "./types";
import { persist } from "./utilities";

export const upload = createRoot(() => {
  const [getUpload, setUpload] = createSignal<undefined | Upload>();
  const [getFieldMapping, setFieldMapping] = createSignal<
    Partial<FieldMapping>
  >({});
  const getCompleteFieldMapping = createMemo((): undefined | FieldMapping => {
    const partialFieldMapping = getFieldMapping();
    return isObject(partialFieldMapping, transactionFields)
      ? (partialFieldMapping as FieldMapping)
      : undefined;
  });
  const getStatement = createMemo((): undefined | Statement => {
    const upload = getUpload();
    if (!upload) return undefined;
    const fieldMapping = getCompleteFieldMapping();
    if (!fieldMapping) return undefined;

    return {
      name: upload.name,
      date: new Date(),
      transactions: upload.rows.map(
        (value): Transaction => ({
          date: new Date(value[fieldMapping.date]),
          description: String(value[fieldMapping.description]),
          amount: Number(value[fieldMapping.amount]),
        }),
      ),
    };
  });

  createEffect(() => {
    if (!getUpload()) setFieldMapping({});
  });

  function mapField(field: TransactionField, value: string): void {
    setFieldMapping((mapping) => ({ ...mapping, [field]: value }));
  }
  function getFields(): undefined | string[] {
    return getUpload()?.fields;
  }
  function isSelected(field: TransactionField, value: string): boolean {
    return getFieldMapping()[field] === value;
  }

  return {
    setUpload,
    getStatement,
    mapField,
    getFields,
    isSelected,
  };
});

export const statements = createRoot(() => {
  const [get, set] = persist(createSignal<Statement[]>([]), {
    key: "statements",
    decode(value) {
      value = JSON.parse(value);
      assert(isArray, value);
      return value.map((value) => {
        assert(isObject, value, statementFields);
        const { date, name, transactions } = value;
        assert(isString, date);
        assert(isString, name);
        assert(isArray, transactions);
        return {
          date: new Date(date),
          name,
          transactions: transactions.map((value) => {
            assert(isObject, value, transactionFields);
            const { date, description, amount } = value;
            assert(isString, date);
            assert(isString, description);
            assert(isNumber, amount);
            return {
              date: new Date(date),
              description,
              amount,
            };
          }),
        };
      });
    },
  });

  function add(statement: Statement): void {
    set((statements) => [...statements, statement]);
  }

  return { get, add };
});

export const tags = createRoot(() => {
  const [get, set] = persist(createSignal<Tag[]>([]), {
    key: "tags",
    encode(value) {
      return JSON.stringify(
        value.map((value) => ({
          ...value,
          regexp: value.regexp.source,
        })),
      );
    },
    decode(value) {
      value = JSON.parse(value);
      assert(isArray, value);
      return value.map((value) => {
        assert(isObject, value, tagFields);
        const { value: label, regexp } = value;
        assert(isString, label);
        assert(isString, regexp);
        return { value: label, regexp: new RegExp(regexp, RegExpFlags) };
      });
    },
  });
  function add(tag: Tag): void {
    set((tags) => [...tags, tag]);
  }
  function matching(transaction: Transaction): Tag[] {
    return get().filter((tag) => transaction.description.match(tag.regexp));
  }
  function changeValue(tag: Tag, value: Tag["value"]): void {
    set((tags) =>
      tags.map((t) => (t.value === tag.value ? { ...t, value } : t)),
    );
  }
  const getSources = createMemo((): Tag["regexp"]["source"][] => {
    return get().map((tag) => tag.regexp.source);
  });
  const getValues = createMemo((): Tag["value"][] => {
    return get().map((tag) => tag.value);
  });

  return { get, add, matching, getSources, getValues, changeValue };
});

export const derived = createRoot(() => {
  const getAllTransactions = createMemo((): Transaction[] => {
    return statements
      .get()
      .flatMap((statement) => statement.transactions)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  });

  const getUntaggedTransactions = createMemo((): Transaction[] => {
    const allTransactions = getAllTransactions();
    const allTags = tags.get();
    return allTransactions.filter(
      (transaction) =>
        !allTags.some((tag) => transaction.description.match(tag.regexp)),
    );
  });

  function getTransactions(
    args: Partial<{ matching?: RegExp; untagged: boolean }> = {},
  ): Transaction[] {
    const { matching, untagged } = args;
    const transactions = untagged
      ? getUntaggedTransactions()
      : getAllTransactions();
    if (isInstanceOf(matching, RegExp))
      return transactions.filter((transaction) =>
        transaction.description.match(matching),
      );
    return transactions;
  }

  return { getTransactions, getUntaggedTransactions };
});

export const app = createRoot(() => {
  const [getGroupBy, setGroupBy] = createSignal<GroupBy>(groupBy[0]);
  const [getFilterByTag, setFilterByTag] =
    createSignal<Tag["regexp"]["source"]>("");

  const getRegexp = () => {
    const source = getFilterByTag();
    return source === "" ? undefined : new RegExp(source, Flags);
  };

  const getTransactionsFilteredByTag = createMemo(() => {
    const transactions = derived.getTransactions();
    const regexp = getRegexp();
    return regexp === undefined
      ? transactions
      : transactions.filter((tx) => tx.description.match(regexp));
  });

  const getTransactionsGroupedBy = createMemo(() => {
    const groupBy = getGroupBy();
    return getTransactionsFilteredByTag().reduce<Record<string, Transaction[]>>(
      (acc, transaction) => {
        const key = groupByTransform(groupBy, transaction.date).toISOString();
        acc[key] = acc[key] ?? [];
        acc[key].push(transaction);
        return acc;
      },
      {},
    );
  });

  const getTableData = createMemo(() => {
    let last = 0;
    return Object.entries(getTransactionsGroupedBy())
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([timestamp, transactions]) => {
        const groupBy = new Date(timestamp);
        const total = transactions.reduce(
          (acc, transaction) => acc + transaction.amount,
          0,
        );
        const change = total - last;
        last = total;
        return {
          groupBy,
          total,
          change,
          transactions,
        };
      })
      .reverse();
  });

  const getChartData = (): ChartProps["data"] => {
    const transactions = getTableData()
      .map((v) => ({
        ...v,
        label: v.groupBy.toDateString(),
      }))
      .reverse();
    return {
      labels: transactions.map((t) => t.label),
      datasets: [
        {
          label: "total",
          data: transactions.map((v) => v.total),
          backgroundColor(ctx: any) {
            const current = transactions[ctx.index]?.total ?? 0;
            const prev = transactions[ctx.index - 1]?.total ?? current;
            return current >= prev ? "green" : "red";
          },
          segment: {
            borderColor(ctx: any) {
              const current = ctx.p0.y;
              const prev = ctx.p1.y;
              return current >= prev ? "green" : "red";
            },
          },
        },
      ],
    };
  };

  function groupByTransform(groupBy: GroupBy, date: Date): Date {
    const ret = new Date(date);
    let day = date.getDate();
    if (groupBy === "month") day = 1;
    if (groupBy === "week") day = Math.floor(date.getDate() / 7) * 7 + 1;
    ret.setDate(day);
    return ret;
  }

  return { setGroupBy, setFilterByTag, getTableData, getChartData };
});
