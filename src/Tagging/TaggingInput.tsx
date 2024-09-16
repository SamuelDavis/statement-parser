import { ExtendProps, isHtml } from "../types.ts";
import {
  createSignal,
  For,
  mergeProps,
  Show,
  Signal,
  splitProps,
} from "solid-js";
import { handle } from "../utilities.ts";
import ErrorList from "../Components/ErrorList.tsx";

type Props = ExtendProps<
  "input",
  {
    name: string;
    options?: string[];
    bind: Signal<undefined | string>;
    errors?: Signal<undefined | string[]>;
  },
  "type" | "aria-invalid" | "value" | "list"
>;

export default function TaggingInput(props: Props) {
  props = mergeProps(
    {
      autocomplete: "off",
      list: props.options ? `${props.name}-list` : undefined,
    },
    props,
  );
  const [local, parent] = splitProps(props, [
    "options",
    "onInput",
    "bind",
    "errors",
    "aria-describedby",
  ]);
  const [getErrors, setErrors] =
    local.errors ?? createSignal<undefined | string[]>();
  const [getValue, setValue] = local.bind;
  const getIsInvalid = () => Boolean(getErrors());
  const errorListId = local["aria-describedby"] ?? `${parent.name}-errors`;

  function onInput(event: InputEvent) {
    if (!isHtml("input", event.target)) throw new TypeError();
    try {
      setValue(event.target.value);
      handle(local.onInput, event);
      setErrors(undefined);
    } catch (error) {
      if (!(error instanceof Error)) console.error(error);
      else setErrors([error.message]);
    }
  }

  return (
    <>
      <input
        type="text"
        aria-describedby={errorListId}
        aria-invalid={getIsInvalid() || undefined}
        value={getValue() || ""}
        onInput={onInput}
        {...parent}
      />
      <Show when={!local["aria-describedby"]}>
        <ErrorList id={errorListId}>{getErrors()}</ErrorList>
      </Show>
      <Show when={parent.list && local.options?.length}>
        <datalist id={parent.list}>
          <For each={local.options}>{(value) => <option value={value} />}</For>
        </datalist>
      </Show>
    </>
  );
}
