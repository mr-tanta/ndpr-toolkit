/**
 * Express — Consent Router
 *
 * GET, POST, and DELETE handlers for data subject consent records as required
 * by NDPA Section 25 (lawful basis of processing) and Section 26 (right to
 * withdraw consent). Mirrors the Next.js App Router consent route in logic.
 *
 * Routes
 * ------
 *   GET    /consent?subjectId=xxx   — Load the active consent record
 *   POST   /consent                 — Save new consent (revokes previous)
 *   DELETE /consent?subjectId=xxx   — Revoke all active consent
 *
 * How to use
 * ----------
 * Mount this router in your Express app (see `../index.ts`):
 *
 *   import { createNDPRRouter } from '@tantainnovative/ndpr-recipes/express';
 *   app.use('/ndpr', createNDPRRouter());
 *
 * @module express/routes/consent
 */

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const consentRouter = Router();

// ---------------------------------------------------------------------------
// GET /consent?subjectId=xxx
// ---------------------------------------------------------------------------

/**
 * Load the most recent active (non-revoked) consent record for a data subject.
 *
 * NDPA Section 25 requires evidence of consent to be retained. This endpoint
 * lets your application verify existing consent before processing personal data.
 *
 * Query params:
 *   subjectId (required) — stable identifier for the data subject
 *
 * Returns 200 with the ConsentRecord, or 200 `null` if none exists.
 */
consentRouter.get('/', async (req, res) => {
  const { subjectId } = req.query;

  if (!subjectId || typeof subjectId !== 'string') {
    return res.status(400).json({ error: 'subjectId required' });
  }

  const record = await prisma.consentRecord.findFirst({
    where: { subjectId, revokedAt: null },
    orderBy: { createdAt: 'desc' },
  });

  return res.json(record);
});

// ---------------------------------------------------------------------------
// POST /consent
// ---------------------------------------------------------------------------

/**
 * Persist a new consent decision for a data subject.
 *
 * Follows the immutable-audit pattern: any active record is soft-revoked
 * before the new one is inserted, preserving full consent history as required
 * by the NDPA accountability principle (Section 44).
 *
 * Body (JSON):
 *   subjectId   (required) — stable subject identifier
 *   consents    (required) — map of consent category → boolean
 *   version     (required) — consent policy version string
 *   method      (optional) — capture method (default: 'api')
 *   lawfulBasis (optional) — e.g. 'consent', 'legitimate_interests'
 *
 * Returns 201 with the newly created ConsentRecord.
 */
consentRouter.post('/', async (req, res) => {
  const { subjectId, consents, version, method, lawfulBasis } = req.body;

  if (!subjectId || !consents || !version) {
    return res
      .status(400)
      .json({ error: 'subjectId, consents, and version are required' });
  }

  // Revoke any previously active consent records (immutable-audit pattern).
  await prisma.consentRecord.updateMany({
    where: { subjectId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  // Insert new record, capturing request metadata for compliance evidence.
  const record = await prisma.consentRecord.create({
    data: {
      subjectId,
      consents,
      version,
      method: method ?? 'api',
      lawfulBasis: lawfulBasis ?? null,
      ipAddress:
        (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ??
        req.socket.remoteAddress ??
        null,
      userAgent: req.headers['user-agent'] ?? null,
    },
  });

  // Audit log for NDPA Section 44 accountability.
  await prisma.complianceAuditLog.create({
    data: {
      module: 'consent',
      action: 'created',
      entityId: record.id,
      entityType: 'ConsentRecord',
      changes: { subjectId, version, consents },
    },
  });

  return res.status(201).json(record);
});

// ---------------------------------------------------------------------------
// DELETE /consent?subjectId=xxx
// ---------------------------------------------------------------------------

/**
 * Revoke all active consent records for a data subject.
 *
 * NDPA Section 26 grants the right to withdraw consent at any time.
 * Records are soft-revoked (revokedAt set) rather than deleted to preserve
 * the audit trail for regulatory inspection.
 *
 * Query params:
 *   subjectId (required) — stable identifier for the data subject
 *
 * Returns 200 `{ success: true }` when complete.
 */
consentRouter.delete('/', async (req, res) => {
  const { subjectId } = req.query;

  if (!subjectId || typeof subjectId !== 'string') {
    return res.status(400).json({ error: 'subjectId required' });
  }

  await prisma.consentRecord.updateMany({
    where: { subjectId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  await prisma.complianceAuditLog.create({
    data: {
      module: 'consent',
      action: 'revoked',
      entityId: subjectId,
      entityType: 'ConsentRecord',
    },
  });

  return res.json({ success: true });
});
