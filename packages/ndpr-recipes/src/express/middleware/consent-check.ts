import { PrismaClient } from '@prisma/client';
import type { RequestHandler } from 'express';
import {
  getNDPRContextProblem,
  resolveNDPRRequestContext,
} from '../request-context';

const prisma = new PrismaClient();

/**
 * Tenant/subject-scoped consent guard. Only the validated anonymous capability
 * header or a verified account subject from the integration hook is accepted;
 * query parameters and cookies are not identity authority.
 */
export function requireConsent(consentType: string): RequestHandler {
  return requireAllConsents([consentType]);
}

export function requireAllConsents(consentTypes: readonly string[]): RequestHandler {
  const required = [...new Set(consentTypes.map((type) => type.trim()))].filter(Boolean);

  return async (request, response, next) => {
    if (required.length === 0) {
      response.status(500).json({ error: 'At least one consent category must be configured' });
      return;
    }

    const context = await resolveNDPRRequestContext(request);
    const problem = getNDPRContextProblem(context, 'subject');
    if (problem) {
      response.status(problem.status).json({ error: problem.error });
      return;
    }

    const row = await prisma.consentRecord.findFirst({
      where: {
        tenantId: context.tenantId,
        subjectId: context.subjectId as string,
        revokedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!row) {
      response.status(403).json({ error: 'No active consent on record' });
      return;
    }

    const consents = row.consents as Record<string, unknown>;
    const missing = required.filter((type) => consents[type] !== true);
    if (missing.length > 0) {
      response.status(403).json({
        error: `Consent not granted for: ${missing.join(', ')}`,
      });
      return;
    }

    response.locals.ndprConsentRecord = row;
    response.locals.ndprRequestContext = context;
    next();
  };
}
