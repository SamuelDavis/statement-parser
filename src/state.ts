import { createRoot } from "solid-js";
import { createSignal, regexToString, stringToRegex } from "./utils.ts";
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

  function addStatement(statement: Statement) {
    setStatements((prev) => [
      ...prev.filter((prev) => prev.name !== statement.name),
      statement,
    ]);
    return statement;
  }

  function getStatementRows() {
    return getStatements().flatMap((statement) => statement.rows);
  }

  return {
    getStatements,
    addStatement,
    statementNameExists,
    getStatementRows,
  };
});
export const tags = createRoot(() => {
  const [getTags, setTags] = createSignal<Tag[]>([], {
    storageKey: "tags",
    storageEncoder(value) {
      return JSON.stringify(
        value.map(({ text, regex }) => ({ text, regex: regexToString(regex) })),
      );
    },
    storageParser(value) {
      if (!isArray(value)) throw new TypeError();
      return value.map(function (value): Tag {
        if (!hasProperty("text", value)) throw new TypeError();
        if (!hasProperty("regex", value)) throw new TypeError();
        const regex = stringToRegex(value.regex);
        return { text: value.text, regex };
      });
    },
  });

  function isSameTag(a: Tag, b: Tag): boolean {
    return (
      a.text === b.text && regexToString(a.regex) === regexToString(b.regex)
    );
  }

  function addTag(tag: Tag): Tag {
    setTags((tags) => [
      ...tags.filter((existing) => !isSameTag(existing, tag)),
      tag,
    ]);
    return tag;
  }

  return {
    getTags,
    addTag,
  };
});
