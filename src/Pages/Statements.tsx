import { For, useContext, splitProps, createSignal } from "solid-js";
import { AppState } from "../Context";
import HTMLDate from "../Components/HTMLDate";
import HTMLNumber from "../Components/HTMLNumber";
import TransactionsSummary from "../Components/TransactionsSummary";
import {
  assert,
  HTMLIcon,
  isNonNullable,
  Modal,
  type ExtendProps,
} from "@samueldavis/solidlib";
import type { Statement } from "../types";

export default function Statements() {
  const state = useContext(AppState);
  assert(isNonNullable, state);

  return (
    <article>
      <For each={state.getStatements()}>
        {(statement) => (
          <Statement statement={statement} onRemove={state.removeStatement} />
        )}
      </For>
    </article>
  );
}

type StatementProps = ExtendProps<
  "article",
  { statement: Statement; onRemove: (statement: Statement) => void }
>;

function Statement(props: StatementProps) {
  const state = useContext(AppState);
  assert(isNonNullable, state);
  const [local, parent] = splitProps(props, ["statement", "onRemove"]);
  const [getRemovePrompt, setRemovePrompt] = createSignal(false);

  function onRemoveApprove(): void {
    local.onRemove(local.statement);
  }

  function onRemoveCancel(): void {
    setRemovePrompt(false);
  }

  return (
    <article {...parent}>
      <Modal when={getRemovePrompt()} onClose={onRemoveCancel}>
        <article>
          <header>
            <strong>Delete {local.statement.name}?</strong>
            <a rel="prev" onClick={onRemoveCancel} />
          </header>
          <TransactionsSummary transactions={local.statement.rows} />
          <footer>
            <button onClick={onRemoveApprove}>Yes</button>
            <button class="contrast" onclick={onRemoveCancel}>
              No
            </button>
          </footer>
        </article>
      </Modal>
      <header>
        <h2>
          <span>{local.statement.name}</span>
          <HTMLIcon type="delete" onClick={[setRemovePrompt, true]} />
        </h2>
        <HTMLDate value={local.statement.date} />
      </header>
      <TransactionsSummary transactions={local.statement.rows} />
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <For each={local.statement.rows.slice(0, 3)}>
            {(row) => (
              <tr>
                <td>
                  <HTMLDate value={row.date} />
                </td>
                <td>{row.description}</td>
                <td>{<HTMLNumber value={row.amount} highlight money />}</td>
              </tr>
            )}
          </For>
          <tr>
            <td colspan={3}>...</td>
          </tr>
        </tbody>
      </table>
    </article>
  );
}
