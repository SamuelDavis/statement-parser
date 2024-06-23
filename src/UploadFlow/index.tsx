import { createSignal, Show } from "solid-js";
import {
  ExtendProps,
  NormalHeader,
  normalHeaders,
  NormalRow,
  Upload,
} from "../types.ts";
import FileInput from "./FileInput.tsx";
import HeaderSelect from "./HeaderSelect.tsx";
import UploadPreview from "./UploadPreview.tsx";

function formatValue(
  normal: NormalHeader,
  value: string,
): NormalRow[typeof normal] {
  switch (normal) {
    case "date":
      return new Date(value);
    case "amount":
      return parseFloat(value);
    default:
      return value;
  }
}

type Props = ExtendProps<
  "form",
  {
    onSubmit: (e: Event, name: string, rows: NormalRow[]) => void;
  }
>;
export default function UploadFlow(props: Props) {
  const [getUpload, setUpload] = createSignal<Upload | undefined>();
  const [getMapping, setMapping] = createSignal<
    Record<NormalHeader, string> | undefined
  >();
  const getNormalRows = () => {
    const upload = getUpload();
    if (!upload) return;
    const mapping = getMapping();
    if (!mapping) return;

    return upload.rows
      .map(function (row) {
        return normalHeaders.reduce(
          (acc, normal) => ({
            ...acc,
            [normal]: formatValue(normal, row[mapping[normal]]),
          }),
          {} as NormalRow,
        );
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  function onUpload(upload?: Upload) {
    setUpload(upload);
    setMapping(undefined);
  }

  function onSubmit(e: Event) {
    e.preventDefault();
    const upload = getUpload();
    if (!upload) throw new TypeError();
    const rows = getNormalRows();
    if (!rows) throw new TypeError();
    props.onSubmit(e, upload.name, rows);
  }

  return (
    <form {...props} onSubmit={onSubmit}>
      <FileInput onUpload={onUpload} />
      <Show when={getUpload()}>
        {(getUpload) => (
          <HeaderSelect upload={getUpload()} onComplete={setMapping} />
        )}
      </Show>
      <Show when={getNormalRows()}>
        {(getRows) => <UploadPreview rows={getRows()} />}
      </Show>
      <Show when={getNormalRows()}>
        <input type="submit" />
      </Show>
    </form>
  );
}
