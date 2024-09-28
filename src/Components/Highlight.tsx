import { TextSegment } from "../types.ts";
import { For, Show } from "solid-js";
import { segmentText } from "../utilities.ts";

type Props = { value?: RegExp; children: string };

export default function Highlight(props: Props) {
  const getSegments = (): TextSegment[] =>
    props.value
      ? segmentText(props.value, props.children)
      : [{ match: false, value: props.children }];

  return (
    <>
      <For each={getSegments()}>
        {(segment) => (
          <Show when={segment.match} fallback={segment.value}>
            <mark>{segment.value}</mark>
          </Show>
        )}
      </For>
    </>
  );
}
