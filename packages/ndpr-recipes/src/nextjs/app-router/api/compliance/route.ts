import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { buildOperationalIndicators } from '../../../operational-indicators';
import {
  getNDPRContextProblem,
  resolveNDPRRequestContext,
} from '../../request-context';

const prisma = new PrismaClient();

/**
 * Return authenticated, tenant-scoped operational indicators.
 *
 * This endpoint intentionally does not call the observations a legal
 * compliance score. Empty datasets produce null rates and an explicit
 * not-observed applicability state rather than a misleading score of 100.
 */
export async function GET(request: NextRequest) {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return NextResponse.json({ error: problem.error }, { status: problem.status });

  return NextResponse.json(
    await buildOperationalIndicators(prisma, context.tenantId),
  );
}
