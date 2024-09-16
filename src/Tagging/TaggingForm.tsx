import { batch, createSignal, For, Show, splitProps } from "solid-js";
import { handle } from "../utilities.ts";
import Icon from "../Components/Icon.tsx";
import { ExtendProps } from "../types.ts";
import TaggingInput from "./TaggingInput.tsx";
import ErrorList from "../Components/ErrorList.tsx";
import tags from "../State/tags.ts";

type Props = ExtendProps<"form", {}, "children">;

export default function TaggingForm(props: Props) {
  const [local, parent] = splitProps(props, ["onSubmit"]);
  const text = createSignal<undefined | string>();
  const label = createSignal<undefined | string>();
  const [getLabels, setLabels] = createSignal<string[]>([]);
  const labelErrors = createSignal<undefined | string[]>();
  const [getLabelErrors] = labelErrors;
  const [, setRegexp] = createSignal<undefined | RegExp>();
  const [getText, setText] = text;
  const [getLabel, setLabel] = label;

  function onSubmit(event: SubmitEvent) {
    event.preventDefault();
    const text = getText();
    const label = getLabel()?.trim();
    const labels = getLabels();
    if (label && !labels.includes(label)) labels.push(label);
    if (!text || labels.length === 0) return;
    tags.addTags(...labels.map((label) => ({ label, text })));
    handle(local.onSubmit, event);
    batch(() => {
      setText(undefined);
      setRegexp(undefined);
      setLabel(undefined);
      setLabels([]);
    });
  }

  function onAddName() {
    const name = getLabel()?.trim();
    if (!name) return;
    setLabels((names) => [...names, name].unique());
    setLabel(undefined);
  }

  function onRemoveName(name: string) {
    setLabels((names) => names.filter((n) => n !== name));
  }

  function onTextInput() {
    const text = getText()?.trim();
    setRegexp(text ? new RegExp(text, "gi") : undefined);
  }

  function onLabelInput() {
    if (getLabels().includes(getLabel() ?? ""))
      throw new Error(`${getLabel()} already exists`);
  }

  return (
    <form onSubmit={onSubmit} {...parent}>
      <fieldset>
        <label for="text">The text this tag matches&hellip;</label>
        <TaggingInput
          id="text"
          name="text"
          bind={text}
          onInput={onTextInput}
          required
          options={tags.getTexts()}
        />
      </fieldset>
      <fieldset>
        <label for="name">
          <div>
            One or more tag names to associate with the matching the
            text&hellip;
          </div>
        </label>
        <div role="group">
          <TaggingInput
            id="label"
            name="label"
            bind={label}
            onInput={onLabelInput}
            errors={labelErrors}
            aria-describedby="label-errors"
            required={getLabels().length === 0}
            placeholder={getLabels().join(", ")}
            options={tags.getLabels()}
          />
          <Icon value="add" onClick={onAddName} />
        </div>
        <ErrorList id="label-errors">{getLabelErrors()}</ErrorList>
        <Show when={getLabels().length > 0}>
          <ul>
            <For each={getLabels()}>
              {(name) => (
                <li>
                  <span>{name}</span>{" "}
                  <Icon value="remove" onClick={[onRemoveName, name]} />
                </li>
              )}
            </For>
          </ul>
        </Show>
      </fieldset>
      <input type="submit" value="Next" />
    </form>
  );
}
