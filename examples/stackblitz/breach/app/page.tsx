"use client";

import { NDPRBreachReport } from "@tantainnovative/ndpr-toolkit/presets";

export default function BreachDemoPage() {
  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <h1 style={{ fontSize: "1.875rem", marginBottom: "0.75rem" }}>
        NDPR Breach Notification Form
      </h1>
      <p style={{ color: "#475569", lineHeight: 1.6, marginBottom: "1rem" }}>
        Internal-facing form your DPO uses to capture a personal-data breach
        under NDPA 2023 Section 40 (72-hour notification to the NDPC and to
        affected data subjects where required). Submitted reports are logged
        to the browser console.
      </p>

      <NDPRBreachReport
        onSubmit={(data) => {
          // eslint-disable-next-line no-console
          console.log("[breach report]", data);
        }}
      />
    </div>
  );
}
