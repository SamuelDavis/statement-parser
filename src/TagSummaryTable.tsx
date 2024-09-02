import { For } from "solid-js";
import tagsState from "./state/tagsState.ts";
import { ExtendProps } from "./types.ts";
import HtmlIcon from "./html/HtmlIcon.tsx";
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
                    <HtmlIcon kind="edit" />
                  </th>
                  <th>
                    <HtmlIcon kind="delete" />
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
                        <HtmlIcon kind="delete" onClick={() => undefined} />
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
