import { For } from "solid-js";

export default function Highlighted(props: { value: string; regexp?: RegExp }) {
  type Match = { value: string; match: boolean };
  const getMatches = (): Match[] => {
    if (!props.regexp) return [{ value: props.value, match: false }];

    const matches: Match[] = [];
    let from = 0;
    for (const { 0: text, index: start } of props.value.matchAll(
      props.regexp,
    )) {
      if (start > from)
        matches.push({ value: props.value.slice(from, start), match: false });

      const to = start + text.length;
      matches.push({ value: text, match: true });
      from = to;
    }
    if (from < props.value.length)
      matches.push({ value: props.value.slice(from), match: false });

    return matches;
  };

  return (
    <span>
      <For each={getMatches()}>
        {({ value, match }) =>
          match ? <mark>{value}</mark> : <span>{value}</span>
        }
      </For>
    </span>
  );
}
