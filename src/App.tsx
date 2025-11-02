import { Route, HashRouter } from "@solidjs/router";
import { lazy } from "solid-js";

const Layout = lazy(() => import("./Pages/Layout.tsx"));
const Home = lazy(() => import("./Pages/Home.tsx"));
const Upload = lazy(() => import("./Pages/Upload.tsx"));
const NotFound = lazy(() => import("./Pages/NotFound.tsx"));

import { Provider } from "./Context.tsx";

export default function App() {
  return (
    <Provider>
      <HashRouter root={Layout}>
        <Route path="/" component={Home} />
        <Route path="/upload" component={Upload} />
        <Route path="*404" component={NotFound} />
      </HashRouter>
    </Provider>
  );
}
