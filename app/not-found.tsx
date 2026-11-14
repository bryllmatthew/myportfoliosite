import Link from "next/link";

export default function RootNotFound() {
  return (
    <main id="main" className="dot-grid flex min-h-dvh items-center">
      <div className="container-page">
        <p className="type-metric text-[clamp(5rem,18vw,12rem)] text-line-strong">404</p>
        <h1 className="type-h2 mt-4">This page does not exist</h1>
        <p className="type-lead mt-4 max-w-lg">It may have moved, or the link is incorrect.</p>
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center rounded-full bg-signal px-5 font-medium text-signal-ink hover:bg-signal-strong"
        >
          Go to the homepage
        </Link>
      </div>
    </main>
  );
}
