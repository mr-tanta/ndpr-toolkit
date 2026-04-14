/**
 * Next.js App Router — Consent Middleware
 *
 * Provides a reusable consent-gate helper that can be called inside any
 * App Router route handler (or in Next.js middleware.ts at the edge) to verify
 * that a data subject has granted the required consent before the route proceeds.
 *
 * NDPA Section 25 requires that processing based on consent only happens when
 * the data subject has freely given specific, informed, and unambiguous consent.
 * This helper enforces that requirement at the HTTP layer.
 *
 * How to use
 * ----------
 * Call `consentMiddleware(req, 'marketing')` at the top of any route handler
 * that requires a specific consent type. If the function returns a Response,
 * return it immediately; otherwise continue with your logic:
 *
 *   import { consentMiddleware } from '../middleware';
 *
 *   export async function POST(req: NextRequest) {
 *     const guard = await consentMiddleware(req, 'marketing');
 *     if (guard) return guard; // blocked — return 403
 *
 *     // subject has consented — proceed
 *   }
 *
 * Subject identification
 * ----------------------
 * The helper looks for a subject identifier in two places (in priority order):
 *   1. The `x-subject-id` request header (set by your auth middleware or JWT)
 *   2. The `subject_id` cookie (set by your consent banner on the client)
 *
 * @module middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Verify that the requesting data subject has granted the specified consent type.
 *
 * @param req             - The incoming NextRequest
 * @param requiredConsent - The consent category key to check (e.g. 'marketing', 'analytics')
 * @returns null if the subject has consented (allow through), or a NextResponse with
 *          status 403 and an error body if the check fails (block the request).
 */
export async function consentMiddleware(
  req: NextRequest,
  requiredConsent: string,
): Promise<NextResponse | null> {
  // Resolve the subject identifier from the header or cookie.
  const subjectId =
    req.headers.get('x-subject-id') ?? req.cookies.get('subject_id')?.value ?? null;

  if (!subjectId) {
    return NextResponse.json(
      { error: 'Consent verification required' },
      { status: 403 },
    );
  }

  // Load the most recent active consent record for this subject.
  const record = await prisma.consentRecord.findFirst({
    where: { subjectId, revokedAt: null },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) {
    return NextResponse.json(
      { error: 'No consent on record' },
      { status: 403 },
    );
  }

  // Check that the specific consent type has been granted.
  const consents = record.consents as Record<string, boolean>;

  if (!consents[requiredConsent]) {
    return NextResponse.json(
      { error: `Consent for "${requiredConsent}" not granted` },
      { status: 403 },
    );
  }

  // Subject has consented — allow the request to proceed.
  return null;
}

/**
 * Higher-order helper: wraps a route handler with a consent gate.
 *
 * This is an alternative to calling consentMiddleware() manually at the top
 * of every handler. Use it when all methods on a route require the same consent.
 *
 *   export const POST = withConsent('marketing', async (req) => {
 *     // marketing consent guaranteed here
 *   });
 *
 * @param requiredConsent - The consent category to enforce
 * @param handler         - The route handler to wrap
 */
export function withConsent(
  requiredConsent: string,
  handler: (req: NextRequest, ctx: any) => Promise<NextResponse>,
) {
  return async (req: NextRequest, ctx: any): Promise<NextResponse> => {
    const guard = await consentMiddleware(req, requiredConsent);
    if (guard) return guard;
    return handler(req, ctx);
  };
}
