import { isArray, persist } from "@samueldavis/tslib";
import {
  createContext,
  type Accessor,
  type ParentProps,
  createSignal,
  createEffect,
  createMemo,
} from "solid-js";
import type { Statement, Transaction, Tag } from "./types";

type State = {
  getStatements: Accessor<Statement[]>;
  addStatement: (value: Statement) => void;
  getTransactions: Accessor<Transaction[]>;
  getTags: Accessor<Tag[]>;
  addTag: (value: Tag) => void;
};

export const AppState = createContext<State>();
export function Provider(props: ParentProps) {
  const [getStatements, setStatements] = persist<Statement[]>(
    createSignal<Statement[]>([]),
    {
      key: "statements",
      listener: createEffect,
      decode(value) {
        const data = JSON.parse(value);
        const statements = isArray(data) ? data : [];

        return statements.map((data: any): Statement => {
          const rows = isArray(data.rows) ? data.rows : [];
          return {
            name: String(data.name),
            date: new Date(data.date),
            rows: rows.map(
              (row: any): Transaction => ({
                date: new Date(row.date),
                description: String(row.description),
                amount: Number(row.amount),
              }),
            ),
          };
        });
      },
    },
  );
  const [getTags, setTags] = persist<Tag[]>(createSignal<Tag[]>([]), {
    key: "tags",
    listener: createEffect,
    encode(value) {
      return JSON.stringify(
        value.map((value) => ({ ...value, regexp: value.regexp.source })),
      );
    },
    decode(value) {
      const data = JSON.parse(value);
      const tags = isArray(data) ? data : [];

      return tags.map(
        (data: any): Tag => ({
          ...data,
          regexp: new RegExp(data.regexp, "gi"),
        }),
      );
    },
  });

  const state: State = {
    getStatements,
    addStatement(value: Statement): void {
      setStatements((statements) => [...statements, value]);
    },
    getTransactions: createMemo(() =>
      getStatements()
        .reduce<Transaction[]>(
          (acc, statement) => [...acc, ...statement.rows],
          [],
        )
        .sort((a, b) => b.date.getTime() - a.date.getTime()),
    ),
    getTags,
    addTag(value: Tag): void {
      setTags((tags) => {
        if (
          tags.some(
            (tag) =>
              tag.value === value.value &&
              tag.regexp.source === value.regexp.source,
          )
        )
          return tags;
        return [...tags, value];
      });
    },
  };
  return <AppState.Provider value={state}>{props.children}</AppState.Provider>;
}
