/* @refresh reload */
import {render} from "solid-js/web";
import {Route, Router} from "@solidjs/router";
import App from "./App.tsx";
import "@picocss/pico/css/pico.classless.min.css";
import "./index.css";
import {lazy} from "solid-js";

render(
  () => (
    <Router root={App}>
      <Route path="/" component={lazy(() => import("./Pages/Dashboard.tsx"))} />
      <Route
        path="/statements"
        component={lazy(() => import("./Pages/Statements.tsx"))}
      />
      <Route
        path="/transactions"
        component={lazy(() => import("./Pages/Transactions.tsx"))}
      />
      <Route path="/tags" component={lazy(() => import("./Pages/Tags.tsx"))} />
      <Route
        path="*404"
        component={lazy(() => import("./Pages/NotFound.tsx"))}
      />
    </Router>
  ),
  document.body,
);

Array.prototype.unique = function (cb = (v, i, a) => a.indexOf(v) === i) {
  return this.filter(cb);
};
