"use client";

import { NDPRConsent } from "@tantainnovative/ndpr-toolkit/presets/consent";
import { consentCategories } from "../lib/consent-categories";

export function ConsentRoot() {
  return (
    <NDPRConsent
      options={consentCategories}
      position="bottom"
      copy={{
        title: "Your privacy on Zuri Market",
        description:
          "We use cookies and similar technologies to run the store, understand how it is used, and (with your permission) personalise offers. You can change your choices any time on the cookie preferences page. See our privacy notice for the full NDPA Section 27 disclosures.",
        acceptAll: "Accept all",
        rejectAll: "Only essentials",
        customize: "Manage categories",
        save: "Save preferences",
      }}
    />
  );
}
