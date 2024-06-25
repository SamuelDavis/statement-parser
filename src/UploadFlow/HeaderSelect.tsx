import {
  ExtendProps,
  includes,
  isHtml,
  NormalHeader,
  normalHeaders,
  Upload,
} from "../types.ts";
import { createEffect, createSignal, For, Show, splitProps } from "solid-js";
import ErrorList from "../ErrorList.tsx";
import styles from "../index.module.css";

type Props<Header extends string = string> = ExtendProps<
  "fieldset",
  {
    upload: Upload<Header>;
    onComplete: (mapping: Record<NormalHeader, Header>) => void;
  }
>;

function isComplete<
  Keys extends readonly string[],
  Values extends readonly string[],
>(
  keys: Keys,
  values: Values,
  mapping: any,
): mapping is Record<NormalHeader, any> {
  if (!mapping || typeof mapping !== "object") return false;

  for (const normal of normalHeaders) {
    const mapped = mapping[normal];
    if (!includes(keys, normal)) return false;
    if (!includes(values, mapped)) return false;

    // missing
    if (!(normal in mapping)) return false;

    // duplicate
    if (Object.values(mapping).filter((value) => value === mapped).length > 1)
      return false;
  }

  return true;
}

function validate<Header extends string = string>(
  rows: Record<Header, string>[],
  normal: NormalHeader,
  header: Header,
) {
  switch (normal) {
    case "date":
      for (let i = 0; i < rows.length; i++) {
        const { [header]: value } = rows[i];
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return `Invalid Date: could not parse date in ${header} on row ${i}.`;
        }
      }
      return;
    case "amount":
      for (let i = 0; i < rows.length; i++) {
        const { [header]: value } = rows[i];
        if (isNaN(parseFloat(value))) {
          return `Invalid Amount: could not parse number in ${header} on row ${i}.`;
        }
      }
      return;
  }
}

export default function HeaderSelect<Header extends string = string>(
  props: Props<Header>,
) {
  const [local, parent] = splitProps(props, ["upload", "onComplete"]);
  const [getErrors, setErrors] = createSignal<
    Partial<Record<NormalHeader, string>>
  >({});
  const [getMapping, setMapping] = createSignal<
    Partial<Record<NormalHeader, Header>>
  >({});

  createEffect(() => {
    const mapping = getMapping();
    if (isComplete(normalHeaders, local.upload.headers, mapping))
      local.onComplete(mapping);
  });

  function onInput(e: Event) {
    const select = e.target;
    if (!isHtml("select", select)) throw new TypeError();
    const { name, value } = select;
    if (!includes(normalHeaders, name)) throw new TypeError();
    if (!includes(local.upload.headers, value)) throw new TypeError();
    const error = validate(local.upload.rows, name, value);
    if (error) return setErrors((errors) => ({ ...errors, [name]: error }));
    setErrors(({ [name]: _, ...errors }) => errors);
    setMapping((mapping) => ({ ...mapping, [name]: value }));
  }

  return (
    <fieldset
      role="group"
      {...parent}
      class={`${styles.HeaderSelect} ${parent}`}
    >
      <For each={normalHeaders}>
        {(normal) => {
          const mappedHeader = getMapping()[normal];
          return (
            <div>
              <label for={`${normal}-select`}>{normal}</label>
              <select
                name={normal}
                id={`${normal}-select`}
                aria-invalid={normal in getErrors() || undefined}
                aria-labelledby="mapping-errors"
                onInput={onInput}
                required
                value={mappedHeader}
              >
                <Show when={!(normal in getMapping() || normal in getErrors())}>
                  <option />
                </Show>
                <For each={local.upload.headers}>
                  {(header) => (
                    <option value={header} selected={header === mappedHeader}>
                      {header}
                    </option>
                  )}
                </For>
              </select>
            </div>
          );
        }}
      </For>
      <ErrorList id={`mapping-errors`}>{Object.values(getErrors())}</ErrorList>
    </fieldset>
  );
}
