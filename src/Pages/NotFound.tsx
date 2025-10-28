import { A } from "@solidjs/router";

export default function NotFound() {
  return (
    <article>
      <h1>Not Found</h1>
      <p>
        Try going <A href="/">Home</A>
      </p>
    </article>
  );
}
