import type { NextRequest } from 'next/server';

export interface NDPRVerifiedActor {
  /** Stable account identifier from a verified server session. */
  id: string;
  /** Display attributes read from the verified account, never request input. */
  displayName: string;
  email: string;
  department?: string;
  phone?: string;
  /** Stable data-subject identifier for the signed-in account, when applicable. */
  subjectId?: string;
  /** Application roles mapped to the explicit NDPR roles below. */
  roles: readonly string[];
}

export interface NDPRRequestContext {
  /** Tenant boundary sourced only from server configuration. */
  tenantId: string;
  /** Verified actor details; null when there is no authenticated server session. */
  actor: NDPRVerifiedActor | null;
  actorId: string | null;
  /** Verified account subject or a UUID-shaped anonymous capability. */
  subjectId: string | null;
  /** Provenance for the resolved subject identifier used in accountability events. */
  subjectSource: 'verified-account-subject' | 'anonymous-uuid-capability' | null;
  roles: readonly string[];
}

export type NDPRContextRequirement = 'tenant' | 'subject' | 'staff';
export interface NDPRContextProblem {
  status: 401 | 403 | 503;
  error: string;
}

export type NDPRVerifiedActorResolver = (
  request: NextRequest,
) => Promise<NDPRVerifiedActor | null>;

const ANONYMOUS_SUBJECT_PATTERN =
  /^anon_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STAFF_ROLES = new Set(['ndpr:staff', 'ndpr:admin']);

/**
 * Verified actor integration hook.
 *
 * Replace this safe, fail-closed implementation with your server-side session
 * provider. Map application roles to `ndpr:staff` or `ndpr:admin`, and populate
 * actor attributes from the verified account/session only. Never read tenant,
 * actor, account-subject, or role claims from query parameters, request bodies,
 * or arbitrary client headers.
 */
export async function resolveVerifiedNDPRActor(
  _request: NextRequest,
): Promise<NDPRVerifiedActor | null> {
  return null;
}

/**
 * Resolve the security context shared by every Next.js recipe route.
 *
 * The only client-supplied identity accepted by the default seam is a random
 * `anon_<UUID>` capability in `X-NDPR-Subject-Id`. It grants access only to the
 * matching subject's consent/DSR data and never grants staff authorization.
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
  const resolvedActor = normalizeVerifiedActor(await actorResolver(request));
  const subjectId = resolvedActor?.subjectId ?? anonymousSubjectId;
  const subjectSource = resolvedActor?.subjectId
    ? 'verified-account-subject' as const
    : anonymousSubjectId
      ? 'anonymous-uuid-capability' as const
      : null;

  return {
    tenantId,
    actor: resolvedActor,
    actorId: resolvedActor?.id ?? null,
    subjectId,
    subjectSource,
    roles: resolvedActor?.roles ?? [],
  };
}

export function isNDPRStaffContext(context: NDPRRequestContext): boolean {
  return Boolean(
    context.actorId && context.roles.some((role) => STAFF_ROLES.has(role)),
  );
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
  if (requirement === 'staff' && !isNDPRStaffContext(context)) {
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
    phone: typeof actor.phone === 'string' ? actor.phone.trim() || undefined : undefined,
    subjectId: typeof actor.subjectId === 'string'
      ? actor.subjectId.trim() || undefined
      : undefined,
    roles: actor.roles
      .filter((role): role is string => typeof role === 'string')
      .map((role) => role.trim())
      .filter(Boolean),
  };
}
