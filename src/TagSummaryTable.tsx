import { For } from "solid-js";
import tagsState from "./state/tagsState.ts";
import { ExtendProps } from "./types.ts";
import Icon from "./Icon.tsx";
import statementsState from "./state/statementsState.ts";

type Props = ExtendProps<"table">;
export default function TagSummaryTable(props: Props) {
  return (
    <table {...props}>
      <For each={tagsState.getLabels()}>
        {(label) => {
          const tags = tagsState.getTags().filter((tag) => tag.label === label);
          const transactionCount = statementsState
            .getTransactions()
            .filter((transaction) =>
              tags.some((tag) =>
                new RegExp(tag.text, "gi").test(transaction.description),
              ),
            ).length;
          return (
            <>
              <thead>
                <tr>
                  <th>
                    {label} ({transactionCount})
                  </th>
                  <td></td>
                  <th>
                    <Icon kind="edit" />
                  </th>
                  <th>
                    <Icon kind="delete" />
                  </th>
                </tr>
              </thead>
              <tbody>
                <For each={tags}>
                  {(tag) => (
                    <tr>
                      <td></td>
                      <td>{tag.text}</td>
                      <td></td>
                      <td>
                        <Icon kind="delete" onClick={() => undefined} />
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </>
          );
        }}
      </For>
    </table>
  );
  // return (
  //   <dl {...props}>
  //     <For each={tagsState.getLabels()}>
  //       {(label) => (
  //         <>
  //           <dt>{label}</dt>
  //           <For
  //             each={tagsState.getTags().filter((tag) => tag.label === label)}
  //           >
  //             {(tag) => <dd>{tag.text}</dd>}
  //           </For>
  //         </>
  //       )}
  //     </For>
  //   </dl>
  // );
}
