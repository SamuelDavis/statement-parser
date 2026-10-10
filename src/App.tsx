import { lazy } from "solid-js";
import { Route, HashRouter as Router } from "@solidjs/router";
import Layout from "./Pages/Layout";
import { AppStateProvider } from "./state/AppState";

const Insights = lazy(() => import("./Pages/Insights"));
const Import = lazy(() => import("./Pages/Import"));
const Tagging = lazy(() => import("./Pages/Tagging"));
const Tags = lazy(() => import("./Pages/Tags"));
const NotFound = lazy(() => import("./Pages/NotFound"));

export default function App() {
  return (
    <AppStateProvider>
      <Router root={Layout}>
        <Route path="/" component={Insights} />
        <Route path="/import" component={Import} />
        <Route path="/tagging" component={Tagging} />
        <Route path="/tags" component={Tags} />
        <Route path="*404" component={NotFound} />
      </Router>
    </AppStateProvider>
  );
}
