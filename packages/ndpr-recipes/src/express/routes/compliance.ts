import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import {
  getNDPRContextProblem,
  resolveNDPRRequestContext,
} from '../request-context';
import { buildOperationalIndicators } from '../../nextjs/operational-indicators';

const prisma = new PrismaClient();
export const complianceRouter = Router();

/**
 * Staff-only tenant observations. Empty datasets are not scored as 100 and
 * this response is explicitly advisory rather than a legal compliance score.
 */
complianceRouter.get('/', async (request, response) => {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return response.status(problem.status).json({ error: problem.error });

  return response.json(
    await buildOperationalIndicators(prisma, context.tenantId),
  );
});
