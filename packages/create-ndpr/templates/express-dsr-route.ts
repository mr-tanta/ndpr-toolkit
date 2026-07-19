/** Express — tenant-scoped data-subject request router for {{ORG_NAME_COMMENT}}. */
import { Router } from 'express';
import { getNDPRContextProblem, resolveNDPRRequestContext } from '{{NDPR_CONTEXT_IMPORT}}';
// {{#if ORM=prisma}}
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// {{/if}}
// {{#if ORM=drizzle}}
import { db } from '{{NDPR_DB_IMPORT}}';
import { complianceAuditLog, dsrRequests } from '{{NDPR_SCHEMA_IMPORT}}';
import { and, desc, eq } from 'drizzle-orm';
// {{/if}}
// {{#if ORM=none}}
// DEVELOPMENT ONLY: replace both stores with one durable transactional store.
interface DSRRow { id: string; tenantId: string; subjectId: string; type: string; status: string; subjectName: string; subjectEmail: string; subjectPhone: string | null; identifierType: string; identifierValue: string; description: string | null; submittedAt: Date; dueAt: Date }
const dsrStore = new Map<string, DSRRow>();
const auditLog: Array<{ id: string; tenantId: string; action: string; entityId: string; performedBy: string | null; at: Date }> = [];
// {{/if}}

const REQUEST_TYPES = new Set(['access', 'rectification', 'erasure', 'portability', 'objection', 'restriction']);
export const dsrRouter = Router();

dsrRouter.get('/', async (req, res) => {
  const context = await resolveNDPRRequestContext(req);
  const problem = getNDPRContextProblem(context, 'staff');
  if (problem) return res.status(problem.status).json({ error: problem.error });
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  // {{#if ORM=prisma}}
  const requests = await prisma.dSRRequest.findMany({ where: { tenantId: context.tenantId, ...(status ? { status } : {}) }, orderBy: { submittedAt: 'desc' } });
  // {{/if}}
  // {{#if ORM=drizzle}}
  const requests = status
    ? await db.select().from(dsrRequests).where(and(eq(dsrRequests.tenantId, context.tenantId), eq(dsrRequests.status, status))).orderBy(desc(dsrRequests.submittedAt))
    : await db.select().from(dsrRequests).where(eq(dsrRequests.tenantId, context.tenantId)).orderBy(desc(dsrRequests.submittedAt));
  // {{/if}}
  // {{#if ORM=none}}
  const requests = [...dsrStore.values()].filter((row) => row.tenantId === context.tenantId && (!status || row.status === status)).sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  // {{/if}}
  return res.json(requests);
});

dsrRouter.post('/', async (req, res) => {
  const context = await resolveNDPRRequestContext(req);
  const problem = getNDPRContextProblem(context, 'subject');
  if (problem) return res.status(problem.status).json({ error: problem.error });
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) return res.status(400).json({ error: 'A JSON object is required' });
  const input = req.body as Record<string, unknown>;
  const required = ['type', 'subjectName', 'subjectEmail', 'identifierType', 'identifierValue'] as const;
  if (required.some((field) => typeof input[field] !== 'string' || !(input[field] as string).trim()) || !REQUEST_TYPES.has(input.type as string)) {
    return res.status(400).json({ error: `Required strings: ${required.join(', ')}; type must be one of ${[...REQUEST_TYPES].join(', ')}` });
  }
  const submittedAt = new Date();
  // Operational target; confirm and configure this deadline for your applicable obligations.
  const dueAt = new Date(submittedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
  const data = { tenantId: context.tenantId, subjectId: context.subjectId as string, type: input.type as string, subjectName: input.subjectName as string, subjectEmail: input.subjectEmail as string, subjectPhone: typeof input.subjectPhone === 'string' ? input.subjectPhone : null, identifierType: input.identifierType as string, identifierValue: input.identifierValue as string, description: typeof input.description === 'string' ? input.description : null, status: 'pending', dueAt };
  // {{#if ORM=prisma}}
  const request = await prisma.$transaction(async (tx) => {
    const created = await tx.dSRRequest.create({ data });
    await tx.complianceAuditLog.create({ data: { tenantId: context.tenantId, module: 'dsr', action: 'submitted', entityId: created.id, entityType: 'DSRRequest', performedBy: context.actorId, changes: { type: data.type, subjectId: data.subjectId, status: 'pending' } } });
    return created;
  });
  // {{/if}}
  // {{#if ORM=drizzle}}
  const request = await db.transaction(async (tx) => {
    const [created] = await tx.insert(dsrRequests).values(data).returning();
    await tx.insert(complianceAuditLog).values({ tenantId: context.tenantId, module: 'dsr', action: 'submitted', entityId: created.id, entityType: 'DSRRequest', performedBy: context.actorId, changes: { type: data.type, subjectId: data.subjectId, status: 'pending' } });
    return created;
  });
  // {{/if}}
  // {{#if ORM=none}}
  const request: DSRRow = { id: crypto.randomUUID(), ...data, submittedAt };
  dsrStore.set(request.id, request);
  auditLog.push({ id: crypto.randomUUID(), tenantId: context.tenantId, action: 'submitted', entityId: request.id, performedBy: context.actorId, at: submittedAt });
  // {{/if}}
  return res.status(201).json(request);
});
