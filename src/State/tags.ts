import { createRoot } from "solid-js";
import { createSignal } from "../utilities.ts";
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

  const getTexts = () =>
    getTags()
      .map((tag) => tag.text)
      .unique();
  const getLabels = () =>
    getTags()
      .map((tag) => tag.label)
      .unique();

  return { getTags, addTags, getTexts, getLabels };
});

export default tags;
