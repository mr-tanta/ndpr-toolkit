"use client";

import { NDPRSubjectRights } from "@tantainnovative/ndpr-toolkit/presets/dsr";

export default function DSRDemoPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <h1 style={{ fontSize: "1.875rem", marginBottom: "0.75rem" }}>
        NDPR Data Subject Rights Portal
      </h1>
      <p style={{ color: "#475569", lineHeight: 1.6, marginBottom: "1rem" }}>
        A public-facing form that lets a data subject exercise rights granted
        by NDPA 2023 Sections 34&ndash;38 (access, rectification, erasure,
        portability, restriction, objection, consent withdrawal). Submitted
        payloads are logged to the browser console.
      </p>
      <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "2rem" }}>
        Wire <code>submitTo</code> or an <code>adapter</code> to persist the
        request to your backend.
      </p>

      <NDPRSubjectRights
        onSubmit={(data) => {
          // eslint-disable-next-line no-console
          console.log("[dsr submission]", data);
        }}
      />
    </div>
  );
}
