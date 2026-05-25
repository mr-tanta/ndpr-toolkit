import Link from "next/link";

const pageStyle: React.CSSProperties = {
  maxWidth: 640,
  margin: "0 auto",
  padding: "2.5rem 1.5rem 4rem",
};

const fieldStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.35rem",
  marginBottom: "1rem",
};

const inputStyle: React.CSSProperties = {
  padding: "0.625rem 0.75rem",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  fontSize: "0.9375rem",
  background: "#fff",
};

const noticeStyle: React.CSSProperties = {
  background: "#f1f5f9",
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  padding: "1rem 1.25rem",
  fontSize: "0.875rem",
  lineHeight: 1.6,
  color: "#334155",
  margin: "1.5rem 0",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.85rem 1rem",
  background: "#0f172a",
  color: "#fff",
  border: 0,
  borderRadius: 10,
  fontSize: "1rem",
  fontWeight: 600,
  cursor: "pointer",
};

export default function CheckoutPage() {
  return (
    <div style={pageStyle}>
      <h1 style={{ fontSize: "1.875rem", marginBottom: "0.75rem" }}>Checkout</h1>
      <p style={{ color: "#475569", lineHeight: 1.6 }}>
        A demonstration checkout. Nothing is submitted — this page exists to
        show where consent boundaries fall in a real ecommerce flow.
      </p>

      <form onSubmit={(e) => e.preventDefault()}>
        <label style={fieldStyle}>
          <span>Full name</span>
          <input style={inputStyle} placeholder="Adaeze Okafor" />
        </label>
        <label style={fieldStyle}>
          <span>Email</span>
          <input style={inputStyle} type="email" placeholder="adaeze@example.ng" />
        </label>
        <label style={fieldStyle}>
          <span>Delivery address</span>
          <input style={inputStyle} placeholder="12 Awolowo Road, Ikoyi, Lagos" />
        </label>
        <label style={fieldStyle}>
          <span>Card number</span>
          <input style={inputStyle} inputMode="numeric" placeholder="0000 0000 0000 0000" />
        </label>

        <div style={noticeStyle}>
          By placing this order, your data is processed under{" "}
          <strong>NDPA Section 25(1)(b)</strong> (performance of a contract) —
          we don&apos;t need your consent for that. Marketing emails, SMS, or
          analytics tracking require separate consent, which you can grant or
          revoke any time on{" "}
          <Link href="/cookie-preferences" style={{ color: "#2563eb" }}>
            cookie preferences
          </Link>
          .
        </div>

        <button style={buttonStyle} type="submit">
          Place order (demo)
        </button>
      </form>
    </div>
  );
}
