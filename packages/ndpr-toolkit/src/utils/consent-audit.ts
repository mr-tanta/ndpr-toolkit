import { ConsentSettings } from '../types/consent';

const DEFAULT_STORAGE_KEY = 'ndpr_consent';
const AUDIT_SUFFIX = '_audit';

/**
 * Represents a single entry in the consent audit trail.
 * Each entry captures what happened, when, and the full consent state
 * at that point in time, satisfying NDPA recordkeeping requirements.
 */
export interface ConsentAuditEntry {
  /** The type of consent action that occurred */
  action: 'consent_given' | 'consent_withdrawn' | 'consent_updated' | 'consent_expired';
  /** Unix timestamp (ms) when the action occurred */
  timestamp: number;
  /** Version of the consent form at the time of the action */
  version: string;
  /** Full snapshot of consent category states */
  categories: Record<string, boolean>;
  /** How consent was collected (e.g. "banner", "customize", "api") */
  method: string;
  /** Browser user-agent string for forensic traceability */
  userAgent?: string;
}

/**
 * Determines the appropriate audit action by comparing previous and current
 * consent settings. Returns the action type that best describes the change.
 */
function determineAction(
  previous: ConsentSettings | null,
  current: ConsentSettings
): ConsentAuditEntry['action'] {
  if (!previous) {
    return 'consent_given';
  }

  const prevConsents = previous.consents;
  const currConsents = current.consents;

  // Check if all current consents are false/withdrawn
  const allWithdrawn = Object.values(currConsents).every(v => !v);
  if (allWithdrawn) {
    return 'consent_withdrawn';
  }

  // Check if any previously-true consent is now false
  const anyRevoked = Object.keys(prevConsents).some(
    key => prevConsents[key] && currConsents[key] === false
  );
  if (anyRevoked) {
    return 'consent_withdrawn';
  }

  return 'consent_updated';
}

/**
 * Creates a new audit entry from consent settings. If `previousSettings` is
 * provided, the action is automatically determined by comparing old and new
 * states. Otherwise `action` defaults to `'consent_given'`.
 */
export function createAuditEntry(
  settings: ConsentSettings,
  previousSettings?: ConsentSettings | null,
  actionOverride?: ConsentAuditEntry['action']
): ConsentAuditEntry {
  const action = actionOverride ?? determineAction(previousSettings ?? null, settings);

  return {
    action,
    timestamp: settings.timestamp || Date.now(),
    version: settings.version,
    categories: { ...settings.consents },
    method: settings.method,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  };
}

/**
 * Retrieves the full consent audit log from localStorage.
 * Returns an empty array if no log exists or parsing fails.
 *
 * @param storageKey - Base storage key (the audit key is derived as `${storageKey}_audit`)
 */
export function getAuditLog(storageKey: string = DEFAULT_STORAGE_KEY): ConsentAuditEntry[] {
  const auditKey = `${storageKey}${AUDIT_SUFFIX}`;

  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = localStorage.getItem(auditKey);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Appends a single audit entry to the consent audit log in localStorage.
 * The log is append-only; existing entries are never modified.
 *
 * @param entry     - The audit entry to append
 * @param storageKey - Base storage key (the audit key is derived as `${storageKey}_audit`)
 */
export function appendAuditEntry(
  entry: ConsentAuditEntry,
  storageKey: string = DEFAULT_STORAGE_KEY
): void {
  const auditKey = `${storageKey}${AUDIT_SUFFIX}`;

  if (typeof window === 'undefined') {
    return;
  }

  try {
    const existing = getAuditLog(storageKey);
    existing.push(entry);
    localStorage.setItem(auditKey, JSON.stringify(existing));
  } catch {
    // Silently fail — storage may be full or unavailable
  }
}
