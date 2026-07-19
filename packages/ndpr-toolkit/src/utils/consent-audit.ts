import type { ConsentSettings } from '../types/consent';

const DEFAULT_STORAGE_KEY = 'ndpr_consent';
const AUDIT_SUFFIX = '_audit';

/**
 * Client consent activity records are mutable browser state. They can support
 * UX and troubleshooting, but they are not append-only, tamper-evident, or
 * authoritative regulatory evidence. Persist authoritative records through
 * an authenticated server-side system with retention and integrity controls.
 */
export const CLIENT_CONSENT_ACTIVITY_NOTICE =
  'Browser consent activity is mutable UX state, not authoritative compliance evidence.';

/** A client-side snapshot of a consent action. */
export interface ConsentAuditEntry {
  action:
    | 'consent_given'
    | 'consent_withdrawn'
    | 'consent_updated'
    | 'consent_expired';
  timestamp: number;
  version: string;
  categories: Record<string, boolean>;
  method: string;
  /** Browser-provided context; optional and trivially spoofable. */
  userAgent?: string;
}

export type ConsentAuditAppendFailureReason =
  | 'storage-unavailable'
  | 'invalid-existing-log'
  | 'write-failed';

export interface ConsentAuditAppendResult {
  persisted: boolean;
  medium: 'local-storage';
  evidenceSuitability: 'ux-state-only';
  notice: typeof CLIENT_CONSENT_ACTIVITY_NOTICE;
  failureReason?: ConsentAuditAppendFailureReason;
  error?: unknown;
}

function determineAction(
  previous: ConsentSettings | null,
  current: ConsentSettings,
): ConsentAuditEntry['action'] {
  if (!previous) return 'consent_given';

  const allWithdrawn = Object.values(current.consents).every((value) => !value);
  if (allWithdrawn) return 'consent_withdrawn';

  const anyRevoked = Object.keys(previous.consents).some(
    (key) => previous.consents[key] && current.consents[key] === false,
  );
  return anyRevoked ? 'consent_withdrawn' : 'consent_updated';
}

/** Create a client activity snapshot from validated consent settings. */
export function createAuditEntry(
  settings: ConsentSettings,
  previousSettings?: ConsentSettings | null,
  actionOverride?: ConsentAuditEntry['action'],
): ConsentAuditEntry {
  const action =
    actionOverride ?? determineAction(previousSettings ?? null, settings);

  return {
    action,
    timestamp: settings.timestamp || Date.now(),
    version: settings.version,
    categories: { ...settings.consents },
    method: settings.method,
    userAgent:
      typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  };
}

/**
 * Retrieve mutable client activity from localStorage. An empty array means
 * either no data or unavailable/invalid browser storage; do not use this as
 * proof that no consent activity occurred.
 */
export function getAuditLog(
  storageKey: string = DEFAULT_STORAGE_KEY,
): ConsentAuditEntry[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return [];

  try {
    const raw = localStorage.getItem(`${storageKey}${AUDIT_SUFFIX}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as ConsentAuditEntry[]) : [];
  } catch {
    return [];
  }
}

/**
 * Add an entry by rewriting the localStorage array. This operation is neither
 * atomic nor append-only. Its result makes write failures observable while
 * remaining backward-compatible for callers that ignore the return value.
 */
export function appendAuditEntry(
  entry: ConsentAuditEntry,
  storageKey: string = DEFAULT_STORAGE_KEY,
): ConsentAuditAppendResult {
  const baseResult: Pick<
    ConsentAuditAppendResult,
    'medium' | 'evidenceSuitability' | 'notice'
  > = {
    medium: 'local-storage',
    evidenceSuitability: 'ux-state-only',
    notice: CLIENT_CONSENT_ACTIVITY_NOTICE,
  };

  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return {
      ...baseResult,
      persisted: false,
      failureReason: 'storage-unavailable',
    };
  }

  const auditKey = `${storageKey}${AUDIT_SUFFIX}`;
  try {
    const raw = localStorage.getItem(auditKey);
    let existing: ConsentAuditEntry[] = [];
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        return {
          ...baseResult,
          persisted: false,
          failureReason: 'invalid-existing-log',
          error: new TypeError('Existing client consent activity is not an array'),
        };
      }
      existing = parsed as ConsentAuditEntry[];
    }

    localStorage.setItem(auditKey, JSON.stringify([...existing, entry]));
    return { ...baseResult, persisted: true };
  } catch (error) {
    return {
      ...baseResult,
      persisted: false,
      failureReason:
        error instanceof SyntaxError ? 'invalid-existing-log' : 'write-failed',
      error,
    };
  }
}
