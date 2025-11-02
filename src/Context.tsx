import {
  createContext,
  type Accessor,
  type ParentProps,
  createSignal,
} from "solid-js";

type State = { getCount: Accessor<number>; incrementCount: () => void };

export const AppState = createContext<State>();
export function Provider(props: ParentProps) {
  const [getCount, setCount] = createSignal(0);
  const incrementCount = () => setCount((count) => count + 1);
  const state: State = { getCount, incrementCount };
  return <AppState.Provider value={state}>{props.children}</AppState.Provider>;
}
