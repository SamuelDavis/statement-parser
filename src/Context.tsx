import { isArray, persist } from "@samueldavis/tslib";
import {
  createContext,
  type Accessor,
  type ParentProps,
  createSignal,
  createEffect,
  createMemo,
} from "solid-js";
import type { Statement, Transaction } from "./types";

type State = {
  getStatements: Accessor<Statement[]>;
  getTransactions: Accessor<Transaction[]>;
  addStatement: (value: Statement) => void;
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
  };
  return <AppState.Provider value={state}>{props.children}</AppState.Provider>;
}
