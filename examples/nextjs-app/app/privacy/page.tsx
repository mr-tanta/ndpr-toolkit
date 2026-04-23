"use client";

import { NDPRPrivacyPolicy } from "@tantainnovative/ndpr-toolkit/presets";
import type { PrivacyPolicy } from "@tantainnovative/ndpr-toolkit";

export default function PrivacyPage() {
  const handleComplete = (policy: PrivacyPolicy) => {
    console.log("Privacy policy generated:", policy);
  };

  return (
    <div>
      <h1>Privacy Policy Generator</h1>
      <p>
        Generate an NDPA-compliant privacy policy for your organisation using the
        guided wizard below.
      </p>

      <NDPRPrivacyPolicy onComplete={handleComplete} />
    </div>
  );
}
