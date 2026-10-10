import { For } from "solid-js";
import type { Targeted } from "@samueldavis/solidlib";
import type { Tag } from "../types";

type Props = {
  label: string;
  options: Tag["label"][];
  selected: Tag["label"][];
  onChange: (selected: Tag["label"][]) => void;
};

export default function TagSelect(props: Props) {
  function onInput(event: Targeted<HTMLSelectElement>): void {
    props.onChange(
      Array.from(event.currentTarget.selectedOptions, getOptionValue),
    );
  }

  function onClear(): void {
    props.onChange([]);
  }

  return (
    <label>
      {props.label}
      <fieldset role="group">
        <select multiple onInput={onInput}>
          <For each={props.options}>
            {(option) => (
              <option value={option} selected={props.selected.includes(option)}>
                {option}
              </option>
            )}
          </For>
        </select>
        <button
          type="button"
          class="secondary"
          disabled={props.selected.length === 0}
          onClick={onClear}
        >
          Clear
        </button>
      </fieldset>
    </label>
  );
}

function getOptionValue(option: HTMLOptionElement): string {
  return option.value;
}
