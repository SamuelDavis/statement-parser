import { createRoot } from "solid-js";
import { createSignal, stringToRegex, uniq } from "./utils.ts";
import {
  hasProperty,
  isArray,
  isDate,
  isNumber,
  isString,
  NormalHeader,
  normalHeaders,
  Statement,
  Tag,
} from "./types.ts";

export const statements = createRoot(() => {
  const [getStatements, setStatements] = createSignal<Statement[]>([], {
    storageKey: "statements",
    storageParser(value) {
      if (!isArray(value)) throw new TypeError();
      return value.map((value) => {
        if (!hasProperty("name", value)) throw new TypeError();
        if (!hasProperty("date", value)) throw new TypeError();
        if (!hasProperty("rows", value)) throw new TypeError();
        const { name, date: dateString, rows: rowValues } = value;
        const date = new Date(dateString);
        if (!isDate(date)) throw new TypeError();
        if (!isArray(rowValues)) throw new TypeError();
        const rows = rowValues.map((value) => {
          if (!normalHeaders.every((header) => hasProperty(header, value)))
            throw new TypeError();
          const date = new Date(value[NormalHeader.Date]);
          const description = value[NormalHeader.Description];
          const amount = Number(value[NormalHeader.Amount]);
          if (!isDate(date)) throw new TypeError();
          if (!isString(description)) throw new TypeError();
          if (!isNumber(amount)) throw new TypeError();
          return {
            [NormalHeader.Date]: date,
            [NormalHeader.Description]: description,
            [NormalHeader.Amount]: amount,
          };
        });
        return { name, date, rows };
      });
    },
  });

  function statementNameExists(name: Statement["name"]): boolean {
    return getStatements().some((statement) => statement.name === name);
  }

  function addStatement(statement: Statement): Statement {
    setStatements((prev) => [
      ...prev.filter((prev) => prev.name !== statement.name),
      statement,
    ]);
    return statement;
  }

  function getStatementRows(): Statement["rows"] {
    return getStatements().flatMap((statement) => statement.rows);
  }

  function getStatementRowsByRegex(regex: RegExp) {
    return getStatementRows().filter((row) =>
      regex.test(row[NormalHeader.Description]),
    );
  }

  return {
    getStatements,
    addStatement,
    statementNameExists,
    getStatementRows,
    getStatementRowsByRegex,
  };
});

export const tags = createRoot(() => {
  const [getTags, setTags] = createSignal<Tag[]>([], {
    storageKey: "tags",
  });

  const addTag = (tag: Tag) => {
    return setTags((tags) =>
      tags.some((e) => e.text === tag.text && e.regex === tag.regex)
        ? tags
        : [...tags, tag],
    );
  };
  const getTagsByText = () => {
    return getTags().reduce(
      (acc, tag) =>
        acc.set(tag.text, [...(acc.get(tag.text) ?? []), tag.regex]),
      new Map<string, Tag["regex"][]>(),
    );
  };
  const getCompactedTags = () =>
    Array.from(getTagsByText().entries()).reduce(
      (acc, [text, regex]) => [
        ...acc,
        {
          text,
          regex: uniq(regex).join("|"),
        },
      ],
      [] as Tag[],
    );

  const getTagsAsRegex = () => {
    return getCompactedTags().map((tag) => ({
      ...tag,
      regex: stringToRegex(tag.regex),
    }));
  };

  const getTagsMatch = (text: string) => {
    return getTagsAsRegex().some((tag) => tag.regex.test(text));
  };

  const getTexts = () => uniq(getTags().map((tag) => tag.text));
  const getRegexes = () => uniq(getTags().map((tag) => tag.regex));

  return {
    addTag,
    getTagsMatch,
    getTexts,
    getRegexes,
    getTagsAsRegex,
    getTagsByText,
  };
});
