import { For, splitProps } from "solid-js";
import { type ExtendProps, isArray, isNonNullable, type Match } from "../types";

type Props = ExtendProps<
  "span",
  {
    value: Match[] | string;
    mark?: RegExp;
  },
  "children"
>;

export default function HTMLText(props: Props) {
  const [local, parent] = splitProps(props, ["value", "mark"]);
  const getMatches = (): Match[] => {
    if (isArray(local.value)) return local.value;
    return HTMLText.parseMatches(local.value, local.mark);
  };
  return (
    <span {...parent}>
      <For each={getMatches()}>
        {(match) => (match.match ? <mark>{match.text}</mark> : match.text)}
      </For>
    </span>
  );
}
HTMLText.parseMatches = (text: string, mark?: RegExp): Match[] => {
  const result: Match[] = [];
  if (isNonNullable(mark)) {
    const matches = text.matchAll(mark);
    let from = 0;
    for (const {
      0: { length },
      index,
    } of matches) {
      const to = index + length;
      result.push({
        match: false,
        text: text.slice(from, index),
      });
      result.push({
        match: true,
        text: text.slice(index, to),
      });
      from = to;
    }
    if (from < text.length)
      result.push({
        match: false,
        text: text.slice(from),
      });
  } else {
    result.push({ match: false, text: text });
  }
  return result;
};
