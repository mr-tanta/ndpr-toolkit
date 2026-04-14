/**
 * Example: Full NDPA compliance wiring in a Next.js App Router layout.
 *
 * This file shows how to integrate the @tantainnovative/ndpr-toolkit consent
 * banner with a persistent backend using the Prisma adapter. The pattern works
 * for both the built-in Prisma adapter and the Drizzle adapter — swap out
 * `prismaConsentAdapter` for `drizzleConsentAdapter` if you use Drizzle.
 *
 * What this example covers
 * ------------------------
 * - Wrapping your app with NDPRProvider so all child components can access the
 *   consent context via `useConsent()`.
 * - Rendering the NDPRConsent banner with a server-backed storage adapter so
 *   consent decisions survive page refreshes and browser restarts.
 * - Wiring the apiAdapter to your Next.js API route (`/api/consent`) for a
 *   fully decoupled client ↔ server consent flow.
 *
 * Copy this file, adapt the userId retrieval to your auth system, and you're done.
 *
 * @see prisma/schema.prisma          — for the database schema
 * @see src/nextjs/app-router/api/    — for the API route implementations
 * @see src/adapters/prisma-consent.ts — for the server-side Prisma adapter
 *
 * @module nextjs/app-router/layout-example
 */

'use client';

import React from 'react';
import { NDPRProvider } from '@tantainnovative/ndpr-toolkit/core';
import { NDPRConsent } from '@tantainnovative/ndpr-toolkit/presets';
import { apiAdapter } from '@tantainnovative/ndpr-toolkit/adapters';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NDPRLayoutProps {
  children: React.ReactNode;
  /**
   * Optional: pass the authenticated user's ID down from your root layout.
   * In a real app this comes from your session (NextAuth, Clerk, Supabase Auth, etc.).
   *
   * If no userId is available (unauthenticated visitor), pass a stable anonymous
   * identifier instead — e.g. a UUID stored in a cookie. Consent must still be
   * obtained even for non-authenticated users.
   */
  userId?: string;
}

// ---------------------------------------------------------------------------
// Layout component
// ---------------------------------------------------------------------------

/**
 * NDPRLayout — wraps your app with consent management and the banner UI.
 *
 * Recommended placement: inside your root `app/layout.tsx`, wrapped around
 * the `{children}` slot. Example:
 *
 *   // app/layout.tsx
 *   import { NDPRLayout } from '@/components/ndpr-layout';
 *
 *   export default async function RootLayout({ children }) {
 *     const session = await getServerSession();
 *     return (
 *       <html lang="en">
 *         <body>
 *           <NDPRLayout userId={session?.user?.id}>
 *             {children}
 *           </NDPRLayout>
 *         </body>
 *       </html>
 *     );
 *   }
 *
 * Note: This component is marked 'use client' because NDPRProvider and the
 * consent banner both require client-side interactivity. The session/userId
 * should be resolved in the parent Server Component and passed as a prop.
 */
export default function NDPRLayout({ children, userId }: NDPRLayoutProps) {
  // ---------------------------------------------------------------------------
  // Subject identification
  // ---------------------------------------------------------------------------

  // In a real application, replace this with your actual auth system:
  //   const { data: session } = useSession();           // NextAuth
  //   const { user } = useUser();                       // Clerk
  //   const { session } = useSessionContext();          // Supabase Auth
  //
  // For anonymous visitors: generate and persist a UUID in localStorage or a cookie
  // so consent decisions are stable across page reloads.
  const subjectId = userId ?? 'anonymous';

  // ---------------------------------------------------------------------------
  // Adapter
  // ---------------------------------------------------------------------------

  // apiAdapter points at the Next.js API route that wraps the Prisma/Drizzle adapter.
  // The route is implemented in `src/nextjs/app-router/api/consent/route.ts`.
  //
  // For direct server-side use (SSR / Server Components), import and call
  // `prismaConsentAdapter(prisma, subjectId)` directly instead.
  const consentStorageAdapter = apiAdapter(`/api/consent?subjectId=${subjectId}`);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <NDPRProvider
      /**
       * Your organisation's legal name — displayed in the consent banner headline
       * and in the Data Subject Rights portal.
       */
      organizationName="Your Company"
      /**
       * DPO or privacy contact email — shown to data subjects who want to exercise
       * their rights or ask questions about data processing.
       */
      dpoEmail="dpo@yourcompany.ng"
    >
      {/* Render your application's pages and components */}
      {children}

      {/*
       * NDPRConsent — the NDPA-compliant consent banner.
       *
       * The `adapter` prop connects the banner to your database so consent
       * decisions are persisted server-side and survive page refreshes.
       *
       * On first visit: the banner is displayed and the subject can accept,
       * decline, or customise individual consent categories.
       *
       * On subsequent visits: the adapter loads the stored decision and the
       * banner is hidden (no flicker, no double-prompt).
       *
       * The banner automatically handles:
       *   - NDPA §25 — recording the lawful basis and consent version
       *   - NDPA §26 — providing a clear withdrawal mechanism
       *   - Immutable audit trail — every change is stored as a new record
       */}
      <NDPRConsent adapter={consentStorageAdapter} />
    </NDPRProvider>
  );
}

// ---------------------------------------------------------------------------
// Alternative: using the Drizzle adapter directly (no API route needed)
// ---------------------------------------------------------------------------
//
// If you prefer to use the Drizzle adapter on the server side inside a
// Server Component or a Route Handler, here is how to wire it:
//
//   import { drizzle } from 'drizzle-orm/node-postgres';
//   import { Pool } from 'pg';
//   import { drizzleConsentAdapter } from '@/adapters/drizzle-consent';
//   import * as schema from '@/drizzle/schema';
//
//   const pool = new Pool({ connectionString: process.env.DATABASE_URL });
//   const db = drizzle(pool, { schema });
//
//   // In a Server Component or API Route:
//   const adapter = drizzleConsentAdapter(db, subjectId);
//   const settings = await adapter.load();
//
// ---------------------------------------------------------------------------
// Alternative: using the Prisma adapter directly (no API route needed)
// ---------------------------------------------------------------------------
//
//   import { PrismaClient } from '@prisma/client';
//   import { prismaConsentAdapter } from '@/adapters/prisma-consent';
//
//   const prisma = new PrismaClient();
//
//   // In a Server Component or API Route:
//   const adapter = prismaConsentAdapter(prisma, subjectId);
//   const settings = await adapter.load();
