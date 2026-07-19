import type { NextRequest } from 'next/server';

export interface NDPRVerifiedActor {
  /** Stable identity and profile fields from a verified server session. */
  id: string;
  displayName: string;
  email: string;
  department?: string;
  /** Stable data-subject identifier for this account, when applicable. */
  subjectId?: string;
  /** Map application roles to ndpr:staff or ndpr:admin server-side. */
  roles: readonly string[];
}

export interface NDPRRequestContext {
  /** Verified tenant boundary. Never take this value from request input. */
  tenantId: string;
  /** Normalized verified actor; null for public/anonymous requests. */
  actor: NDPRVerifiedActor | null;
  actorId: string | null;
  /** Verified account subject ID or high-entropy anonymous browser ID. */
  subjectId: string | null;
  subjectSource: 'verified-account-subject' | 'anonymous-uuid-capability' | null;
  /** Verified application roles used by your authorization policy. */
  roles: readonly string[];
}

export type NDPRContextRequirement = 'tenant' | 'subject' | 'staff';
export interface NDPRContextProblem { status: 401 | 403 | 503; error: string }
export type NDPRVerifiedActorResolver = (
  request: NextRequest,
) => Promise<NDPRVerifiedActor | null>;

const ANONYMOUS_SUBJECT_PATTERN =
  /^anon_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STAFF_ROLES = new Set(['ndpr:staff', 'ndpr:admin']);

/**
 * Authentication integration seam. Replace this safe default with your
 * verified server session provider. Never trust actor, account subject,
 * profile, role, or tenant fields from request-controlled input.
 */
export async function resolveVerifiedNDPRActor(
  _request: NextRequest,
): Promise<NDPRVerifiedActor | null> {
  return null;
}

/**
 * The tenant comes only from server configuration. The only client-provided
 * identity accepted by default is a random anon_<UUID> subject capability;
 * it never grants staff access.
 */
export async function resolveNDPRRequestContext(
  request: NextRequest,
  actorResolver: NDPRVerifiedActorResolver = resolveVerifiedNDPRActor,
): Promise<NDPRRequestContext> {
  const tenantId = process.env.NDPR_TENANT_ID?.trim() ?? '';
  const candidate = request.headers.get('x-ndpr-subject-id')?.trim() ?? '';
  const anonymousSubjectId = ANONYMOUS_SUBJECT_PATTERN.test(candidate)
    ? candidate
    : null;
  const actor = normalizeVerifiedActor(await actorResolver(request));
  const subjectId = actor?.subjectId ?? anonymousSubjectId;
  const subjectSource = actor?.subjectId
    ? 'verified-account-subject' as const
    : anonymousSubjectId
      ? 'anonymous-uuid-capability' as const
      : null;

  return {
    tenantId,
    actor,
    actorId: actor?.id ?? null,
    subjectId,
    subjectSource,
    roles: actor?.roles ?? [],
  };
}

export function getNDPRContextProblem(
  context: NDPRRequestContext,
  requirement: NDPRContextRequirement,
): NDPRContextProblem | null {
  if (!context.tenantId) {
    return {
      status: 503,
      error: 'NDPR_TENANT_ID is not configured on the server',
    };
  }
  if (requirement === 'subject' && !context.subjectId) {
    return { status: 401, error: 'A verified data-subject identity is required' };
  }
  if (requirement === 'staff' && !context.actorId) {
    return {
      status: 401,
      error: 'Connect resolveVerifiedNDPRActor to verified staff authentication',
    };
  }
  if (requirement === 'staff'
    && !context.roles.some((role) => STAFF_ROLES.has(role))) {
    return { status: 403, error: 'NDPR staff or administrator role required' };
  }
  return null;
}

function normalizeVerifiedActor(
  actor: NDPRVerifiedActor | null,
): NDPRVerifiedActor | null {
  if (!actor
    || typeof actor.id !== 'string'
    || typeof actor.displayName !== 'string'
    || typeof actor.email !== 'string'
    || !Array.isArray(actor.roles)) {
    return null;
  }
  const id = actor.id.trim();
  const displayName = actor.displayName.trim();
  const email = actor.email.trim();
  if (!id || !displayName || !email) return null;

  return {
    id,
    displayName,
    email,
    department: typeof actor.department === 'string'
      ? actor.department.trim() || undefined
      : undefined,
    subjectId: typeof actor.subjectId === 'string'
      ? actor.subjectId.trim() || undefined
      : undefined,
    roles: actor.roles
      .filter((role): role is string => typeof role === 'string')
      .map((role) => role.trim())
      .filter(Boolean),
  };
}
