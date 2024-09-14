import { splitProps } from "solid-js";
import DateStamp from "../Components/DateStamp.tsx";
import Amount from "../Components/Amount.tsx";
import { ExtendProps, Transaction } from "../types.ts";

type Props = ExtendProps<"aside", { transaction: Transaction }>;

export default function UploadTransactionPreview(props: Props) {
  const [local, parent] = splitProps(props, ["transaction"]);
  return (
    <aside {...parent}>
      <hgroup>
        <h5>Sample Transaction</h5>
        <p>Does this look right?</p>
      </hgroup>
      <dl role="group">
        <dt>Date</dt>
        <dd>
          <DateStamp value={local.transaction.date} />
        </dd>
        <dt>Amount</dt>
        <dd>
          <Amount value={local.transaction.amount} />
        </dd>
      </dl>
      <p>
        <q>{local.transaction.description}</q>
      </p>
    </aside>
  );
}
