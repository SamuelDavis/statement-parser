import { createSignal, For, Show, splitProps } from "solid-js";
import {
  ExtendPropsChildless,
  hasEveryProperty,
  isDate,
  isHtml,
  isNumber,
  NormalHeader,
  normalHeaders,
  Statement,
  Upload,
} from "../types.ts";
import StatementUpload from "./StatementUpload.tsx";
import HeaderSelect from "./HeaderSelect.tsx";
import StatementPreview from "./StatementPreview.tsx";

type Props = ExtendPropsChildless<
  "form",
  {
    onSubmit: (statement: Statement) => void;
  }
>;
export default function UploadForm(props: Props) {
  const [local, parent] = splitProps(props, ["onSubmit"]);
  const [getUpload, setUpload] = createSignal<undefined | Upload>();
  const [getHeaderMapping, setHeaderMapping] = createSignal<
    Partial<Record<NormalHeader, string>>
  >({});
  const getStatement = () => {
    const upload = getUpload();
    const mapping = getHeaderMapping();
    if (!upload || !hasEveryProperty(normalHeaders, mapping)) return undefined;

    const { name, rows } = upload;

    return {
      name,
      date: new Date(),
      rows: rows.map((row) =>
        normalHeaders.reduce(
          (acc, normal) => {
            const header = mapping[normal];
            if (!header) throw new TypeError();
            switch (normal) {
              case NormalHeader.Date: {
                const value = new Date(row[header]);
                if (!isDate(value)) throw new TypeError();
                return { ...acc, [normal]: value };
              }
              case NormalHeader.Description:
                return { ...acc, [normal]: row[header] };
              case NormalHeader.Amount: {
                const value = Number(row[header]);
                if (!isNumber(value)) throw new TypeError();
                return { ...acc, [normal]: value };
              }
              default:
                throw new TypeError();
            }
          },
          {} as Statement["rows"][number],
        ),
      ),
    };
  };

  function onHeaderSelect(value: undefined | string, normal: NormalHeader) {
    setHeaderMapping(({ [normal]: _, ...rest }) =>
      value === undefined ? rest : { ...rest, [normal]: value },
    );
  }

  function onSubmit(e: Event) {
    e.preventDefault();
    const form = e.target;
    if (!isHtml("form", form)) throw new TypeError();

    const statement = getStatement();
    if (!statement) return;

    local.onSubmit(statement);
  }

  return (
    <form onSubmit={onSubmit} {...parent}>
      <StatementUpload onUpload={setUpload} />
      <Show when={getUpload()}>
        {(getUpload) => (
          <For each={normalHeaders}>
            {(normal) => (
              <HeaderSelect
                upload={getUpload()}
                normal={normal}
                onInput={onHeaderSelect}
              />
            )}
          </For>
        )}
      </Show>
      <Show when={getStatement()}>
        {(getStatement) => (
          <fieldset>
            <legend>Does this look right?</legend>
            <StatementPreview statement={getStatement()} />
            <input type="submit" />
          </fieldset>
        )}
      </Show>
    </form>
  );
}
