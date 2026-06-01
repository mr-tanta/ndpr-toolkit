/**
 * Express — DCPMI Registration & Compliance Audit Return Router
 *
 * Surfaces an organisation's NDPC GAID 2025 obligations:
 *   - DCPMI tier (UHL / EHL / OHL / listed / none) and annual registration fee,
 *     derived from the number of data subjects processed in a six-month window.
 *   - The Compliance Audit Return (CAR) schedule — initial-audit due date and the
 *     next annual filing deadline — for UHL/EHL controllers that must file.
 *
 * Both are pure computations from the toolkit's React-free `/server` entry, so
 * this router needs no database.
 *
 * Routes
 * ------
 *   GET /registration?dataSubjects=6200&commencementDate=2025-01-15
 *       — classify the tier and (when applicable) compute the CAR schedule.
 *
 * How to use
 * ----------
 * Mounted automatically by `createNDPRRouter()` in `../index.ts`.
 *
 * @module express/routes/registration
 */

import { Router } from 'express';
import {
  classifyDCPMI,
  generateComplianceAuditReturn,
} from '@tantainnovative/ndpr-toolkit/server';

export const registrationRouter = Router();

// GET /registration?dataSubjects=6200&commencementDate=2025-01-15&asOf=2026-06-01
registrationRouter.get('/', (req, res) => {
  const dataSubjects = Number(req.query.dataSubjects ?? 0);
  const isDesignated = req.query.designated === 'true';
  const commencementDate =
    typeof req.query.commencementDate === 'string' ? req.query.commencementDate : undefined;
  const asOf = typeof req.query.asOf === 'string' ? req.query.asOf : undefined;

  if (!Number.isFinite(dataSubjects) || dataSubjects < 0) {
    return res.status(400).json({ error: 'dataSubjects must be a non-negative number' });
  }

  const classification = classifyDCPMI({
    dataSubjectsInSixMonths: dataSubjects,
    isDesignated,
  });

  // UHL/EHL controllers must file CAR annually; OHL renews registration instead
  // and non-DCPMIs have no CAR obligation — reflected in `applicable`.
  const auditReturn = commencementDate
    ? generateComplianceAuditReturn({ commencementDate, tier: classification.tier, asOf })
    : null;

  return res.json({
    classification,
    auditReturn,
    asOf: asOf ?? new Date().toISOString().slice(0, 10),
  });
});
