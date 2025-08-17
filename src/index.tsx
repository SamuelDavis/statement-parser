/* @refresh reload */

import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";
import "@picocss/pico/css/pico.classless.min.css";
import "./index.css";
import { lazy } from "solid-js";

const Layout = lazy(() => import("./Pages/Layout.tsx"));
const App = lazy(() => import("./Pages/App.tsx"));
const Statements = lazy(() => import("./Pages/Statements.tsx"));
const Upload = lazy(() => import("./Pages/Upload.tsx"));
const Transactions = lazy(() => import("./Pages/Transactions.tsx"));
const Tags = lazy(() => import("./Pages/Tags.tsx"));
const Tagging = lazy(() => import("./Pages/Tagging.tsx"));
const NotFound = lazy(() => import("./Pages/NotFound.tsx"));

render(
  () => (
    <Router root={Layout}>
      <Route path="/" component={App} />
      <Route path="/upload" component={Upload} />
      <Route path="/statements" component={Statements} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/tags" component={Tags} />
      <Route path="/tagging" component={Tagging} />
      <Route path="*404" component={NotFound} />
    </Router>
  ),
  document.body,
);
