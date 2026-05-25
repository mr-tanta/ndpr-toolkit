import Link from "next/link";

const pageStyle: React.CSSProperties = {
  maxWidth: 760,
  margin: "0 auto",
  padding: "2.5rem 1.5rem 4rem",
};

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: "1.25rem 1.5rem",
  marginTop: "1rem",
};

const codeStyle: React.CSSProperties = {
  background: "#f1f5f9",
  padding: "2px 6px",
  borderRadius: 4,
  fontSize: "0.875rem",
};

export default function HomePage() {
  return (
    <div style={pageStyle}>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
        DSR backend reference
      </h1>
      <p style={{ color: "#475569", lineHeight: 1.6, maxWidth: 640 }}>
        This Next.js example shows the four layers of a production-grade DSR
        submission pipeline that pairs with the{" "}
        <code style={codeStyle}>NDPRSubjectRights</code> preset from{" "}
        <code style={codeStyle}>@tantainnovative/ndpr-toolkit</code>.
      </p>

      <div style={cardStyle}>
        <h2 style={{ fontSize: "1.125rem", marginTop: 0 }}>
          What this example demonstrates
        </h2>
        <ol style={{ lineHeight: 1.7, color: "#334155", paddingLeft: "1.25rem" }}>
          <li>
            <strong>Toolkit form</strong> &mdash;{" "}
            <Link href="/dsr" style={{ color: "#2563eb" }}>
              /dsr
            </Link>{" "}
            mounts <code style={codeStyle}>NDPRSubjectRights</code> with typed{" "}
            <code style={codeStyle}>onSubmitSuccess</code> / {" "}
            <code style={codeStyle}>onSubmitError</code> callbacks.
          </li>
          <li>
            <strong>Validation</strong> &mdash; the route handler calls{" "}
            <code style={codeStyle}>validateDsrSubmission</code> from{" "}
            <code style={codeStyle}>/server</code> and adds a defense-in-depth
            email-domain blocklist.
          </li>
          <li>
            <strong>Persistence</strong> &mdash; Prisma model{" "}
            <code style={codeStyle}>DSRRequest</code> with a 30-day NDPA
            deadline. Dual-mode shim falls back to an in-memory Map when{" "}
            <code style={codeStyle}>DATABASE_URL</code> isn&apos;t set.
          </li>
          <li>
            <strong>Email confirmation</strong> &mdash; Resend SDK with a
            stdout fallback when <code style={codeStyle}>RESEND_API_KEY</code>{" "}
            isn&apos;t set. Best-effort: failure never blocks the request.
          </li>
        </ol>
      </div>

      <div style={cardStyle}>
        <h2 style={{ fontSize: "1.125rem", marginTop: 0 }}>API contract</h2>
        <p style={{ color: "#334155", lineHeight: 1.6 }}>
          <code style={codeStyle}>POST /api/dsr</code> accepts the canonical{" "}
          <code style={codeStyle}>DSRFormSubmission</code> JSON body and
          returns <code style={codeStyle}>201</code> with:
        </p>
        <pre
          style={{
            background: "#0f172a",
            color: "#e2e8f0",
            padding: "1rem",
            borderRadius: 8,
            fontSize: "0.8125rem",
            overflowX: "auto",
          }}
        >
{`{
  "referenceId": "DSR-XXX-YYYY",
  "status": "received",
  "estimatedCompletionAt": "2026-06-24T12:34:56.789Z"
}`}
        </pre>
        <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: 0 }}>
          This shape is exactly what{" "}
          <code style={codeStyle}>NDPRSubjectRights.onSubmitSuccess</code>{" "}
          reads via <code style={codeStyle}>body</code> (per CHANGELOG 3.8.1).
        </p>
      </div>

      <p style={{ marginTop: "2rem" }}>
        <Link
          href="/dsr"
          style={{
            display: "inline-block",
            padding: "0.75rem 1.25rem",
            background: "#2563eb",
            color: "#fff",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Try the form &rarr;
        </Link>
      </p>
    </div>
  );
}
