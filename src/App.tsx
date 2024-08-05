import UploadForm from "./UploadFlow/UploadForm.tsx";
import Modal from "./Modal.tsx";
import {
  hasProperty,
  isArray,
  isDate,
  isNumber,
  isString,
  NormalHeader,
  normalHeaders,
  Statement,
} from "./types.ts";
import { createSignal } from "./utils.ts";
import { For } from "solid-js";

export default function App() {
  const [getStatements, setStatements] = createSignal<Statement[]>([], {
    storageKey: "statements",
    storageParser(value) {
      if (!isArray(value)) throw new TypeError();
      return value.map((value) => {
        if (!hasProperty("name", value)) throw new TypeError();
        if (!hasProperty("date", value)) throw new TypeError();
        if (!hasProperty("rows", value)) throw new TypeError();
        const { name, date: dateString, rows: rowValues } = value;
        const date = new Date(dateString);
        if (!isDate(date)) throw new TypeError();
        if (!isArray(rowValues)) throw new TypeError();
        const rows = rowValues.map((value) => {
          if (!normalHeaders.every((header) => hasProperty(header, value)))
            throw new TypeError();
          const date = new Date(value[NormalHeader.Date]);
          const description = value[NormalHeader.Description];
          const amount = Number(value[NormalHeader.Amount]);
          if (!isDate(date)) throw new TypeError();
          if (!isString(description)) throw new TypeError();
          if (!isNumber(amount)) throw new TypeError();
          return {
            [NormalHeader.Date]: date,
            [NormalHeader.Description]: description,
            [NormalHeader.Amount]: amount,
          };
        });
        return { name, date, rows };
      });
    },
  });

  function onSubmit(close: () => void, statement: Statement) {
    if (
      getStatements().some(({ name }) => name === statement.name) &&
      !confirm(`Overwrite existing statement "${statement.name}"?`)
    )
      return;
    setStatements((prev) => [
      ...prev.filter((prev) => prev.name !== statement.name),
      statement,
    ]);
    close();
  }

  return (
    <main>
      <Modal anchor="Upload" title="Upload">
        {(close) => <UploadForm onSubmit={onSubmit.bind(null, close)} />}
      </Modal>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Date</th>
            <th>Rows</th>
          </tr>
        </thead>
        <tbody>
          <For
            each={getStatements()}
            fallback={<td colspan={3}>No statements uploaded...</td>}
          >
            {(statement) => (
              <tr>
                <td>{statement.name}</td>
                <td>{statement.date.toLocaleDateString()}</td>
                <td>{statement.rows.length.toLocaleString()}</td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </main>
  );
}
