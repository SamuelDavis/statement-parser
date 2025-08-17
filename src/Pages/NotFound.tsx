import { A } from "@solidjs/router";

export default function NotFound() {
  return (
    <article>
      <h1>Not Found</h1>
      <p>
        Go back <A href="/">Home</A>
      </p>
    </article>
  );
}
