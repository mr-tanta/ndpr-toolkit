import "@tantainnovative/ndpr-toolkit/styles";
import Link from "next/link";

export const metadata = {
  title: "NDPR DSR backend — production reference",
  description:
    "A runnable Next.js reference implementation of a production-grade DSR submission backend that pairs with the NDPRSubjectRights preset.",
};

const navStyle: React.CSSProperties = {
  display: "flex",
  gap: "1.25rem",
  flexWrap: "wrap",
  padding: "1rem 1.5rem",
  borderBottom: "1px solid #e2e8f0",
  background: "#fff",
  position: "sticky",
  top: 0,
  zIndex: 10,
};

const linkStyle: React.CSSProperties = {
  color: "#0f172a",
  textDecoration: "none",
  fontWeight: 500,
  fontSize: "0.9375rem",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          margin: 0,
          background: "#f8fafc",
          color: "#0f172a",
        }}
      >
        <nav style={navStyle}>
          <Link href="/" style={{ ...linkStyle, fontWeight: 700 }}>
            DSR backend example
          </Link>
          <Link href="/dsr" style={linkStyle}>
            Submit a request
          </Link>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
