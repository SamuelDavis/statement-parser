import {
  createContext,
  createMemo,
  createSignal,
  useContext,
  type ParentProps,
} from "solid-js";
import { persist } from "@samueldavis/solidlib";
import { decodeStatements, decodeTags } from "./storage";
import { isMatch, toTagRegExp } from "../utils/matching";
import {
  type Statement,
  type Tag,
  type TaggedTransaction,
  type Transaction,
  untagged,
} from "../types";

type AppState = ReturnType<typeof createAppState>;

const AppStateContext = createContext<AppState>();

export function AppStateProvider(props: ParentProps) {
  return (
    <AppStateContext.Provider value={createAppState()}>
      {props.children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx)
    throw new Error("useAppState must be used inside <AppStateProvider>");
  return ctx;
}

function createAppState() {
  const [getStatements, setStatements] = persist(
    createSignal<Statement[]>([]),
    { key: "statements", decode: decodeStatements },
  );
  const [getTags, setTags] = persist(createSignal<Tag[]>([]), {
    key: "tags",
    decode: decodeTags,
  });

  const getTransactions = createMemo((): Transaction[] => {
    const unique = new Map<string, Transaction>();
    for (const statement of getStatements())
      for (const transaction of statement.transactions) {
        const key = `${transaction.date.getTime()}|${transaction.description}|${transaction.amount}`;
        if (!unique.has(key)) unique.set(key, transaction);
      }
    return [...unique.values()].sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    );
  });

  const getTagRegExps = createMemo(() =>
    getTags().map((tag) => ({ label: tag.label, regexp: toTagRegExp(tag) })),
  );

  const getTaggedTransactions = createMemo((): TaggedTransaction[] => {
    const tagRegExps = getTagRegExps();
    return getTransactions().map((transaction): TaggedTransaction => {
      const tags = tagRegExps
        .filter((tag) => isMatch(transaction.description, tag.regexp))
        .map((tag) => tag.label);
      return { ...transaction, tags: tags.length > 0 ? tags : [untagged] };
    });
  });

  const getTagLabels = createMemo((): Tag["label"][] =>
    getTags().map((tag) => tag.label),
  );

  function findTag(label: Tag["label"]): undefined | Tag {
    return getTags().find((tag) => tag.label === label);
  }

  function addStatement(statement: Statement): void {
    setStatements((statements) => [...statements, statement]);
  }

  function removeStatement(statement: Statement): void {
    setStatements((statements) =>
      statements.filter((other) => other !== statement),
    );
  }

  function addMatcher(label: Tag["label"], matcher: string): void {
    if (!findTag(label)) {
      setTags((tags) => [...tags, { label, matchers: [matcher] }]);
      return;
    }
    setTags((tags) =>
      tags.map((tag) =>
        tag.label === label && !tag.matchers.includes(matcher)
          ? { ...tag, matchers: [...tag.matchers, matcher] }
          : tag,
      ),
    );
  }

  function removeMatcher(label: Tag["label"], matcher: string): void {
    setTags((tags) =>
      tags
        .map((tag) =>
          tag.label === label
            ? { ...tag, matchers: tag.matchers.filter((m) => m !== matcher) }
            : tag,
        )
        .filter((tag) => tag.matchers.length > 0),
    );
  }

  function renameTag(from: Tag["label"], to: Tag["label"]): void {
    const source = findTag(from);
    if (!source || from === to || to === untagged) return;
    setTags((tags) => tags.filter((tag) => tag !== source));
    for (const matcher of source.matchers) addMatcher(to, matcher);
  }

  return {
    getStatements,
    getTags,
    getTagLabels,
    getTaggedTransactions,
    findTag,
    addStatement,
    removeStatement,
    addMatcher,
    removeMatcher,
    renameTag,
  };
}
