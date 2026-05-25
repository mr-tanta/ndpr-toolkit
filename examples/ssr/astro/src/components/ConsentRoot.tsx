import { useMemo } from "react";
import { ConsentBanner } from "@tantainnovative/ndpr-toolkit/consent";
import { cookieAdapter } from "@tantainnovative/ndpr-toolkit/adapters";
import type { ConsentSettings, ConsentOption } from "@tantainnovative/ndpr-toolkit";
import { CONSENT_COOKIE } from "../lib/parse-consent-cookie";

const OPTIONS: ConsentOption[] = [
  { id: "essential", label: "Essential", description: "Required for site operation.", required: true, purpose: "Site operation" },
  { id: "analytics", label: "Analytics", description: "Usage statistics.", required: false, purpose: "Analytics" },
  { id: "marketing", label: "Marketing", description: "Targeted advertising.", required: false, purpose: "Advertising" },
];

const CONSENT_VERSION = "1.0";

export function ConsentRoot({ initialConsent }: { initialConsent: ConsentSettings | null }) {
  const adapter = useMemo(
    () => cookieAdapter<ConsentSettings>(CONSENT_COOKIE, { sameSite: "Lax", secure: true, expires: 365 }),
    []
  );

  const hasFreshConsent =
    initialConsent?.hasInteracted === true && initialConsent.version === CONSENT_VERSION;

  return (
    <ConsentBanner
      options={OPTIONS}
      version={CONSENT_VERSION}
      manageStorage={false}
      show={!hasFreshConsent}
      onSave={(settings) => adapter.save(settings)}
    />
  );
}
