import { A } from "@solidjs/router";
import type { ParentProps } from "solid-js";

export default function Layout(props: ParentProps) {
  return (
    <>
      <header>
        <nav>
          <ul>
            <li>
              <A href="/">Home</A>
            </li>
            <li>
              <A href="/upload">Upload</A>
            </li>
            <li>
              <A href="/transactions">Transactions</A>
            </li>
          </ul>
        </nav>
      </header>
      <main>{props.children}</main>
    </>
  );
}
