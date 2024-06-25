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

enum Step {
  Upload,
  Mapping,
  Done,
}

const labels: Record<Step, string> = {
  [Step.Upload]: "Upload a Bank Statement",
  [Step.Mapping]: "Map Statement Columns",
  [Step.Done]: "Confirm",
};

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
  const getStep = () => {
    if (getMapping()) return Step.Done;
    if (getUpload()) return Step.Mapping;
    return Step.Upload;
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
      <label>
        <span>
          Step {getStep() + 1}: {labels[getStep()]}
        </span>
        <progress max={Step.Done} value={getStep()} />
      </label>
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
