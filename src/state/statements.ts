import { createRoot, createSignal } from "solid-js";
import { Statement } from "../types.ts";

const statements = createRoot(() => {
  const [getStatements, setStatements] = createSignal<Statement[]>([]);
  const statementExists = (statement: Statement) =>
    getStatements().some((existing) => existing.name === statement.name);
  const addStatement = (statement: Statement) => {
    setStatements((statements) => [...statements, statement]);
  };

  return { statementExists, addStatement };
});

export default statements;
