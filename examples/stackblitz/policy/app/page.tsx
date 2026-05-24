"use client";

import { NDPRPrivacyPolicy } from "@tantainnovative/ndpr-toolkit/presets/policy";

export default function PolicyDemoPage() {
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <h1 style={{ fontSize: "1.875rem", marginBottom: "0.75rem" }}>
        NDPR Privacy Policy Wizard
      </h1>
      <p style={{ color: "#475569", lineHeight: 1.6, marginBottom: "1rem" }}>
        An adaptive wizard that generates an NDPA 2023 Section 27-compliant
        privacy notice (the disclosures controllers must give to data
        subjects). Seeded with the <code>saas</code> sector template; the
        generated policy is logged to the browser console.
      </p>
      <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "2rem" }}>
        PDF/DOCX export is wired via the optional <code>jspdf</code> and{" "}
        <code>docx</code> peer dependencies (included in this scaffold).
      </p>

      <NDPRPrivacyPolicy
        template="saas"
        templateOverrides={{ orgName: "Acme Nigeria Ltd" }}
        onComplete={(policy) => {
          // eslint-disable-next-line no-console
          console.log("[privacy policy]", policy);
        }}
      />
    </div>
  );
}
