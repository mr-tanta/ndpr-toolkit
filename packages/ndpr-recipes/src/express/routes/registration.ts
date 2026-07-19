import {
  classifyDCPMI,
  generateComplianceAuditReturn,
} from '@tantainnovative/ndpr-toolkit/server';
import { Router } from 'express';
import {
  getNDPRContextProblem,
  resolveNDPRRequestContext,
} from '../request-context';

export const registrationRouter = Router();

/** Authenticated operational classification using staff-supplied inputs. */
registrationRouter.get('/', async (request, response) => {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return response.status(problem.status).json({ error: problem.error });

  const dataSubjects = Number(request.query.dataSubjects ?? 0);
  const isDesignated = request.query.designated === 'true';
  const commencementDate = typeof request.query.commencementDate === 'string'
    ? request.query.commencementDate
    : undefined;
  const asOf = typeof request.query.asOf === 'string'
    ? request.query.asOf
    : new Date().toISOString().slice(0, 10);

  if (!Number.isInteger(dataSubjects) || dataSubjects < 0) {
    return response.status(400).json({ error: 'dataSubjects must be a non-negative integer' });
  }
  if (commencementDate && !isIsoDate(commencementDate)) {
    return response.status(400).json({ error: 'commencementDate must use YYYY-MM-DD' });
  }
  if (!isIsoDate(asOf)) {
    return response.status(400).json({ error: 'asOf must use YYYY-MM-DD' });
  }

  const classification = classifyDCPMI({
    dataSubjectsInSixMonths: dataSubjects,
    isDesignated,
  });
  const auditReturn = commencementDate
    ? generateComplianceAuditReturn({
        commencementDate,
        tier: classification.tier,
        asOf,
      })
    : null;

  return response.json({
    classification,
    auditReturn,
    asOf,
    tenantScope: { tenantId: context.tenantId, source: 'server NDPR_TENANT_ID' },
    provenance: {
      inputSource: 'authenticated staff query; not persisted evidence',
      dataSubjectsInSixMonths: dataSubjects,
      isDesignated,
      commencementDate: commencementDate ?? null,
    },
    advisoryNotice:
      'Operational classification aid only; verify source data, applicability, and current NDPC requirements.',
  });
});

function isIsoDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime())
    && parsed.getUTCFullYear() === Number(match[1])
    && parsed.getUTCMonth() + 1 === Number(match[2])
    && parsed.getUTCDate() === Number(match[3]);
}
