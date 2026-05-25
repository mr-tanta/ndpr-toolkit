import Link from "next/link";

const products = [
  {
    id: "ankara-tote",
    name: "Adire Ankara tote",
    price: 18500,
    description: "Hand-stitched Lagos-made tote in indigo adire.",
  },
  {
    id: "kente-pouch",
    name: "Kente pocket pouch",
    price: 7200,
    description: "Small zip pouch lined with cotton, woven in Aba.",
  },
  {
    id: "shea-set",
    name: "Northern shea butter set",
    price: 12400,
    description: "Three 100g tubs of unrefined shea, sourced from Kano cooperatives.",
  },
];

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const pageStyle: React.CSSProperties = {
  maxWidth: 960,
  margin: "0 auto",
  padding: "2.5rem 1.5rem 4rem",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "1.25rem",
  marginTop: "1.75rem",
};

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: "1.25rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
};

const footerStyle: React.CSSProperties = {
  marginTop: "3rem",
  padding: "1.5rem",
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  fontSize: "0.875rem",
  color: "#475569",
  lineHeight: 1.6,
};

export default function HomePage() {
  return (
    <div style={pageStyle}>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Zuri Market</h1>
      <p style={{ color: "#475569", lineHeight: 1.6, maxWidth: 640 }}>
        A fictional Nigerian retailer showing how the NDPR toolkit fits into a
        realistic ecommerce flow: consent banner, privacy notice, data-subject
        rights portal, and an editable cookie preferences page — all working
        together.
      </p>

      <div style={gridStyle}>
        {products.map((p) => (
          <article key={p.id} style={cardStyle}>
            <h2 style={{ fontSize: "1.0625rem", margin: 0 }}>{p.name}</h2>
            <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>{p.description}</p>
            <strong style={{ color: "#0f172a", fontSize: "1.125rem", marginTop: "auto" }}>
              {naira.format(p.price)}
            </strong>
            <Link
              href="/checkout"
              style={{ color: "#2563eb", textDecoration: "none", fontSize: "0.875rem" }}
            >
              Add to cart and checkout
            </Link>
          </article>
        ))}
      </div>

      <footer style={footerStyle}>
        <strong style={{ color: "#0f172a" }}>Section 27 disclosure.</strong>{" "}
        Zuri Market Ltd (RC 0000000) is the data controller for personal data
        you share on this site. We process your data to fulfil orders (NDPA
        Section 25(1)(b)) and, with your consent, for analytics, marketing,
        and personalisation. Read the full notice in our{" "}
        <Link href="/privacy" style={{ color: "#2563eb" }}>privacy notice</Link>{" "}
        or exercise your rights via the{" "}
        <Link href="/dsr" style={{ color: "#2563eb" }}>data rights portal</Link>.
      </footer>
    </div>
  );
}
