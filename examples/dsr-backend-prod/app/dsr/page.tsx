"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NDPRSubjectRights } from "@tantainnovative/ndpr-toolkit/presets/dsr";

type FailureState =
  | { kind: "idle" }
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
  const router = useRouter();
  const [state, setState] = useState<FailureState>({ kind: "idle" });

  return (
    <div style={pageStyle}>
      <h1 style={{ fontSize: "1.875rem", marginBottom: "0.5rem" }}>
        Your data rights
      </h1>
      <p style={{ color: "#475569", lineHeight: 1.6, marginBottom: "1.5rem" }}>
        Submit a request to access, correct, export, restrict, or delete the
        personal data we hold about you. We respond within 30 days as required
        by NDPA Sections 34&ndash;38.
      </p>

      {state.kind === "error" && (
        <div
          role="alert"
          style={{
            ...calloutBase,
            background: "#fef2f2",
            border: "1px solid #fca5a5",
            color: "#991b1b",
          }}
        >
          <strong>We couldn&apos;t submit your request.</strong> {state.message}{" "}
          Please try again, or contact privacy support directly.
        </div>
      )}

      <NDPRSubjectRights
        submitTo="/api/dsr"
        onSubmitSuccess={({ body }) => {
          const parsed = body as
            | { referenceId?: string; estimatedCompletionAt?: string }
            | undefined;
          if (parsed?.referenceId && parsed?.estimatedCompletionAt) {
            const params = new URLSearchParams({
              ref: parsed.referenceId,
              eta: parsed.estimatedCompletionAt,
            });
            router.push(`/dsr-confirmation?${params.toString()}`);
            return;
          }
          setState({
            kind: "error",
            message:
              "The server accepted the request but didn't return a reference number.",
          });
        }}
        onSubmitError={({ error, response }) => {
          const message = response
            ? `Server responded with ${response.status}.`
            : error instanceof Error
              ? error.message
              : "Network error.";
          setState({ kind: "error", message });
        }}
      />
    </div>
  );
}
