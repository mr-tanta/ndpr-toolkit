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
    default: "NDPA Toolkit | Nigeria Data Protection",
    template: "%s | NDPA Toolkit",
  },
  description:
    "Open-source toolkit for implementing NDPA 2023 (Nigeria Data Protection Act) compliant features. Consent, DSR, DPIA, breach notification, and more.",
  keywords:
    "NDPA, NDPA 2023, Nigeria Data Protection Act, NDPC, compliance toolkit, React, Next.js, open source",
  other: {
    "theme-color": "#1d4ed8",
  },
  openGraph: {
    title: "NDPA Toolkit | Nigeria Data Protection",
    description:
      "Open-source toolkit for implementing NDPA 2023 (Nigeria Data Protection Act) compliant features. Consent, DSR, DPIA, breach notification, and more.",
    type: "website",
    siteName: "NDPA Toolkit",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NDPA Toolkit — Nigeria Data Protection Compliance Components",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NDPA Toolkit | Nigeria Data Protection",
    description:
      "Open-source toolkit for NDPA 2023 compliance: consent management, DSR, DPIA, breach notification, and more for Nigerian applications.",
    images: ["/og-image.png"],
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
