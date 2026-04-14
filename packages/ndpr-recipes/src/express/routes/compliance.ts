/**
 * Express — Compliance Score Router
 *
 * Returns an overall NDPA compliance score by reading the current state of
 * all compliance-related tables. Designed for a DPO dashboard to surface
 * gaps and track compliance posture improvement over time.
 *
 * The score is calculated across five pillars (each 0–100):
 *   - Consent     (NDPA Section 25) — active consent records exist
 *   - DSR         (NDPA Sections 34–38) — requests processed without overdue violations
 *   - Breach      (NDPA Section 40) — incidents notified to NDPC within 72 hours
 *   - ROPA        (NDPA accountability principle) — active processing records exist
 *   - Audit trail (NDPA Section 44) — recent audit activity in the last 30 days
 *
 * Routes
 * ------
 *   GET /compliance   — Returns the current compliance score object
 *
 * @module express/routes/compliance
 */

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const complianceRouter = Router();

// ---------------------------------------------------------------------------
// Score calculation helpers
// ---------------------------------------------------------------------------

/** Consent pillar: 100 if any active consent records exist; 0 otherwise. */
async function consentScore(): Promise<number> {
  const total = await prisma.consentRecord.count({ where: { revokedAt: null } });
  return total > 0 ? 100 : 0;
}

/**
 * DSR pillar: penalises overdue requests.
 * Score = (1 − overdue/total) × 100, clamped to [0, 100].
 */
async function dsrScore(): Promise<number> {
  const total = await prisma.dSRRequest.count();
  if (total === 0) return 100;

  const overdue = await prisma.dSRRequest.count({
    where: {
      status: { in: ['pending', 'in_progress'] },
      dueAt: { lt: new Date() },
    },
  });

  return Math.max(0, Math.round((1 - overdue / total) * 100));
}

/**
 * Breach pillar: percentage of mature incidents (> 72 hours old) with NDPC notified.
 * New breaches inside the 72-hour window are excluded from the calculation.
 */
async function breachScore(): Promise<number> {
  const cutoff = new Date(Date.now() - 72 * 60 * 60 * 1000);
  const totalMature = await prisma.breachReport.count({ where: { reportedAt: { lt: cutoff } } });
  if (totalMature === 0) return 100;

  const notified = await prisma.breachReport.count({
    where: { reportedAt: { lt: cutoff }, ndpcNotificationSent: true },
  });

  return Math.round((notified / totalMature) * 100);
}

/** ROPA pillar: 100 if at least one active processing record exists; 0 otherwise. */
async function ropaScore(): Promise<number> {
  const active = await prisma.processingRecord.count({ where: { status: 'active' } });
  return active > 0 ? 100 : 0;
}

/** Audit trail pillar: 100 if there has been audit activity in the last 30 days. */
async function auditScore(): Promise<number> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recent = await prisma.complianceAuditLog.count({
    where: { createdAt: { gte: thirtyDaysAgo } },
  });
  return recent > 0 ? 100 : 0;
}

// ---------------------------------------------------------------------------
// GET /compliance
// ---------------------------------------------------------------------------

/**
 * Return the overall NDPA compliance score and per-pillar breakdown.
 *
 * The overall score is the arithmetic mean of the five pillar scores.
 * A score of 100 means all five pillars are fully compliant; lower scores
 * indicate specific areas that need attention.
 *
 * Returns 200 with:
 * {
 *   overall: number,      — aggregate score (0–100)
 *   pillars: {
 *     consent: number,
 *     dsr: number,
 *     breach: number,
 *     ropa: number,
 *     audit: number,
 *   },
 *   calculatedAt: string, — ISO timestamp
 * }
 */
complianceRouter.get('/', async (_req, res) => {
  const [consent, dsr, breach, ropa, audit] = await Promise.all([
    consentScore(),
    dsrScore(),
    breachScore(),
    ropaScore(),
    auditScore(),
  ]);

  const pillars = { consent, dsr, breach, ropa, audit };
  const overall = Math.round(
    Object.values(pillars).reduce((sum, v) => sum + v, 0) / Object.keys(pillars).length,
  );

  return res.json({
    overall,
    pillars,
    calculatedAt: new Date().toISOString(),
  });
});
