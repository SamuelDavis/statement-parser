import { ExtendProps, includes, isHtml, Upload } from "../types.ts";
import { createSignal, For, Show, splitProps } from "solid-js";

export default function HeaderSelect<
  Name extends string,
  Option extends string,
>(
  props: ExtendProps<
    "select",
    {
      name: Name;
      options: Option[];
      rows: Upload["rows"];
      onInput: (name: Name, option: Option, e: Event) => boolean;
    }
  >,
) {
  const [local, parent] = splitProps(props, [
    "name",
    "options",
    "rows",
    "onInput",
  ]);
  const [getIsValid, setIsValid] = createSignal(true);
  const [getValue, setValue] = createSignal<Option | undefined>();
  const [getIsFresh, setIsFresh] = createSignal(true);
  const getIsInvalid = () => {
    const isInvalid = !getIsValid();
    return getIsFresh() ? isInvalid || undefined : isInvalid;
  };

  function onInput(e: Event) {
    const select = e.target;
    if (!isHtml("select", select)) throw new TypeError();

    const { value } = select;
    if (!includes(local.options, value)) throw new TypeError();

    setValue(() => value);
    setIsFresh(false);
    setIsValid(local.onInput(local.name, value, e));
  }

  return (
    <select
      aria-invalid={getIsInvalid()}
      onInput={onInput}
      value={getValue()}
      required
      {...parent}
    >
      <Show when={getIsFresh()}>
        <option />
      </Show>
      <For each={local.options}>
        {(value) => (
          <option value={value} selected={value === getValue()}>
            {value}
          </option>
        )}
      </For>
    </select>
  );
}
