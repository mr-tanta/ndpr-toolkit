"use client";

import { NDPRDPIA } from "@tantainnovative/ndpr-toolkit/presets";

export default function DPIADemoPage() {
  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <h1 style={{ fontSize: "1.875rem", marginBottom: "0.75rem" }}>
        NDPR Data Protection Impact Assessment
      </h1>
      <p style={{ color: "#475569", lineHeight: 1.6, marginBottom: "1rem" }}>
        A multi-section DPIA questionnaire scoped to NDPA 2023 Section 28
        (mandatory impact assessments for processing likely to result in high
        risk). Walk through the default sections; the DPIA result is logged
        when the wizard completes.
      </p>

      <NDPRDPIA
        onResult={(result) => {
          // eslint-disable-next-line no-console
          console.log("[dpia result]", result);
        }}
      />
    </div>
  );
}
