import { Route, HashRouter } from "@solidjs/router";
import { ErrorBoundary, lazy } from "solid-js";

const Layout = lazy(() => import("./Pages/Layout.tsx"));
const Home = lazy(() => import("./Pages/Home.tsx"));
const Upload = lazy(() => import("./Pages/Upload.tsx"));
const Statements = lazy(() => import("./Pages/Statements.tsx"));
const Transactions = lazy(() => import("./Pages/Transactions.tsx"));
const Tags = lazy(() => import("./Pages/Tags.tsx"));
const NotFound = lazy(() => import("./Pages/NotFound.tsx"));

import { Provider } from "./Context.tsx";
import ErrorModal from "./Components/ErrorModal.tsx";

export default function App() {
  return (
    <ErrorBoundary
      fallback={(error: Error, reset) => (
        <ErrorModal error={error} reset={reset} />
      )}
    >
      <Provider>
        <HashRouter root={Layout}>
          <Route path="/upload" component={Upload} />
          <Route path="/statements" component={Statements} />
          <Route path="/transactions" component={Transactions} />
          <Route path="/tags" component={Tags} />
          <Route path="/tags/:id?" component={Tags} />
          <Route path="/*chart" component={Home} />
          <Route path="*404" component={NotFound} />
        </HashRouter>
      </Provider>
    </ErrorBoundary>
  );
}
