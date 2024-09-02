import HtmlModal from "./html/HtmlModal.tsx";
import statementsState from "./state/statementsState.ts";
import TaggingForm from "./TaggingForm.tsx";
import { ExtendProps } from "./types.ts";

type Props = ExtendProps<typeof HtmlModal, {}, "header" | "body">;

export default function TaggingModal(props: Props) {
  return (
    <HtmlModal
      {...props}
      header={`${statementsState.getUntaggedTransactionCount()} untagged transactions remain.`}
      body={TaggingForm}
    />
  );
}
