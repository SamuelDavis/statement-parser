import { For } from "solid-js";
import Statements from "../State/statements.ts";
import DateStamp from "../Components/DateStamp.tsx";
import Amount from "../Components/Amount.tsx";
import Anchor from "../Components/Anchor";
import TaggingModal from "../Tagging/TaggingModal";
import derived from "../State/derived.ts";
import tags from "../State/tags.ts";
import Icon from "../Components/Icon.tsx";

export default function Transactions() {
  return (
    <article>
      <header>
        <h1>Transactions</h1>
      </header>
      <section>
        <Anchor
          modal={TaggingModal}
          disabled={derived.getUntaggedTransactions().length === 0}
        >
          <Icon value="tag" />
          <span>Tag Untagged Transactions</span>
        </Anchor>
      </section>
      <section>
        <For each={Statements.getTransactions()}>
          {(transaction) => (
            <article>
              <dl role="group">
                <dt>Date</dt>
                <dd>
                  <DateStamp value={transaction.date} />
                </dd>
                <dt>Amount</dt>
                <dd>
                  <Amount value={transaction.amount} />
                </dd>
              </dl>
              <q>{transaction.description}</q>
              <footer>
                <ul role="list">
                  <For each={tags.getTagsByTransaction(transaction)}>
                    {(tag) => (
                      <li title="tag">
                        <Icon value="tag" />
                        <small>{tag.label}</small>
                      </li>
                    )}
                  </For>
                </ul>
              </footer>
            </article>
          )}
        </For>
      </section>
    </article>
  );
}
