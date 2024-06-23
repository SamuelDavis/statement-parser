import { createEffect, createSignal, Show, splitProps } from "solid-js";
import { ExtendProps, NormalHeader, normalHeaders, Upload } from "../types.ts";
import FileInput from "./FileInput.tsx";
import HeaderSelect from "./HeaderSelect.tsx";

type Props = ExtendProps<"form">;
export default function UploadFlow(props: Props) {
  const [, parent] = splitProps(props, []);
  const [getUpload, setUpload] = createSignal<Upload | undefined>();
  const [, setMapping] = createSignal<Partial<Record<NormalHeader, any>>>({});

  createEffect(() => {
    const header = getUpload()?.headers[0] ?? null;
    setMapping((mapping) =>
      header
        ? normalHeaders.reduce(
            (acc, normal) => ({ ...acc, [normal]: header }),
            mapping,
          )
        : {},
    );
  });

  function onReset() {
    setUpload(undefined);
  }

  return (
    <form {...parent}>
      <FileInput onUpload={setUpload} onReset={onReset} />
      <Show when={getUpload()}>
        {(getData) => (
          <HeaderSelect data={getData()} onComplete={console.log} />
        )}
      </Show>
    </form>
  );
}
