import "@tantainnovative/ndpr-toolkit/styles";
import Link from "next/link";
import { ConsentRoot } from "./ConsentRoot";

export const metadata = {
  title: "Zuri Market — NDPR ecommerce starter",
  description:
    "A multi-page Next.js example wiring the NDPR toolkit into a Nigerian ecommerce flow.",
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
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, background: "#f8fafc", color: "#0f172a" }}>
        <nav style={navStyle}>
          <Link href="/" style={{ ...linkStyle, fontWeight: 700 }}>Zuri Market</Link>
          <Link href="/checkout" style={linkStyle}>Checkout</Link>
          <Link href="/privacy" style={linkStyle}>Privacy notice</Link>
          <Link href="/dsr" style={linkStyle}>Your data rights</Link>
          <Link href="/cookie-preferences" style={linkStyle}>Cookie preferences</Link>
        </nav>
        <main>{children}</main>
        <ConsentRoot />
      </body>
    </html>
  );
}
