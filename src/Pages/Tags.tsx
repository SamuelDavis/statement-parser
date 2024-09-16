import { For } from "solid-js";
import tags from "../State/tags.ts";

export default function Tags() {
  return (
    <article>
      <h1>Tags</h1>
      <table>
        <thead>
          <tr>
            <th>label</th>
            <th>text</th>
          </tr>
        </thead>
        <tbody>
          <For each={tags.getTags()}>
            {(tag) => (
              <tr>
                <td>{tag.label}</td>
                <td>{tag.text}</td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </article>
  );
}
