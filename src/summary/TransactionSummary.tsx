import { Show, splitProps } from "solid-js";
import HtmlDate from "../html/HtmlDate.tsx";
import HtmlAmount from "../html/HtmlAmount.tsx";
import { ExtendProps, Transaction } from "../types.ts";
import HtmlLabel from "../html/HtmlLabel.tsx";

type Props = ExtendProps<"aside", { transaction: Transaction }>;

export default function TransactionSummary(props: Props) {
  const [local, parent] = splitProps(props, ["transaction", "children"]);
  return (
    <aside {...parent}>
      <header role="group">
        <HtmlLabel value="Date">
          <HtmlDate value={local.transaction.date} />
        </HtmlLabel>
        <HtmlLabel value="Amount">
          <HtmlAmount value={local.transaction.amount} />
        </HtmlLabel>
      </header>
      <q>
        <Show when={local.children} fallback={local.transaction.description}>
          {local.children}
        </Show>
      </q>
    </aside>
  );
}
