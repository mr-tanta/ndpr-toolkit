/**
 * Express — NDPR Router Factory
 *
 * Assembles all NDPA compliance route modules into a single Express Router
 * that can be mounted at any path in your application with a single call.
 *
 * This entry point is the recommended way to add the full compliance API to
 * an existing Express or NestJS (with Express adapter) application.
 *
 * Mounted routes
 * --------------
 *   /consent    — Consent management (NDPA Section 25, 26)
 *   /dsr        — Data Subject Rights requests (NDPA Sections 34–38)
 *   /breach     — Breach notification workflow (NDPA Section 40)
 *   /compliance — Compliance score dashboard
 *   /ropa       — Record of Processing Activities (NDPA accountability principle)
 *
 * How to use
 * ----------
 * Copy this file and the `routes/` + `middleware/` directories into your project,
 * then mount the router in your Express app:
 *
 *   import express from 'express';
 *   import cookieParser from 'cookie-parser';
 *   import { createNDPRRouter } from './ndpr/express';
 *
 *   const app = express();
 *   app.use(express.json());
 *   app.use(cookieParser());   // required for consent cookie fallback
 *   app.use('/api/ndpr', createNDPRRouter());
 *
 * The full compliance API is then available at:
 *   GET  /api/ndpr/consent?subjectId=xxx
 *   POST /api/ndpr/dsr
 *   GET  /api/ndpr/compliance
 *   ... etc.
 *
 * Protecting routes with consent middleware
 * -----------------------------------------
 *   import { requireConsent } from './ndpr/express/middleware/consent-check';
 *
 *   app.post('/email/marketing', requireConsent('marketing'), sendEmailHandler);
 *
 * @module express/index
 */

import { Router } from 'express';
import { consentRouter } from './routes/consent';
import { dsrRouter } from './routes/dsr';
import { breachRouter } from './routes/breach';
import { complianceRouter } from './routes/compliance';
import { ropaRouter } from './routes/ropa';

/**
 * Create and return a fully configured NDPR compliance Express Router.
 *
 * All five compliance modules are mounted as sub-routers under their
 * respective path prefixes. Each module handles its own Prisma queries
 * and audit logging — no additional wiring is required beyond mounting
 * this router in your app.
 *
 * @returns An Express Router with all NDPR compliance routes mounted.
 */
export function createNDPRRouter(): Router {
  const router = Router();

  router.use('/consent', consentRouter);
  router.use('/dsr', dsrRouter);
  router.use('/breach', breachRouter);
  router.use('/compliance', complianceRouter);
  router.use('/ropa', ropaRouter);

  return router;
}

// Re-export middleware and individual routers for granular use.
export { consentRouter } from './routes/consent';
export { dsrRouter } from './routes/dsr';
export { breachRouter } from './routes/breach';
export { complianceRouter } from './routes/compliance';
export { ropaRouter } from './routes/ropa';
export { requireConsent, requireAllConsents } from './middleware/consent-check';
