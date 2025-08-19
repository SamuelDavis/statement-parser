import { createEffect, createMemo, createRoot, createSignal } from "solid-js";
import {
  assert,
  type FieldMapping,
  Flags,
  isArray,
  isInstanceOf,
  isNumber,
  isObject,
  isString,
  Flags as RegExpFlags,
  type Statement,
  statementFields,
  type Tag,
  type TaggedTransaction,
  type Transaction,
  type TransactionField,
  tagFields,
  transactionFields,
  type Upload,
  untagged,
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
        return {
          value: label,
          regexp: new RegExp(regexp, RegExpFlags),
        };
      });
    },
  });
  function add(tag: Tag): void {
    set((tags) => [...tags, tag]);
  }
  function matching(transaction: Transaction): Tag[] {
    return getTags().filter((tag) => transaction.description.match(tag.regexp));
  }
  function update(tag: Tag, value: Tag): void {
    set((tags) => tags.map((t) => (t.value === tag.value ? value : t)));
  }
  const getSources = createMemo((): Tag["regexp"]["source"][] => {
    return get().map((tag) => tag.regexp.source);
  });
  const getValues = createMemo((): Tag["value"][] => {
    const values = get().map((tag) => tag.value);
    values.unshift(untagged);
    return values;
  });

  function getTags(): Tag[] {
    const map: Record<Tag["value"], Tag["regexp"]["source"][]> = {};
    for (const tag of get()) {
      const sources = map[tag.value] ?? [];
      if (!sources.includes(tag.regexp.source)) sources.push(tag.regexp.source);
      map[tag.value] = sources;
    }

    return Object.entries(map).map(
      ([value, sources]): Tag => ({
        value,
        regexp: new RegExp(sources.join("|"), Flags),
      }),
    );
  }

  return {
    get: getTags,
    add,
    matching,
    getSources,
    getValues,
    changeValue: update,
  };
});

export const derived = createRoot(() => {
  const getTransactions = createMemo((): Transaction[] => {
    return statements
      .get()
      .flatMap((statement) => statement.transactions)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  });

  const getTaggedTransactions = createMemo((): TaggedTransaction[] => {
    const transactions = getTransactions();
    const allTags = tags.get();
    return transactions.map(
      (transaction): TaggedTransaction => ({
        ...transaction,
        tags: allTags.filter((tag) =>
          transaction.description.match(tag.regexp),
        ),
      }),
    );
  });

  const getUntaggedTransactions = createMemo((): Transaction[] => {
    const allTransactions = getTransactions();
    const allTags = tags.get();
    return allTransactions.filter(
      (transaction) =>
        !allTags.some((tag) => transaction.description.match(tag.regexp)),
    );
  });

  function findTransactions(
    args: Partial<{ matching?: RegExp; untagged: boolean }> = {},
  ): Transaction[] {
    const { matching, untagged } = args;

    let transactions = getTaggedTransactions();
    if (isInstanceOf(matching, RegExp))
      transactions = transactions.filter((transaction) =>
        transaction.description.match(matching),
      );
    if (untagged)
      transactions = transactions.filter(
        (transaction) => transaction.tags.length === 0,
      );
    return transactions;
  }

  return { findTransactions, getUntaggedTransactions, getTaggedTransactions };
});
