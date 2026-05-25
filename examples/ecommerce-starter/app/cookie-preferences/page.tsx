"use client";

import { useEffect, useState } from "react";
import { useConsent } from "@tantainnovative/ndpr-toolkit/hooks";
import { consentCategories } from "../../lib/consent-categories";

const pageStyle: React.CSSProperties = {
  maxWidth: 720,
  margin: "0 auto",
  padding: "2.5rem 1.5rem 4rem",
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "1rem",
  padding: "1.25rem",
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  marginBottom: "0.75rem",
};

const buttonStyle: React.CSSProperties = {
  marginTop: "1.25rem",
  padding: "0.75rem 1.25rem",
  background: "#0f172a",
  color: "#fff",
  border: 0,
  borderRadius: 10,
  fontSize: "0.9375rem",
  fontWeight: 600,
  cursor: "pointer",
};

export default function CookiePreferencesPage() {
  const { settings, updateConsent, isLoading } = useConsent({
    options: consentCategories,
  });

  const [draft, setDraft] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    const next: Record<string, boolean> = {};
    consentCategories.forEach((opt) => {
      next[opt.id] = opt.required
        ? true
        : settings?.consents[opt.id] ?? false;
    });
    setDraft(next);
  }, [isLoading, settings]);

  if (isLoading) {
    return (
      <div style={pageStyle}>
        <p style={{ color: "#64748b" }}>Loading your saved preferences…</p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <h1 style={{ fontSize: "1.875rem", marginBottom: "0.5rem" }}>
        Cookie preferences
      </h1>
      <p style={{ color: "#475569", lineHeight: 1.6, marginBottom: "1.5rem" }}>
        Update the consent you gave on the banner. Changes apply on this device
        immediately. Essential cookies stay on — without them, you can&apos;t
        place an order.
      </p>

      {consentCategories.map((opt) => (
        <div key={opt.id} style={rowStyle}>
          <div>
            <strong style={{ display: "block", marginBottom: "0.25rem" }}>
              {opt.label}
              {opt.required && (
                <span style={{ color: "#64748b", fontWeight: 400, marginLeft: "0.5rem", fontSize: "0.8125rem" }}>
                  always on
                </span>
              )}
            </strong>
            <span style={{ color: "#475569", fontSize: "0.875rem", lineHeight: 1.5 }}>
              {opt.description}
            </span>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              checked={draft[opt.id] ?? false}
              disabled={opt.required}
              onChange={(e) => {
                setDraft((prev) => ({ ...prev, [opt.id]: e.target.checked }));
                setSaved(false);
              }}
              style={{ width: 20, height: 20 }}
            />
          </label>
        </div>
      ))}

      <button
        style={buttonStyle}
        onClick={() => {
          updateConsent(draft);
          setSaved(true);
        }}
      >
        Save preferences
      </button>

      {saved && (
        <p style={{ color: "#065f46", marginTop: "1rem", fontSize: "0.9375rem" }}>
          Saved. Your new preferences are now active.
        </p>
      )}
    </div>
  );
}
