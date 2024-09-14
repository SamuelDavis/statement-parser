import { createComputed, createSignal, For, Show, splitProps } from "solid-js";
import {
  ExtendProps,
  hasProperties,
  isArray,
  isFunction,
  NormalHeader,
  normalHeaders,
  Statement,
  TargetedEvent,
  Transaction,
  Upload,
} from "../types.ts";
import UploadFileInput from "./UploadFileInput.tsx";
import UploadHeaderSelect from "./UploadHeaderSelect.tsx";
import UploadTransactionPreview from "./UploadTransactionPreview.tsx";
import statements from "../state/statements.ts";

const steps = [
  "Upload",
  "Specify Date",
  "Specify Description",
  "Specify Amount",
  "Review",
] as const;

type Props = ExtendProps<"form">;

export default function UploadForm(props: Props) {
  const [local, parent] = splitProps(props, ["onSubmit"]);
  const [getUpload, setUpload] = createSignal<undefined | Upload>();
  const [getMapping, setMapping] = createSignal<
    Partial<Record<NormalHeader, string>>
  >({});
  const [getStatement, setStatement] = createSignal<undefined | Statement>();
  const getHeaderOptions = () => getUpload()?.headers;
  const getCompleteMapping = () => {
    const mapping = getMapping();
    return hasProperties(normalHeaders, mapping) ? mapping : undefined;
  };
  const getStepLabel = (): (typeof steps)[number] => {
    const upload = getUpload();
    const mapping = getMapping();
    if (!upload) return "Upload";
    if (!mapping["date"]) return "Specify Date";
    if (!mapping["description"]) return "Specify Description";
    if (!mapping["amount"]) return "Specify Amount";
    return "Review";
  };
  const getStep = () => steps.indexOf(getStepLabel()) + 1;

  createComputed(() => {
    const options = getHeaderOptions() ?? [];
    const mapping = normalHeaders.reduce((acc, normal) => {
      const header = options.find((option) =>
        option.toLowerCase().includes(normal),
      );
      return header ? { ...acc, [normal]: header } : acc;
    }, {});
    if (hasProperties(normalHeaders, mapping)) setMapping(mapping);
  });

  createComputed(() => {
    const upload = getUpload();
    const mapping = getCompleteMapping();

    setStatement(() => {
      if (!upload) return undefined;
      if (!mapping) return undefined;
      return {
        name: upload.name,
        date: new Date(),
        transactions: upload.rows.map((row) =>
          normalHeaders.reduce((acc, normal) => {
            const value = row[mapping[normal]];
            switch (normal) {
              case "date":
                return { ...acc, date: new Date(value) };
              case "description":
                return { ...acc, description: value };
              case "amount":
                return { ...acc, amount: parseFloat(value) };
            }
          }, {} as Transaction),
        ),
      };
    });
  });

  function onSubmit(event: TargetedEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();
    const statement = getStatement();
    if (!statement) return;

    if (
      !statements.statementExists(statement) ||
      confirm(`The name ${statement.name} already exists: overwrite?`)
    )
      statements.addStatement(statement);

    if (isArray(local.onSubmit)) {
      const [handler, data] = local.onSubmit;
      handler(data, event);
    } else if (isFunction(local.onSubmit)) {
      local.onSubmit(event);
    }
  }

  return (
    <form onSubmit={onSubmit} {...props}>
      <hgroup>
        <progress value={getStep()} max={steps.length} />
        <p>
          Step {getStep()}: {getStepLabel()}&hellip;
        </p>
      </hgroup>
      <UploadFileInput setUpload={setUpload} />
      <Show when={getUpload()}>
        {(getUpload) => {
          const mapping = getMapping();
          return (
            <section>
              <For each={normalHeaders}>
                {(normal) => (
                  <UploadHeaderSelect
                    normal={normal}
                    upload={getUpload()}
                    setMapping={setMapping}
                    value={mapping[normal]}
                  />
                )}
              </For>
            </section>
          );
        }}
      </Show>
      <Show when={getStatement()}>
        {(getStatement) => (
          <UploadTransactionPreview
            transaction={getStatement().transactions[0]}
          />
        )}
      </Show>
      <input type="submit" />
    </form>
  );
}
