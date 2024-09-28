import { createMemo, createRoot } from "solid-js";
import { createSignal, stringToRegexp } from "../utilities.ts";
import { hasProperties, isArray } from "../types.ts";

type Tag = { text: string; label: string };
const tags = createRoot(() => {
  const [getTags, setTags] = createSignal<Tag[]>([], {
    storageKey: "tags",
    storageParser(value: any): Tag[] {
      if (!isArray(value)) throw new TypeError();
      return value.map((value) => {
        if (!hasProperties(["text", "label"], value)) throw new TypeError();
        return value;
      });
    },
  });

  const addTags = (...tags: Tag[]) =>
    setTags((existing) => [
      ...existing,
      ...tags.filter(
        (t1) =>
          !existing.some((t2) => t1.label === t2.label && t1.text === t2.text),
      ),
    ]);

  const getTexts = createMemo(() =>
    getTags()
      .map((tag) => tag.text)
      .unique(),
  );
  const getLabels = createMemo(() =>
    getTags()
      .map((tag) => tag.label)
      .unique(),
  );
  const getRegexps = createMemo(() => getTexts().map(stringToRegexp));

  return { getTags, addTags, getTexts, getLabels, getRegexps };
});

export default tags;
