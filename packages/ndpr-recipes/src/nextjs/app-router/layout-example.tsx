'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  NDPRProvider,
  validateConsentStructured,
  type ConsentSettings,
  type StorageAdapter,
} from '@tantainnovative/ndpr-toolkit';
import { apiAdapter } from '@tantainnovative/ndpr-toolkit/adapters';
import { NDPRConsent } from '@tantainnovative/ndpr-toolkit/presets';

const CONSENT_VERSION = '1.0';
const SUBJECT_STORAGE_KEY = 'ndpr_anonymous_subject_id';
const SUBJECT_COOKIE = 'ndpr_subject_id';
const ANONYMOUS_SUBJECT_PATTERN =
  /^anon_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface NDPRLayoutProps {
  children: React.ReactNode;
}

/**
 * Example client boundary for anonymous consent.
 *
 * Authenticated account identity must be resolved by the server-side
 * `request-context.ts` integration hook. It must never be passed from this
 * browser component as trusted identity.
 */
export default function NDPRLayout({ children }: NDPRLayoutProps) {
  const [subjectId, setSubjectId] = useState<string | null>(null);

  useEffect(() => {
    setSubjectId(getOrCreateAnonymousSubjectId());
  }, []);

  const consentAdapter = useMemo<StorageAdapter<ConsentSettings> | null>(
    () => subjectId ? createConsentAdapter(subjectId) : null,
    [subjectId],
  );

  return (
    <NDPRProvider
      organizationName="Your Company"
      dpoEmail="dpo@yourcompany.ng"
    >
      {children}
      {consentAdapter ? <HydratedConsent adapter={consentAdapter} /> : null}
    </NDPRProvider>
  );
}

/** Do not flash a banner until the server-backed preference has hydrated. */
function HydratedConsent({
  adapter,
}: {
  adapter: StorageAdapter<ConsentSettings>;
}) {
  const [show, setShow] = useState<boolean | null>(null);
  const [revision, setRevision] = useState(0);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);
  const acknowledgedAdapter = useMemo<StorageAdapter<ConsentSettings>>(
    () => ({
      capabilities: adapter.capabilities,
      load: () => adapter.load(),
      async save(settings) {
        setPersistenceError(null);
        try {
          await adapter.save(settings);
          setShow(false);
        } catch {
          setPersistenceError('Consent could not be saved. Please try again.');
          setShow(true);
          setRevision((current) => current + 1);
        }
      },
      remove: () => adapter.remove(),
    }),
    [adapter],
  );

  useEffect(() => {
    let cancelled = false;
    Promise.resolve(adapter.load()).then(
      (settings) => {
        if (cancelled) return;
        if (!settings) {
          setShow(true);
          return;
        }
        const validation = validateConsentStructured(settings);
        setShow(
          !validation.valid ||
          !validation.data ||
          validation.data.version !== CONSENT_VERSION ||
          validation.data.hasInteracted !== true,
        );
      },
      () => {
        if (!cancelled) {
          setPersistenceError('Consent preferences could not be loaded.');
          setShow(true);
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [adapter]);

  if (show !== true) return null;
  return (
    <>
      {persistenceError ? <p role="alert">{persistenceError}</p> : null}
      <NDPRConsent key={revision} adapter={acknowledgedAdapter} />
    </>
  );
}

function createConsentAdapter(
  subjectId: string,
): StorageAdapter<ConsentSettings> {
  return apiAdapter<ConsentSettings>('/api/consent', {
    credentials: 'same-origin',
    headers: { 'X-NDPR-Subject-Id': subjectId },
    loadFailureMode: 'throw',
    mutationFailureMode: 'throw',
    retry: { attempts: 2, baseDelayMs: 250 },
    idempotencyKey: ({ method, payload }) => {
      const operation = method === 'save' && payload
        ? String(payload.timestamp)
        : crypto.randomUUID();
      return `${subjectId}:${method}:${operation}`;
    },
  });
}

function getOrCreateAnonymousSubjectId(): string {
  try {
    const stored = window.localStorage.getItem(SUBJECT_STORAGE_KEY);
    if (stored && ANONYMOUS_SUBJECT_PATTERN.test(stored)) {
      persistSubjectCookie(stored);
      return stored;
    }
  } catch {
    // Browser storage can be disabled; use the first-party cookie fallback.
  }

  const cookie = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SUBJECT_COOKIE}=`));
  if (cookie) {
    try {
      const value = decodeURIComponent(cookie.slice(cookie.indexOf('=') + 1));
      if (ANONYMOUS_SUBJECT_PATTERN.test(value)) {
        try {
          window.localStorage.setItem(SUBJECT_STORAGE_KEY, value);
        } catch {
          // Cookie persistence is sufficient for this anonymous capability.
        }
        return value;
      }
    } catch {
      // Ignore malformed cookie encoding and replace it with a fresh capability below.
    }
  }

  const subjectId = `anon_${crypto.randomUUID()}`;
  try {
    window.localStorage.setItem(SUBJECT_STORAGE_KEY, subjectId);
  } catch {
    // Cookie persistence below remains available.
  }
  persistSubjectCookie(subjectId);
  return subjectId;
}

function persistSubjectCookie(subjectId: string): void {
  document.cookie = [
    `${SUBJECT_COOKIE}=${encodeURIComponent(subjectId)}`,
    'path=/',
    'max-age=31536000',
    'samesite=lax',
    location.protocol === 'https:' ? 'secure' : '',
  ].filter(Boolean).join('; ');
}
