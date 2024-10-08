import { createMemo, createRoot } from "solid-js";
import { createSignal, textToRegexp, uniq } from "../utilities.tsx";
import { hasProperties, isArray, Tag, Transaction } from "../types.ts";

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

  const addTag = (tag: Tag) => setTags((tags) => [...tags, tag]);
  const getLabels = createMemo(() => uniq(getTags().map((tag) => tag.label)));
  const getTexts = createMemo(() => uniq(getTags().map((tag) => tag.text)));
  const getRegexps = createMemo(() => getTexts().map(textToRegexp));

  function getTagByLabel(label: Tag["label"]): undefined | Tag {
    const text = getTags()
      .filter((tag) => tag.label === label)
      .map((tag) => `(${tag.text})`)
      .join("|");
    return text ? { label, text } : undefined;
  }

  function isTagged(transaction: Transaction): boolean {
    return getRegexps().some((regexp) => regexp.test(transaction.description));
  }

  return { getTags, addTag, getLabels, getTexts, getTagByLabel, isTagged };
});

export default tagsState;
