import { Route, HashRouter } from "@solidjs/router";
import { lazy } from "solid-js";

const Layout = lazy(() => import("./Pages/Layout.tsx"));
const Home = lazy(() => import("./Pages/Home.tsx"));
const Upload = lazy(() => import("./Pages/Upload.tsx"));
const Statements = lazy(() => import("./Pages/Statements.tsx"));
const Transactions = lazy(() => import("./Pages/Transactions.tsx"));
const Tags = lazy(() => import("./Pages/Tags.tsx"));
const NotFound = lazy(() => import("./Pages/NotFound.tsx"));

import { Provider } from "./Context.tsx";

export default function App() {
  return (
    <Provider>
      <HashRouter root={Layout}>
        <Route path="/" component={Home} />
        <Route path="/upload" component={Upload} />
        <Route path="/statements" component={Statements} />
        <Route path="/transactions" component={Transactions} />
        <Route path="/tags" component={Tags} />
        <Route path="*404" component={NotFound} />
      </HashRouter>
    </Provider>
  );
}
