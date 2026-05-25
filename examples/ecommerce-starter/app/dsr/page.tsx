"use client";

import { useState } from "react";
import { NDPRSubjectRights } from "@tantainnovative/ndpr-toolkit/presets/dsr";

type Result =
  | { kind: "idle" }
  | { kind: "success"; referenceId: string; estimatedCompletionAt: string }
  | { kind: "error"; message: string };

const pageStyle: React.CSSProperties = {
  maxWidth: 720,
  margin: "0 auto",
  padding: "2.5rem 1.5rem 4rem",
};

const calloutBase: React.CSSProperties = {
  padding: "1rem 1.25rem",
  borderRadius: 10,
  marginBottom: "1.5rem",
  fontSize: "0.9375rem",
  lineHeight: 1.55,
};

export default function DSRPage() {
  const [result, setResult] = useState<Result>({ kind: "idle" });

  return (
    <div style={pageStyle}>
      <h1 style={{ fontSize: "1.875rem", marginBottom: "0.5rem" }}>
        Your data rights
      </h1>
      <p style={{ color: "#475569", lineHeight: 1.6, marginBottom: "1.5rem" }}>
        Submit a request to access, correct, export, restrict, or delete the
        personal data Zuri Market holds about you. We respond within 30 days as
        required by NDPA Sections 34&ndash;38.
      </p>

      {result.kind === "success" && (
        <div
          style={{
            ...calloutBase,
            background: "#ecfdf5",
            border: "1px solid #6ee7b7",
            color: "#065f46",
          }}
        >
          <strong>Request received.</strong> Your reference is{" "}
          <code>{result.referenceId}</code>. We&apos;ll respond by{" "}
          {new Date(result.estimatedCompletionAt).toLocaleDateString("en-NG", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          . Save this reference — you&apos;ll need it if you contact us.
        </div>
      )}

      {result.kind === "error" && (
        <div
          style={{
            ...calloutBase,
            background: "#fef2f2",
            border: "1px solid #fca5a5",
            color: "#991b1b",
          }}
        >
          <strong>We couldn&apos;t submit your request.</strong> {result.message}{" "}
          Please try again, or email privacy@zuri.market.ng.
        </div>
      )}

      <NDPRSubjectRights
        submitTo="/api/dsr"
        onSubmitSuccess={({ body }) => {
          const parsed = body as
            | { referenceId?: string; estimatedCompletionAt?: string }
            | undefined;
          if (parsed?.referenceId && parsed?.estimatedCompletionAt) {
            setResult({
              kind: "success",
              referenceId: parsed.referenceId,
              estimatedCompletionAt: parsed.estimatedCompletionAt,
            });
          } else {
            setResult({
              kind: "error",
              message: "The server accepted the request but didn't return a reference.",
            });
          }
        }}
        onSubmitError={({ error, response }) => {
          const message = response
            ? `Server responded with ${response.status}.`
            : error instanceof Error
            ? error.message
            : "Network error.";
          setResult({ kind: "error", message });
        }}
      />
    </div>
  );
}
