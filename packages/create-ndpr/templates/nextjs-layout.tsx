'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { NDPRProvider } from '@tantainnovative/ndpr-toolkit';
import { NDPRConsent } from '@tantainnovative/ndpr-toolkit/presets';
import { apiAdapter } from '@tantainnovative/ndpr-toolkit/adapters';
import type {
  StorageAdapter,
  ConsentSettings,
} from '@tantainnovative/ndpr-toolkit/core';

const SUBJECT_STORAGE_KEY = 'ndpr_anonymous_subject_id';
const SUBJECT_COOKIE = 'ndpr_subject_id';
const ANONYMOUS_SUBJECT_PATTERN =
  /^anon_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface StoredConsent {
  consents: Record<string, boolean>;
  version: string;
  method: string;
  lawfulBasis?: ConsentSettings['lawfulBasis'] | null;
  hasInteracted?: boolean;
  createdAt: string;
}

function getOrCreateAnonymousSubjectId(): string {
  try {
    const stored = window.localStorage.getItem(SUBJECT_STORAGE_KEY);
    if (stored && ANONYMOUS_SUBJECT_PATTERN.test(stored)) return stored;
  } catch {
    // Storage can be disabled; the first-party cookie remains a fallback.
  }

  const cookie = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SUBJECT_COOKIE}=`));
  if (cookie) {
    try {
      const existing = decodeURIComponent(cookie.slice(cookie.indexOf('=') + 1));
      if (ANONYMOUS_SUBJECT_PATTERN.test(existing)) return existing;
    } catch {
      // Ignore malformed percent encoding and replace the invalid cookie below.
    }
  }

  const subjectId = `anon_${crypto.randomUUID()}`;
  try {
    window.localStorage.setItem(SUBJECT_STORAGE_KEY, subjectId);
  } catch {
    // Cookie persistence below may still succeed.
  }
  document.cookie = [
    `${SUBJECT_COOKIE}=${encodeURIComponent(subjectId)}`,
    'path=/',
    'max-age=31536000',
    'samesite=lax',
    location.protocol === 'https:' ? 'secure' : '',
  ].filter(Boolean).join('; ');
  return subjectId;
}

function createConsentAdapter(
  subjectId: string,
): StorageAdapter<ConsentSettings> {
  const remote = apiAdapter<StoredConsent | ConsentSettings>('/api/consent', {
    credentials: 'same-origin',
    headers: { 'X-NDPR-Subject-Id': subjectId },
    idempotencyKey: ({ method, payload }) => {
      const timestamp = payload && 'timestamp' in payload
        ? payload.timestamp
        : crypto.randomUUID();
      return `${subjectId}:${method}:${timestamp}`;
    },
  });

  return {
    capabilities: remote.capabilities,
    async load() {
      const record = await remote.load();
      if (!record) return null;
      if (
        'timestamp' in record
        && typeof record.timestamp === 'number'
        && Number.isSafeInteger(record.timestamp)
      ) {
        return record;
      }
      if (!('createdAt' in record)) return null;
      const timestamp = Date.parse(record.createdAt);
      if (!Number.isFinite(timestamp)) return null;
      return {
        consents: record.consents,
        version: record.version,
        method: record.method,
        lawfulBasis: record.lawfulBasis ?? undefined,
        timestamp,
        hasInteracted: record.hasInteracted !== false,
      };
    },
    save(settings) {
      return remote.save(settings);
    },
    remove() {
      return remote.remove();
    },
  };
}

interface NDPRClientProviderProps { children: React.ReactNode }

/**
 * Client boundary for {{ORG_NAME_COMMENT}}. Authenticated identity is resolved by
 * the server-side request-context hook; never pass account IDs from the
 * browser as trusted identity.
 */
export default function NDPRClientProvider({ children }: NDPRClientProviderProps) {
  const [anonymousSubjectId, setAnonymousSubjectId] = useState<string | null>(null);
  useEffect(() => {
    setAnonymousSubjectId(getOrCreateAnonymousSubjectId());
  }, []);

  const consentAdapter = useMemo(
    () => anonymousSubjectId
      ? createConsentAdapter(anonymousSubjectId)
      : null,
    [anonymousSubjectId],
  );

  return (
    <NDPRProvider organizationName={`{{ORG_NAME_TEMPLATE}}`} dpoEmail={`{{DPO_EMAIL_TEMPLATE}}`}>
      {children}
      {consentAdapter ? <NDPRConsent adapter={consentAdapter} /> : null}
    </NDPRProvider>
  );
}
