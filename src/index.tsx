/* @refresh reload */
import { render } from "solid-js/web";
import { Router } from "@solidjs/router";
import App from "./App.tsx";
import "@picocss/pico/css/pico.classless.min.css";
import { lazy } from "solid-js";

const routes: Record<string, string> = {
  "/": "./Pages/Dashboard.tsx",
  "/statements": "./Pages/Statements.tsx",
  "/transactions": "./Pages/Transactions.tsx",
  "/tags": "./Pages/Tags.tsx",
  "*404": "./Pages/NotFound.tsx",
};

render(
  () => (
    <Router root={App}>
      {Object.entries(routes).map(([uri, filepath]) => ({
        path: uri,
        component: lazy(() => import(/* @vite-ignore */ filepath)),
      }))}
    </Router>
  ),
  document.body,
);
