"use client";

import { NDPRROPA } from "@tantainnovative/ndpr-toolkit/presets";

export default function ROPADemoPage() {
  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <h1 style={{ fontSize: "1.875rem", marginBottom: "0.75rem" }}>
        NDPR Record of Processing Activities (ROPA)
      </h1>
      <p style={{ color: "#475569", lineHeight: 1.6, marginBottom: "1rem" }}>
        Build the ROPA every controller and processor must maintain under NDPA
        2023 Section 29 (purposes, categories of data subjects and data,
        recipients, retention periods, security measures). State is held
        in-memory for this demo.
      </p>

      <NDPRROPA />
    </div>
  );
}
