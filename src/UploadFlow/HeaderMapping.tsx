import {
  ExtendProps,
  includes,
  NormalHeader,
  normalHeaders,
  Upload,
} from "../types.ts";
import { createEffect, createSignal, For, splitProps } from "solid-js";
import ErrorList from "../ErrorList.tsx";
import styles from "../index.module.css";
import HeaderSelect from "./HeaderSelect.tsx";

type Props<Header extends string = string> = ExtendProps<
  "fieldset",
  {
    upload: Upload<Header>;
    onComplete: (mapping: Record<NormalHeader, Header> | undefined) => void;
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

export default function HeaderMapping<Header extends string = string>(
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
    local.onComplete(
      isComplete(normalHeaders, local.upload.headers, mapping)
        ? mapping
        : undefined,
    );
  });

  function onInput(name: NormalHeader, value: Header): boolean {
    const error = validate(local.upload.rows, name, value);
    if (error) {
      setErrors((errors) => ({ ...errors, [name]: error }));
      setMapping(({ [name]: _, ...mapping }) => mapping);
    } else {
      setErrors(({ [name]: _, ...errors }) => errors);
      setMapping((mapping) => ({ ...mapping, [name]: value }));
    }
    return !Boolean(error);
  }

  return (
    <fieldset role="group" class={styles.HeaderSelect} {...parent}>
      <For each={normalHeaders}>
        {(normal) => (
          <fieldset>
            <label for={`${normal}-select`}>{normal}</label>
            <HeaderSelect
              id={`${normal}-select`}
              name={normal}
              options={local.upload.headers}
              rows={local.upload.rows}
              onInput={onInput}
              aria-labelledby="mapping-errors"
            />
          </fieldset>
        )}
      </For>
      <ErrorList id={`mapping-errors`}>{Object.values(getErrors())}</ErrorList>
    </fieldset>
  );
}
