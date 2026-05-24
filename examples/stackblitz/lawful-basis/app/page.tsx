"use client";

import { NDPRLawfulBasis } from "@tantainnovative/ndpr-toolkit/presets";

export default function LawfulBasisDemoPage() {
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <h1 style={{ fontSize: "1.875rem", marginBottom: "0.75rem" }}>
        NDPR Lawful Basis Tracker
      </h1>
      <p style={{ color: "#475569", lineHeight: 1.6, marginBottom: "1rem" }}>
        Register each processing activity in your organisation against one of
        the six lawful bases in NDPA 2023 Section 25(1)(a)&ndash;(f) (consent,
        contract, legal obligation, vital interests, public task, legitimate
        interests). State is held in-memory for this demo.
      </p>

      <NDPRLawfulBasis />
    </div>
  );
}
