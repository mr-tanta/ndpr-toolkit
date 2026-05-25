import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [
  { title: "NDPR Toolkit — Remix SSR consent" },
  {
    name: "description",
    content: "Cookie-bridged SSR consent banner in Remix using @tantainnovative/ndpr-toolkit.",
  },
];

export default function Index() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <h1 style={{ fontSize: "1.875rem", marginBottom: "0.75rem" }}>
        SSR-safe consent on Remix
      </h1>
      <p style={{ color: "#475569", lineHeight: 1.6, marginBottom: "1rem" }}>
        The root loader reads the <code>ndpr-consent</code> cookie from the request, parses it,
        and exposes it via <code>useLoaderData</code> to <code>&lt;ConsentRoot&gt;</code>. The
        banner hydrates already showing or already hidden — no flash.
      </p>
      <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
        Accept categories, refresh, and watch the server-rendered HTML come back with the banner
        closed.
      </p>
    </main>
  );
}
