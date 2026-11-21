import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="editorial">
      <div className="reading">
        <p className="eyebrow">Page unavailable</p>
        <h1>
          This chamber is <em>empty.</em>
        </h1>
        <Link className="button" href="/work">
          Explore the archive →
        </Link>
      </div>
    </main>
  );
}
