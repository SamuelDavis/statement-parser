import { ParentProps } from "solid-js";

import Nav from "./Components/Nav.tsx";
import Link from "./Components/Link.tsx";

export default function App(props: ParentProps) {
  return (
    <>
      <header>
        <Nav>
          <Link href="/">Home</Link>
          <Link href="/statements">Statements</Link>
          <Link href="/transactions">Transactions</Link>
          <Link href="/tags">Tags</Link>
        </Nav>
      </header>
      <main>{props.children}</main>
    </>
  );
}
