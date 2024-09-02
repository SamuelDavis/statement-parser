import { ExtendProps, isHtml, normalHeaders, Statement } from "../types.ts";
import { For, Show, splitProps } from "solid-js";
import uploadState from "../state/uploadState.ts";
import UploadInput from "./UploadInput.tsx";
import UploadTransactionPreview from "./UploadTransactionPreview.tsx";
import HeaderSelect from "./UploadHeaderSelect.tsx";

type Props = ExtendProps<
  "section",
  { onSubmit: (statement: Statement) => void },
  "children"
>;
export default function UploadFlow(props: Props) {
  const [local, parent] = splitProps(props, ["onSubmit"]);

  function onSubmit(e: Event) {
    e.preventDefault();
    const form = e.target;
    if (!isHtml("form", form)) throw new TypeError();
    const statement = uploadState.getStatement();
    if (!statement) throw new TypeError();
    local.onSubmit(statement);
  }

  return (
    <section {...parent}>
      <header>
        <progress
          value={uploadState.getStep()}
          max={uploadState.getMaxStep()}
        />
      </header>
      <form onSubmit={onSubmit}>
        <UploadInput />
        <Show when={uploadState.getHeaders()}>
          {(getHeaders) => (
            <fieldset>
              <For each={normalHeaders}>
                {(normal) => (
                  <HeaderSelect id={normal} options={getHeaders()} />
                )}
              </For>
            </fieldset>
          )}
        </Show>
        <Show when={uploadState.getStatement()}>
          {(getStatement) => (
            <UploadTransactionPreview
              transactions={getStatement().transactions.slice(0, 1)}
            />
          )}
        </Show>
        <input
          type="submit"
          disabled={!uploadState.getIsHeaderMappingComplete()}
        />
      </form>
    </section>
  );
}
