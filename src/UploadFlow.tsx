import UploadInput from "./UploadInput.tsx";
import { For, Show, splitProps } from "solid-js";
import { ExtendProps, isHtml, normalHeaders, Statement } from "./types.ts";
import HeaderSelect from "./HeaderSelect.tsx";
import Date from "./Date.tsx";
import Amount from "./Amount.tsx";
import uploadState from "./state/uploadState.ts";

type Props = ExtendProps<
  "section",
  {
    onSubmit: (statement: Statement) => void;
  },
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
            <details open>
              <summary>Sample Results</summary>
              <p>Does this look right?</p>
              <table>
                <thead>
                  <tr>
                    <For each={normalHeaders}>
                      {(normal) => <th>{normal}</th>}
                    </For>
                  </tr>
                </thead>
                <tbody>
                  <For each={getStatement().transactions.slice(0, 3)}>
                    {(row) => (
                      <tr>
                        <For each={normalHeaders}>
                          {(normal) => {
                            switch (normal) {
                              case "date":
                                return (
                                  <td>
                                    <Date value={row[normal]} />
                                  </td>
                                );
                              case "description":
                                return <td>{row[normal]}</td>;
                              case "amount":
                                return (
                                  <td>
                                    <Amount value={row[normal]} />
                                  </td>
                                );
                            }
                          }}
                        </For>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </details>
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
