import Link from "next/link";

interface ConfirmationPageProps {
  searchParams: Promise<{ ref?: string; eta?: string }>;
}

const pageStyle: React.CSSProperties = {
  maxWidth: 640,
  margin: "0 auto",
  padding: "3rem 1.5rem 4rem",
};

const cardStyle: React.CSSProperties = {
  background: "#ecfdf5",
  border: "1px solid #6ee7b7",
  color: "#065f46",
  borderRadius: 12,
  padding: "1.5rem 1.75rem",
};

const codeStyle: React.CSSProperties = {
  background: "#fff",
  padding: "2px 8px",
  borderRadius: 4,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: "0.9375rem",
  color: "#064e3b",
};

function formatDeadline(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default async function DsrConfirmationPage({
  searchParams,
}: ConfirmationPageProps) {
  const params = await searchParams;
  const ref = params.ref;
  const eta = params.eta;

  if (!ref) {
    return (
      <div style={pageStyle}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Missing reference
        </h1>
        <p style={{ color: "#475569" }}>
          This page expects a <code>?ref=</code> query parameter. Submit a
          request from the{" "}
          <Link href="/dsr" style={{ color: "#2563eb" }}>
            data rights form
          </Link>{" "}
          to land here.
        </p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={{ fontSize: "1.5rem", marginTop: 0, marginBottom: "0.75rem" }}>
          Request received
        </h1>
        <p style={{ lineHeight: 1.6, marginTop: 0 }}>
          Your reference is <code style={codeStyle}>{ref}</code>.
          {eta && (
            <>
              {" "}
              We&apos;ll respond by <strong>{formatDeadline(eta)}</strong>{" "}
              &mdash; within the 30-day NDPA Section 34 window.
            </>
          )}
        </p>
        <p style={{ marginBottom: 0, fontSize: "0.9375rem" }}>
          A confirmation email is on its way. Save the reference &mdash;
          you&apos;ll need it if you contact us about this request.
        </p>
      </div>

      <p style={{ marginTop: "2rem" }}>
        <Link href="/" style={{ color: "#2563eb" }}>
          &larr; Back to overview
        </Link>
      </p>
    </div>
  );
}
