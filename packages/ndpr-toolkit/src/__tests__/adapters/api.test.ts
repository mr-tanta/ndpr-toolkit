import { apiAdapter } from '../../adapters/api';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('apiAdapter', () => {
  beforeEach(() => { mockFetch.mockClear(); });

  it('loads data via GET', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ consents: { analytics: true } }) });
    const adapter = apiAdapter<{ consents: Record<string, boolean> }>('/api/consent');
    const result = await adapter.load();
    expect(mockFetch).toHaveBeenCalledWith('/api/consent', expect.objectContaining({ method: 'GET' }));
    expect(result).toEqual({ consents: { analytics: true } });
  });

  it('returns null on GET failure', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });
    const adapter = apiAdapter('/api/consent');
    const result = await adapter.load();
    expect(result).toBeNull();
  });

  it('saves data via POST', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    const adapter = apiAdapter('/api/consent');
    const data = { consents: { analytics: true } };
    await adapter.save(data);
    expect(mockFetch).toHaveBeenCalledWith('/api/consent', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }));
  });

  it('removes data via DELETE', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    const adapter = apiAdapter('/api/consent');
    await adapter.remove();
    expect(mockFetch).toHaveBeenCalledWith('/api/consent', expect.objectContaining({ method: 'DELETE' }));
  });

  it('accepts custom headers', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => null });
    const adapter = apiAdapter('/api/consent', { headers: { Authorization: 'Bearer token123' } });
    await adapter.load();
    expect(mockFetch).toHaveBeenCalledWith('/api/consent', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer token123' }),
    }));
  });
});
