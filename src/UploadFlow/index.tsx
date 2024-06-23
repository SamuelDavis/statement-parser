import { splitProps } from "solid-js";
import { ExtendProps, Upload } from "../types.ts";
import FileInput from "./FileInput.tsx";

type Props = ExtendProps<"form">;
export default function UploadFlow(props: Props) {
  const [, parent] = splitProps(props, []);

  function onUpload(data: Upload) {
    console.info(data);
  }

  function onReset() {
    console.warn("Reset");
  }

  return (
    <form {...parent}>
      <FileInput onUpload={onUpload} onReset={onReset} />
    </form>
  );
}
