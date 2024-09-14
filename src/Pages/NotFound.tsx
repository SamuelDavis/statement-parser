import Link from "../Components/Link";

export default function NotFound() {
  return (
    <article>
      <h1>Page Not Found</h1>
      <p>
        Go back <Link href="/">Home</Link>
      </p>
    </article>
  );
}
