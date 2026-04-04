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
  title: "Nigeria Data Protection Toolkit — NDPA 2023",
  description: "Open-source toolkit for implementing NDPA 2023 (Nigeria Data Protection Act) compliant features in Nigerian applications",
  other: {
    "theme-color": "#1d4ed8",
  },
  openGraph: {
    title: "Nigeria Data Protection Toolkit — NDPA 2023",
    description: "Open-source toolkit for implementing NDPA 2023 (Nigeria Data Protection Act) compliant features in Nigerian applications",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NDPR Toolkit — NDPA 2023 Compliance Components",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nigeria Data Protection Toolkit — NDPA 2023",
    description: "Open-source toolkit for implementing NDPA 2023 compliant features in Nigerian applications",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
