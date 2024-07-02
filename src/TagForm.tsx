import { ExtendProps, isHtml } from "./types.ts";
import { createSignal, splitProps } from "solid-js";
import { debounce } from "@solid-primitives/scheduled";
import ErrorList from "./ErrorList.tsx";

type Props = ExtendProps<
  "form",
  {
    onInput?: (r: RegExp | undefined, e: Event) => void;
  }
>;
export default function TagForm(props: Props) {
  const [local, parent] = splitProps(props, ["onInput"]);
  const [getError, setError] = createSignal<string | undefined>();

  function onInput(e: Event) {
    const input = e.target;
    if (!isHtml("input", input)) throw new TypeError();
    const { value } = input;
    try {
      const regex = value.length ? new RegExp(value, "gi") : undefined;
      local.onInput?.(regex, e);
      setError(undefined);
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      else console.error(e);
    }
  }

  return (
    <form {...parent}>
      <label>
        <span>Match</span>
        <input
          type="text"
          onInput={debounce(onInput, 200)}
          aria-labelledby="match-errors"
          aria-invalid={Boolean(getError()) || undefined}
        />
        <ErrorList id="match-errors">{getError()}</ErrorList>
      </label>
    </form>
  );
}
