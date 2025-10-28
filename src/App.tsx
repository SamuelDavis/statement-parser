import { Route, HashRouter } from "@solidjs/router";
import { lazy } from "solid-js";

const Layout = lazy(() => import("./Pages/Layout.tsx"));
const Home = lazy(() => import("./Pages/Home.tsx"));
const NotFound = lazy(() => import("./Pages/NotFound.tsx"));

export default function App() {
  return (
    <HashRouter root={Layout}>
      <Route path="/" component={Home} />
      <Route path="*404" component={NotFound} />
    </HashRouter>
  );
}
