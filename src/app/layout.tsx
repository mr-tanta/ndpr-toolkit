import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PostHogProvider, PostHogPageView } from "@/providers/posthog";
import { Suspense } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ndprtoolkit.com.ng"),
  title: {
    default: "NDPR Toolkit — Nigeria Data Protection Act (NDPA) 2023 Library for React & Next.js",
    template: "%s | NDPR Toolkit (Nigeria NDPA)",
  },
  description:
    "Open-source React & TypeScript library for Nigeria Data Protection Act (NDPA) 2023 compliance. Cookie consent banner, data-subject rights portal, DPIA, 72-hour breach notification, RoPA, lawful-basis tracker, and privacy-policy generator — built for Nigerian fintech, insurtech, and SaaS.",
  keywords:
    "Nigeria NDPA, NDPA 2023, Nigeria Data Protection Act, NDPR, NDPC, Nigeria cookie consent, Nigeria privacy policy generator, Nigeria DPIA tool, Nigeria GDPR, NDPC compliance, Nigerian fintech compliance, React, Next.js, TypeScript, open source",
  alternates: {
    canonical: "/",
  },
  applicationName: "NDPA Toolkit",
  manifest: "/favicon/site.webmanifest",
  icons: {
    // /src/app/favicon.ico is the Next.js convention pickup; the explicit
    // list below covers older agents and the high-density PNG sizes
    // generated alongside it (and points at the /favicon/ directory where
    // the platform PNGs actually live).
    icon: [
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      { url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  other: {
    "theme-color": "#1d4ed8",
  },
  openGraph: {
    title: "NDPR Toolkit — Nigeria Data Protection Act (NDPA) 2023 Library for React",
    description:
      "Open-source React & TypeScript library for Nigeria NDPA 2023 compliance. Cookie consent, DSR portal, DPIA, 72-hour breach notification, RoPA, and privacy-policy generator built for Nigerian fintech, insurtech, and SaaS.",
    type: "website",
    siteName: "NDPR Toolkit",
    locale: "en_NG",
    url: "https://ndprtoolkit.com.ng",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NDPR Toolkit — Nigeria Data Protection Act 2023 Library for React",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NDPR Toolkit — Nigeria NDPA 2023 Library for React & Next.js",
    description:
      "Open-source React/TypeScript library for Nigeria NDPA 2023 compliance: consent, DSR, DPIA, breach notification, RoPA, lawful-basis, privacy policy. MIT-licensed.",
    images: ["/og-image.png"],
    creator: "@mr_tanta",
  },
};

// Site-wide JSON-LD. Lets Google emit a rich SoftwareApplication snippet
// (app category, license, OS, free pricing) on the homepage and helps
// disambiguate "NDPA" from Nebraska in search results. The TechArticle
// schemas on individual /docs pages stack on top of this.
//
// Note: JSON-LD is the documented Next.js pattern for structured data and
// the content is a fully static, server-rendered constant (no user input),
// so `dangerouslySetInnerHTML` cannot produce an XSS vector here. See
// https://nextjs.org/learn/seo/structured-data
const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "NDPR Toolkit",
  alternateName: [
    "NDPA Toolkit",
    "Nigeria Data Protection Toolkit",
    "@tantainnovative/ndpr-toolkit",
  ],
  applicationCategory: "DeveloperApplication",
  applicationSubCategory: "Privacy & Compliance",
  operatingSystem: "Cross-platform (Browser, Node.js, Next.js, Edge)",
  description:
    "Open-source React and TypeScript library for Nigeria Data Protection Act (NDPA) 2023 compliance: cookie consent, data-subject rights portal, DPIA, 72-hour breach notification, RoPA, lawful-basis tracker, and privacy-policy generator.",
  url: "https://ndprtoolkit.com.ng",
  downloadUrl: "https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit",
  softwareVersion: "3.5.5",
  license: "https://opensource.org/licenses/MIT",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Person",
    name: "Abraham Esandayinze Tanta",
    url: "https://linkedin.com/in/mr-tanta",
  },
  publisher: {
    "@type": "Organization",
    name: "Tanta Innovatives",
    url: "https://tantainnovatives.com",
  },
  keywords:
    "Nigeria NDPA, NDPA 2023, Nigeria Data Protection Act, NDPR, NDPC, Nigeria cookie consent, Nigeria privacy policy generator, Nigeria DPIA tool, React, Next.js, TypeScript",
  inLanguage: ["en", "en-NG", "yo", "ig", "ha", "pcm"],
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Tanta Innovatives",
  url: "https://tantainnovatives.com",
  logo: "https://ndprtoolkit.com.ng/icon-blue.png",
  sameAs: [
    "https://github.com/mr-tanta/ndpr-toolkit",
    "https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit",
    "https://linkedin.com/in/mr-tanta",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-NG" className="dark">
      <head>
        {/* Static, server-rendered JSON-LD — safe to inject. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareApplicationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PostHogProvider>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </PostHogProvider>
      </body>
    </html>
  );
}
