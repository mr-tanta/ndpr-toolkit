import {
  classifyDCPMI,
  generateComplianceAuditReturn,
} from '@tantainnovative/ndpr-toolkit/server';
import { NextRequest, NextResponse } from 'next/server';
import {
  getNDPRContextProblem,
  resolveNDPRRequestContext,
} from '../../request-context';

/** Authenticated operational classification using staff-supplied inputs. */
export async function GET(request: NextRequest) {
  const context = await resolveNDPRRequestContext(request);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return NextResponse.json({ error: problem.error }, { status: problem.status });

  const search = request.nextUrl.searchParams;
  const dataSubjects = Number(search.get('dataSubjects') ?? '0');
  const isDesignated = search.get('designated') === 'true';
  const commencementDate = search.get('commencementDate') ?? undefined;
  const asOf = search.get('asOf') ?? new Date().toISOString().slice(0, 10);

  if (!Number.isInteger(dataSubjects) || dataSubjects < 0) {
    return NextResponse.json(
      { error: 'dataSubjects must be a non-negative integer' },
      { status: 400 },
    );
  }
  if (commencementDate && !isIsoDate(commencementDate)) {
    return NextResponse.json(
      { error: 'commencementDate must use YYYY-MM-DD' },
      { status: 400 },
    );
  }
  if (!isIsoDate(asOf)) {
    return NextResponse.json({ error: 'asOf must use YYYY-MM-DD' }, { status: 400 });
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

  return NextResponse.json({
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
}

function isIsoDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime())
    && parsed.getUTCFullYear() === Number(match[1])
    && parsed.getUTCMonth() + 1 === Number(match[2])
    && parsed.getUTCDate() === Number(match[3]);
}
