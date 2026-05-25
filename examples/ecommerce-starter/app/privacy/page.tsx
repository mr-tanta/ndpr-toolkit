"use client";

import { NDPRPrivacyPolicy } from "@tantainnovative/ndpr-toolkit/presets/policy";

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "2.5rem 1.5rem 4rem" }}>
      <h1 style={{ fontSize: "1.875rem", marginBottom: "0.5rem" }}>Privacy notice</h1>
      <p style={{ color: "#475569", lineHeight: 1.6, marginBottom: "1.5rem" }}>
        Generated with the toolkit&apos;s adaptive wizard, seeded with the{" "}
        <code>ecommerce</code> template. Walk through each section to see the
        NDPA Section 27 disclosures a Nigerian retailer is expected to publish.
      </p>

      <NDPRPrivacyPolicy
        template="ecommerce"
        templateOverrides={{
          orgName: "Zuri Market Ltd",
          website: "https://zuri.market.ng",
          privacyEmail: "privacy@zuri.market.ng",
          dpoName: "Ifeoma Adeyemi",
          dpoEmail: "dpo@zuri.market.ng",
        }}
      />
    </div>
  );
}
