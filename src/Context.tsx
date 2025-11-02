import { persist } from "@samueldavis/tslib";
import {
  createContext,
  type Accessor,
  type ParentProps,
  createSignal,
  createEffect,
} from "solid-js";
import type { Statement } from "./types";

type State = {
  getStatements: Accessor<Statement[]>;
  addStatement: (value: Statement) => void;
};

export const AppState = createContext<State>();
export function Provider(props: ParentProps) {
  const [getStatements, setStatements] = persist(
    createSignal<Statement[]>([]),
    {
      key: "statements",
      listener: createEffect,
      decode(value) {
        const data = JSON.parse(value);
        return data.map((data: any) => {
          const { date, rows } = data;
          return {
            ...data,
            date: new Date(date),
            rows: rows.map((row: any) => ({
              ...row,
              date: new Date(row.date),
            })),
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
  };
  return <AppState.Provider value={state}>{props.children}</AppState.Provider>;
}
