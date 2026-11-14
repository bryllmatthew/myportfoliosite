"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ background: "#0c1322", color: "#e9edf5", fontFamily: "system-ui, sans-serif", padding: "4rem 1.5rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>The site could not load</h1>
        <p style={{ color: "#9aa4ba", marginBottom: "2rem" }}>Please try again in a moment.</p>
        <button
          type="button"
          onClick={reset}
          style={{ background: "#ffb547", color: "#1d1404", border: 0, borderRadius: 999, padding: "0.75rem 1.5rem", fontWeight: 600 }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
