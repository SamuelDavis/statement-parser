import { Navigation } from "./Navigation.tsx";
import { UploadTable } from "./UploadTable.tsx";
import { For, Show, splitProps } from "solid-js";
import { statements, tags } from "./state.ts";
import { ExtendPropsChildless, NormalHeader, Statement } from "./types.ts";
import Amount from "./Amount.tsx";
import Date from "./Date.tsx";
import Modal from "./Modal.tsx";

export default function App() {
  return (
    <>
      <header>
        <Navigation />
      </header>
      <main>
        <section>
          <UploadTable />
        </section>
        <section>
          <TagTable />
        </section>
      </main>
    </>
  );
}

function TagTable(props: ExtendPropsChildless<"table">) {
  return (
    <table {...props}>
      <thead>
        <tr>
          <th>Tag</th>
          <th>Rows</th>
          <th>From</th>
          <th>To</th>
          <th>Amount</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <For each={tags.getTagsAsRegex()}>
          {(tag) => {
            const getRows = () => statements.getStatementRowsByRegex(tag.regex);
            const getDates = () => {
              const rows = getRows();
              if (rows.length === 0) return undefined;
              let from = rows[0][NormalHeader.Date];
              let to = from;
              getRows().forEach((row) => {
                const date = row[NormalHeader.Date];
                from = from.getTime() < date.getTime() ? from : date;
                to = to.getTime() > date.getTime() ? to : date;
              });
              return [from, to];
            };
            const getSumTotal = () =>
              getRows().reduce((acc, row) => acc + row[NormalHeader.Amount], 0);
            return (
              <tr>
                <td>{tag.text}</td>
                <td>{getRows().length}</td>
                <Show when={getDates()} fallback={<td colSpan={2} />}>
                  {(getDates) => (
                    <>
                      <td>
                        <Date value={getDates()[0]} />
                      </td>
                      <td>
                        <Date value={getDates()[1]} />
                      </td>
                    </>
                  )}
                </Show>
                <td>
                  <Amount value={getSumTotal()} />
                </td>
                <td>
                  <Modal
                    anchor="Details"
                    title={`${tag.text}: ${(tags.getTagsByText().get(tag.text) ?? []).join(", ")}`}
                    component={() => <TagDetails rows={getRows()} />}
                  />
                </td>
              </tr>
            );
          }}
        </For>
      </tbody>
    </table>
  );
}

function TagDetails(
  props: ExtendPropsChildless<"table", { rows: Statement["rows"] }>,
) {
  const [local, parent] = splitProps(props, ["rows"]);

  return (
    <table {...parent}>
      <thead>
        <tr>
          <th>{NormalHeader.Date}</th>
          <th>{NormalHeader.Description}</th>
          <th>{NormalHeader.Amount}</th>
        </tr>
      </thead>
      <tbody>
        <For each={local.rows}>
          {(row) => (
            <tr>
              <td>
                <Date value={row[NormalHeader.Date]} />
              </td>
              <td>{row[NormalHeader.Description]}</td>
              <td>
                <Amount value={row[NormalHeader.Amount]} />
              </td>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  );
}
