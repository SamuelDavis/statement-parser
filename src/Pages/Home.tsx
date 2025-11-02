import { useContext } from "solid-js";
import { AppState } from "../Context";
import { assert } from "@samueldavis/tslib";

function isNonNullable<T>(v: T): v is NonNullable<T> {
  return v !== null && v !== undefined;
}

export default function Home() {
  const state = useContext(AppState);
  assert(isNonNullable, state);

  return (
    <article>
      <h1 onClick={state.incrementCount}>{state.getCount()}</h1>
    </article>
  );
}
