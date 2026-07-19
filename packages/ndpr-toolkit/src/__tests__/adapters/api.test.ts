import { apiAdapter, ApiAdapterError } from '../../adapters/api';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('apiAdapter', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('loads data via GET', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ consents: { analytics: true } }),
    });
    const adapter = apiAdapter<{ consents: Record<string, boolean> }>(
      '/api/consent',
    );
    await expect(adapter.load()).resolves.toEqual({
      consents: { analytics: true },
    });
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/consent',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('returns null on GET failure by default', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });
    await expect(apiAdapter('/api/consent').load()).resolves.toBeNull();
  });

  it('can expose strict GET failures', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 });
    await expect(
      apiAdapter('/api/consent', { loadFailureMode: 'throw' }).load(),
    ).rejects.toBeInstanceOf(ApiAdapterError);
  });

  it('saves data via POST', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200 });
    const data = { consents: { analytics: true } };
    await apiAdapter('/api/consent').save(data);
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/consent',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    );
  });

  it('removes data via DELETE', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204 });
    await apiAdapter('/api/consent').remove();
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/consent',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('accepts dynamic custom headers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => null,
    });
    const headers = jest.fn(() => ({ Authorization: 'Bearer token123' }));
    await apiAdapter('/api/consent', { headers }).load();
    expect(headers).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/consent',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer token123',
        }),
      }),
    );
  });

  it.each([
    ['save', 400],
    ['save', 500],
    ['remove', 403],
  ] as const)('rejects terminal %s failures (%s)', async (operation, status) => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockFetch.mockResolvedValueOnce({ ok: false, status });
    const adapter = apiAdapter('/api/consent');

    const result =
      operation === 'save' ? adapter.save({ test: true }) : adapter.remove();
    await expect(result).rejects.toBeInstanceOf(ApiAdapterError);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining(String(status)));
    warnSpy.mockRestore();
  });

  it('rejects a terminal network mutation failure', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    await expect(
      apiAdapter('/api/consent').save({ test: true }),
    ).rejects.toBeInstanceOf(ApiAdapterError);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to save'),
    );
    warnSpy.mockRestore();
  });

  it('supports explicitly graceful mutation failures', async () => {
    const onError = jest.fn();
    mockFetch.mockResolvedValueOnce({ ok: false, status: 409 });
    await expect(
      apiAdapter('/api/consent', {
        mutationFailureMode: 'graceful',
        onError,
      }).save({ test: true }),
    ).resolves.toBeUndefined();
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'save', status: 409 }),
    );
  });

  it('does not retry unsafe POST saves without an idempotency key', async () => {
    const onError = jest.fn();
    mockFetch.mockResolvedValue({ ok: false, status: 503 });
    await expect(
      apiAdapter('/api/consent', {
        retry: { attempts: 2, baseDelayMs: 0 },
        onError,
      }).save({ test: true }),
    ).rejects.toBeInstanceOf(ApiAdapterError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('retries POST with one stable idempotency key', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: true, status: 200 });
    const keyFactory = jest.fn(() => 'consent-operation-123');
    await apiAdapter('/api/consent', {
      retry: { attempts: 1, baseDelayMs: 0 },
      idempotencyKey: keyFactory,
    }).save({ test: true });

    expect(keyFactory).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledTimes(2);
    for (const [, init] of mockFetch.mock.calls) {
      expect(init.headers).toEqual(
        expect.objectContaining({
          'Idempotency-Key': 'consent-operation-123',
        }),
      );
    }
  });

  it('does not inspect or log response bodies by default', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const clone = jest.fn();
    mockFetch.mockResolvedValueOnce({ ok: false, status: 400, clone });
    await expect(
      apiAdapter('/api/consent').save({ personal: 'data' }),
    ).rejects.toBeInstanceOf(ApiAdapterError);
    expect(clone).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockRestore();
  });

  it('declares server-acknowledged, application-defined capabilities', () => {
    expect(apiAdapter('/api/consent').capabilities).toEqual(
      expect.objectContaining({
        durability: 'server-acknowledged',
        evidenceSuitability: 'application-defined',
        serverReadable: true,
      }),
    );
  });
});
