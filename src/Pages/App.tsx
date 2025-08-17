import { Line } from "solid-chartjs";
import { For } from "solid-js";
import HTMLDate from "../Components/HTMLDate";
import HTMLNumber from "../Components/HTMLNumber";
import { app, tags } from "../state";
import { assert, groupBy, isValueOf, type Targeted } from "../types";

export default function App() {
  return (
    <article>
      <form onSubmit={onSubmit}>
        <div>
          <label for="group-by">Group By</label>
          <select name="group-by" id="group-by" onInput={onGroupBy}>
            <For each={groupBy}>
              {(value) => <option value={value}>{value}</option>}
            </For>
          </select>
        </div>
        <div>
          <label for="filter-by-tag">Filter By Tag</label>
          <select
            name="filter-by-tag"
            id="filter-by-tag"
            onInput={onFilterByTag}
          >
            <option value="">None</option>
            <For each={tags.get()}>
              {(tag) => <option value={tag.regexp.source}>{tag.value}</option>}
            </For>
          </select>
        </div>
      </form>
      <details open>
        <summary>Graph</summary>
        <Line
          data={app.getChartData()}
          options={{
            responsive: true,
            maintainAspectratio: false,
          }}
        />
      </details>
      <details>
        <summary>Table</summary>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th># Transactions</th>
              <th>Change</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <For each={app.getTableData()}>
              {(value) => (
                <tr>
                  <td>
                    <HTMLDate value={value.groupBy} />
                  </td>
                  <td>
                    <HTMLNumber
                      value={value.transactions.length}
                      currency={false}
                      precision={0}
                    />
                  </td>
                  <td>
                    <HTMLNumber value={value.change} />
                  </td>
                  <td>
                    <HTMLNumber value={value.total} />
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </details>
      <details>
        <summary>List</summary>
        <For each={app.getTableData()}>
          {(value) => (
            <section>
              <header>
                <h1>{value.groupBy.toLocaleDateString()}</h1>
              </header>
              <dl>
                <dt>total</dt>
                <dd>
                  <HTMLNumber value={value.total} />
                </dd>
                <dt>change</dt>
                <dd>
                  <HTMLNumber value={value.change} />
                </dd>
              </dl>
              <details>
                <summary>Transactions ({value.transactions.length})</summary>
                <pre>{JSON.stringify(value.transactions, null, 2)}</pre>
              </details>
            </section>
          )}
        </For>
      </details>
    </article>
  );
}

function onSubmit(event: Targeted<SubmitEvent>) {
  event.preventDefault();
}

function onGroupBy(event: Targeted<InputEvent, HTMLSelectElement>): void {
  const value = event.currentTarget.value;
  assert(isValueOf, value, groupBy);
  app.setGroupBy(value);
}

function onFilterByTag(event: Targeted<InputEvent, HTMLSelectElement>): void {
  app.setFilterByTag(event.currentTarget.value);
}
