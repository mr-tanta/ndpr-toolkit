import { cookies } from "next/headers";
import "@tantainnovative/ndpr-toolkit/styles";
import { ConsentRoot } from "./ConsentRoot";
import { CONSENT_COOKIE, parseConsentCookie } from "./lib/parse-consent-cookie";

export const metadata = {
  title: "NDPR Toolkit — Next.js SSR consent",
  description:
    "Cookie-bridged SSR for the @tantainnovative/ndpr-toolkit consent banner in Next.js App Router.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const initialConsent = parseConsentCookie(cookieStore.get(CONSENT_COOKIE)?.value);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0 }}>
        <ConsentRoot initialConsent={initialConsent}>{children}</ConsentRoot>
      </body>
    </html>
  );
}
