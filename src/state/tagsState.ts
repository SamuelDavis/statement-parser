import { createRoot } from "solid-js";
import { createSignal, uniq } from "../utilities.tsx";
import { hasProperties, isArray, Tag } from "../types.ts";

const tagsState = createRoot(() => {
  const [getTags, setTags] = createSignal<Tag[]>([], {
    storageKey: "tags",
    storageParser(value) {
      if (!isArray(value)) throw new TypeError();
      return value.map((tag) => {
        if (!hasProperties(["label", "text"], tag)) throw new TypeError();
        return tag;
      });
    },
  });

  const addTag = (tag: Tag) =>
    setTags((tags) => [
      ...tags,
      ...tag.text.split("|").map((text) => ({
        text,
        label: tag.label,
      })),
    ]);
  const getLabels = () => uniq(tagsState.getTags().map((tag) => tag.label));
  const getTexts = () =>
    uniq(tagsState.getTags().flatMap((tag) => tag.text.split("|")));
  const getTagByLabel = (label: Tag["label"]): Tag => ({
    label,
    text: getTags()
      .filter((tag) => tag.label === label)
      .map((tag) => `(${tag.text})`)
      .join("|"),
  });

  return { getTags, addTag, getLabels, getTexts, getTagByLabel };
});

export default tagsState;
