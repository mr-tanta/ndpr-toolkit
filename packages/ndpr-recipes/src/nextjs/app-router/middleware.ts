import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import {
  getNDPRContextProblem,
  resolveNDPRRequestContext,
} from './request-context';

const prisma = new PrismaClient();

/**
 * Node-runtime route-handler consent guard.
 *
 * This helper performs a database lookup and is not suitable for an Edge
 * `middleware.ts`. Identity is resolved by the shared request-context seam;
 * cookies, query parameters, and unvalidated subject headers are never used.
 */
export async function consentMiddleware(
  request: NextRequest,
  requiredConsent: string,
): Promise<NextResponse | null> {
  if (!requiredConsent.trim()) {
    return NextResponse.json(
      { error: 'A consent category must be configured by the server' },
      { status: 500 },
    );
  }

  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'subject');
  if (problem) {
    return NextResponse.json({ error: problem.error }, { status: problem.status });
  }

  const record = await prisma.consentRecord.findFirst({
    where: {
      tenantId: context.tenantId,
      subjectId: context.subjectId as string,
      revokedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  });
  if (!record) {
    return NextResponse.json({ error: 'No active consent on record' }, { status: 403 });
  }

  const consents = record.consents as Record<string, unknown>;
  if (consents[requiredConsent] !== true) {
    return NextResponse.json(
      { error: `Consent for "${requiredConsent}" not granted` },
      { status: 403 },
    );
  }
  return null;
}

export function withConsent<TContext>(
  requiredConsent: string,
  handler: (request: NextRequest, context: TContext) => Promise<Response>,
) {
  return async (request: NextRequest, context: TContext): Promise<Response> => {
    const guard = await consentMiddleware(request, requiredConsent);
    return guard ?? handler(request, context);
  };
}
