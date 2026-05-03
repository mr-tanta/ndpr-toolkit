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
    default: "NDPA Toolkit — NDPA 2023 Compliance Infrastructure for React",
    template: "%s | NDPA Toolkit",
  },
  description:
    "v3 — Production-ready React components and adapters for NDPA 2023 compliance. Consent management, DSR portal, DPIA, breach notification, compliance score, and presets for Nigerian applications.",
  keywords:
    "NDPA, NDPA 2023, Nigeria Data Protection Act, NDPC, compliance toolkit, React, Next.js, open source, compliance score, adapters, presets, DSR portal",
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
    title: "NDPA Toolkit — NDPA 2023 Compliance Infrastructure for React",
    description:
      "v3 — Production-ready React components and adapters for NDPA 2023 compliance. Consent management, DSR portal, DPIA, breach notification, compliance score, and presets for Nigerian applications.",
    type: "website",
    siteName: "NDPA Toolkit",
    locale: "en_US",
    url: "https://ndprtoolkit.com.ng",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NDPA Toolkit — NDPA 2023 Compliance Infrastructure for React",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NDPA Toolkit — NDPA 2023 Compliance Infrastructure for React",
    description:
      "v3 — Production-ready React toolkit for NDPA 2023: adapters, presets, compliance score, consent management, DSR, DPIA, and breach notification for Nigerian applications.",
    images: ["/og-image.png"],
    creator: "@mr_tanta",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
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
