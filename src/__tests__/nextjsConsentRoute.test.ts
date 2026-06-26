/**
 * @jest-environment node
 */

import type { ConsentSettings } from '../../packages/ndpr-toolkit/src/types/consent';

const routePath = '../../examples/nextjs-app/app/api/consent/route';

async function loadConsentRoute() {
  jest.resetModules();
  jest.doMock('@tantainnovative/ndpr-toolkit/server', () =>
    jest.requireActual('../../packages/ndpr-toolkit/src/server'),
  );
  return import(routePath);
}

function requestWithJson(body: unknown, headers?: HeadersInit): Request {
  return new Request('https://example.test/api/consent', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe('Next.js consent backend reference route', () => {
  it('rejects invalid consent settings with structured field errors', async () => {
    const { GET, POST } = await loadConsentRoute();

    const response = await POST(requestWithJson({ consents: { analytics: true } }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Validation failed.');
    expect(body.fields).toEqual({
      timestamp: 'Consent timestamp is required',
      version: 'Consent version is required',
      method: 'Consent collection method is required',
      hasInteracted: 'User interaction status is required',
    });

    expect((await GET()).status).toBe(204);
  });

  it('persists valid consent with server-side audit metadata', async () => {
    const { GET, POST } = await loadConsentRoute();
    const payload: ConsentSettings = {
      consents: { necessary: true, analytics: true, marketing: false },
      timestamp: Date.now(),
      version: '2026.06',
      method: 'banner',
      hasInteracted: true,
      lawfulBasis: 'consent',
    };

    const response = await POST(
      requestWithJson(payload, {
        'user-agent': 'Jest Browser',
        'x-forwarded-for': '203.0.113.12',
      }),
    );
    const created = await response.json();

    expect(response.status).toBe(201);
    expect(created.success).toBe(true);
    expect(created.consent).toEqual(payload);
    expect(created.auditEntry).toEqual(
      expect.objectContaining({
        action: 'consent_given',
        categories: payload.consents,
        method: 'banner',
        version: '2026.06',
        userAgent: 'Jest Browser',
        ipAddress: '203.0.113.12',
      }),
    );
    expect(created.auditTrailLength).toBe(1);

    const getResponse = await GET();
    const stored = await getResponse.json();
    expect(getResponse.status).toBe(200);
    expect(stored.consent).toEqual(payload);
    expect(stored.auditTrail).toHaveLength(1);
  });

  it('records withdrawal on delete without erasing the audit trail', async () => {
    const { DELETE, GET, POST } = await loadConsentRoute();
    const payload: ConsentSettings = {
      consents: { necessary: true, analytics: true },
      timestamp: Date.now(),
      version: '2026.06',
      method: 'settings',
      hasInteracted: true,
    };

    await POST(requestWithJson(payload));
    const response = await DELETE();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.auditEntry).toEqual(
      expect.objectContaining({
        action: 'consent_withdrawn',
        categories: { necessary: false, analytics: false },
        version: '2026.06',
      }),
    );
    expect(body.auditTrailLength).toBe(2);

    const getResponse = await GET();
    const stored = await getResponse.json();
    expect(getResponse.status).toBe(200);
    expect(stored.consent).toBeNull();
    expect(stored.auditTrail).toHaveLength(2);
  });
});
