import type { ConsentSettings } from "@tantainnovative/ndpr-toolkit";

export const CONSENT_COOKIE = "ndpr-consent";

export function parseConsentCookie(raw: string | undefined): ConsentSettings | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded) as ConsentSettings;
    if (typeof parsed !== "object" || parsed === null) return null;
    if (typeof parsed.timestamp !== "number") return null;
    if (typeof parsed.consents !== "object" || parsed.consents === null) return null;
    return parsed;
  } catch {
    return null;
  }
}
