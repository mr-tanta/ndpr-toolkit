import { Router } from 'express';
import { breachRouter } from './routes/breach';
import { complianceRouter } from './routes/compliance';
import { consentRouter } from './routes/consent';
import { dpiaRouter } from './routes/dpia';
import { dsrRouter } from './routes/dsr';
import { registrationRouter } from './routes/registration';
import { ropaRouter } from './routes/ropa';

/**
 * Assemble the NDPR recipe routes.
 *
 * Before enabling staff routes, replace `resolveVerifiedNDPRActor` in
 * `request-context.ts` with verified Express auth/session integration and map
 * host roles to `ndpr:staff` or `ndpr:admin`. The fail-closed default permits
 * only tenant-scoped anonymous consent/DSR subject operations.
 */
export function createNDPRRouter(): Router {
  const router = Router();
  router.use('/consent', consentRouter);
  router.use('/dsr', dsrRouter);
  router.use('/dpia', dpiaRouter);
  router.use('/breach', breachRouter);
  router.use('/compliance', complianceRouter);
  router.use('/ropa', ropaRouter);
  router.use('/registration', registrationRouter);
  return router;
}

export { consentRouter } from './routes/consent';
export { dsrRouter } from './routes/dsr';
export { dpiaRouter } from './routes/dpia';
export { breachRouter } from './routes/breach';
export { complianceRouter } from './routes/compliance';
export { ropaRouter } from './routes/ropa';
export { registrationRouter } from './routes/registration';
export { requireConsent, requireAllConsents } from './middleware/consent-check';
export {
  getNDPRContextProblem,
  isNDPRStaffContext,
  resolveNDPRRequestContext,
  resolveVerifiedNDPRActor,
} from './request-context';
export type {
  NDPRContextProblem,
  NDPRContextRequirement,
  NDPRRequestContext,
  NDPRVerifiedActor,
  NDPRVerifiedActorResolver,
} from './request-context';
