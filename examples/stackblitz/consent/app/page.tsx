"use client";

import { NDPRConsent } from "@tantainnovative/ndpr-toolkit/presets/consent";
import type { ConsentSettings } from "@tantainnovative/ndpr-toolkit";

export default function ConsentDemoPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <h1 style={{ fontSize: "1.875rem", marginBottom: "0.75rem" }}>
        NDPR Consent Banner
      </h1>
      <p style={{ color: "#475569", lineHeight: 1.6, marginBottom: "1rem" }}>
        A drop-in cookie/consent banner that satisfies NDPA 2023 Section 26
        (consent must be informed, specific, freely given, and demonstrable).
        The banner appears at the bottom of the page. Choose categories, then
        check the browser console to see the resulting{" "}
        <code>ConsentSettings</code> payload.
      </p>
      <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
        Persistence is handled by the toolkit&apos;s default localStorage
        adapter when no <code>adapter</code> prop is passed.
      </p>

      <NDPRConsent
        position="bottom"
        onSave={(settings: ConsentSettings) => {
          // eslint-disable-next-line no-console
          console.log("[consent]", settings);
        }}
      />
    </div>
  );
}
