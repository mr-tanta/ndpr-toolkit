"use client";

import { NDPRProvider } from "@tantainnovative/ndpr-toolkit";
import { NDPRConsent } from "@tantainnovative/ndpr-toolkit/presets";
import { apiAdapter } from "@tantainnovative/ndpr-toolkit/adapters";
import type { ConsentSettings } from "@tantainnovative/ndpr-toolkit";

const consentAdapter = apiAdapter<ConsentSettings>("/api/consent");

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NDPRProvider
          organizationName="Acme Nigeria Ltd"
          dpoEmail="dpo@acme-nigeria.com"
          ndpcRegistrationNumber="NDPC-2024-0001"
        >
          <nav style={{ padding: "1rem", borderBottom: "1px solid #eee" }}>
            <a href="/" style={{ marginRight: "1rem" }}>Home</a>
            <a href="/privacy" style={{ marginRight: "1rem" }}>Privacy Policy</a>
            <a href="/dsr">Data Subject Rights</a>
          </nav>

          <main style={{ padding: "2rem", maxWidth: "960px", margin: "0 auto" }}>
            {children}
          </main>

          <NDPRConsent adapter={consentAdapter} position="bottom" />
        </NDPRProvider>
      </body>
    </html>
  );
}
