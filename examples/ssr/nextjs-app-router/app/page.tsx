export default function Home() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <h1 style={{ fontSize: "1.875rem", marginBottom: "0.75rem" }}>
        SSR-safe consent on Next.js App Router
      </h1>
      <p style={{ color: "#475569", lineHeight: 1.6, marginBottom: "1rem" }}>
        The consent state is read from the <code>ndpr-consent</code> cookie inside the root layout
        Server Component, then forwarded to a client wrapper as the initial value. The banner
        therefore renders in its final visibility on the first paint — no hydration flash.
      </p>
      <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
        Choose categories in the banner, then refresh: the banner stays hidden because the cookie
        is now set and the server-rendered HTML never includes the open banner.
      </p>
    </main>
  );
}
