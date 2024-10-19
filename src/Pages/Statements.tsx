import { For } from "solid-js";
import statements from "../State/statements.ts";
import DateStamp from "../Components/DateStamp.tsx";
import Number from "../Components/Number.tsx";
import Anchor from "../Components/Anchor";
import UploadModal from "../Upload/UploadModal";
import Icon from "../Components/Icon";

export default function Statements() {
  return (
    <article>
      <header role="group">
        <h1>Statements</h1>
      </header>
      <section>
        <Anchor modal={UploadModal}>
          <Icon value="upload" />
          <span>Upload a new Bank Statement</span>
        </Anchor>
      </section>
      <section>
        <For
          each={statements.getStatements()}
          fallback={<p>You have no statements saved.</p>}
        >
          {(statement) => (
            <article>
              <hgroup>
                <h3>{statement.name}</h3>
                <DateStamp value={statement.date} />
              </hgroup>
              <dl>
                <dt>Total Transactions</dt>
                <dd>
                  <Number value={statement.transactions.length} />
                </dd>
              </dl>
            </article>
          )}
        </For>
      </section>
    </article>
  );
}
