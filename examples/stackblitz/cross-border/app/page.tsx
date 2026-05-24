"use client";

import { NDPRCrossBorder } from "@tantainnovative/ndpr-toolkit/presets";

export default function CrossBorderDemoPage() {
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <h1 style={{ fontSize: "1.875rem", marginBottom: "0.75rem" }}>
        NDPR Cross-Border Transfer Manager
      </h1>
      <p style={{ color: "#475569", lineHeight: 1.6, marginBottom: "1rem" }}>
        Record and justify international data transfers under NDPA 2023
        Sections 41&ndash;43 (transfers are only allowed to jurisdictions with
        adequate protection, or subject to an approved safeguard such as
        binding corporate rules or standard contractual clauses). State is
        held in-memory for this demo.
      </p>

      <NDPRCrossBorder />
    </div>
  );
}
