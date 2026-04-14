/**
 * Express — Consent Gate Middleware
 *
 * Provides a middleware factory that blocks requests from data subjects who
 * have not granted the required consent type, implementing the consent
 * enforcement required by NDPA Section 25.
 *
 * NDPA Section 25 requires that data processing based on consent only occurs
 * when the subject has freely given specific, informed, and unambiguous consent.
 * This middleware enforces that requirement at the HTTP layer so individual
 * route handlers don't need to repeat the check.
 *
 * How to use
 * ----------
 * Apply the middleware to any Express route or router that requires consent:
 *
 *   import { requireConsent } from './middleware/consent-check';
 *
 *   // Protect a single route
 *   app.post('/email/send', requireConsent('marketing'), sendEmailHandler);
 *
 *   // Protect an entire router
 *   analyticsRouter.use(requireConsent('analytics'));
 *
 * Subject identification
 * ----------------------
 * The middleware looks for a subject identifier in two places (in priority order):
 *   1. The `x-subject-id` request header (set by your auth middleware or JWT)
 *   2. The `subject_id` cookie (set by the consent banner on the client)
 *
 * @module express/middleware/consent-check
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Express middleware factory that enforces a specific consent type.
 *
 * Returns a standard Express middleware function that:
 *   1. Resolves the data subject's identifier from the request.
 *   2. Loads the most recent active consent record for that subject.
 *   3. Verifies that the required consent type is set to `true`.
 *   4. Calls `next()` if consent is present, or responds with 403 if not.
 *
 * @param consentType - The consent category key to check (e.g. 'marketing', 'analytics')
 * @returns Express middleware function
 *
 * @example
 *   router.post('/newsletter/subscribe', requireConsent('marketing'), handler);
 */
export function requireConsent(consentType: string) {
  return async (req: any, res: any, next: any): Promise<void> => {
    // Resolve subject identifier from header (preferred) or cookie fallback.
    const subjectId: string | undefined =
      req.headers['x-subject-id'] || req.cookies?.subject_id;

    if (!subjectId) {
      res.status(403).json({ error: 'Consent verification required' });
      return;
    }

    // Load the most recent active consent record for this subject.
    const record = await prisma.consentRecord.findFirst({
      where: { subjectId, revokedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      res.status(403).json({ error: 'No consent on record' });
      return;
    }

    // Verify that the specific consent category has been granted.
    const consents = record.consents as Record<string, boolean>;

    if (!consents[consentType]) {
      res.status(403).json({ error: `Consent for "${consentType}" not granted` });
      return;
    }

    // Consent verified — attach consent record to request for downstream use.
    req.consentRecord = record;
    next();
  };
}

/**
 * Convenience middleware that requires ALL of the listed consent types.
 *
 * If any one of the required consent types is missing, the request is blocked.
 * Useful when a single endpoint processes data under multiple consent categories.
 *
 * @param consentTypes - Array of consent category keys, all of which must be granted
 *
 * @example
 *   router.post('/profile/sync', requireAllConsents(['analytics', 'personalisation']), handler);
 */
export function requireAllConsents(consentTypes: string[]) {
  return async (req: any, res: any, next: any): Promise<void> => {
    const subjectId: string | undefined =
      req.headers['x-subject-id'] || req.cookies?.subject_id;

    if (!subjectId) {
      res.status(403).json({ error: 'Consent verification required' });
      return;
    }

    const record = await prisma.consentRecord.findFirst({
      where: { subjectId, revokedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      res.status(403).json({ error: 'No consent on record' });
      return;
    }

    const consents = record.consents as Record<string, boolean>;
    const missing = consentTypes.filter((type) => !consents[type]);

    if (missing.length > 0) {
      res.status(403).json({
        error: `Consent not granted for: ${missing.join(', ')}`,
      });
      return;
    }

    req.consentRecord = record;
    next();
  };
}
