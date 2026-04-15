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

  describe('save() response handling', () => {
    let warnSpy: jest.SpyInstance;

    beforeEach(() => {
      warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    it('logs warning on 400 response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 400 });
      const adapter = apiAdapter('/api/consent');
      await adapter.save({ test: true });
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to save to /api/consent: 400')
      );
    });

    it('logs warning on 500 response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
      const adapter = apiAdapter('/api/consent');
      await adapter.save({ test: true });
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to save to /api/consent: 500')
      );
    });

    it('does not log warning on 200 response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200 });
      const adapter = apiAdapter('/api/consent');
      await adapter.save({ test: true });
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('logs warning on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      const adapter = apiAdapter('/api/consent');
      await adapter.save({ test: true });
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to save to /api/consent')
      );
    });
  });

  describe('remove() response handling', () => {
    let warnSpy: jest.SpyInstance;

    beforeEach(() => {
      warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    it('logs warning on 403 response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 403 });
      const adapter = apiAdapter('/api/consent');
      await adapter.remove();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to delete from /api/consent: 403')
      );
    });

    it('does not log warning on 204 response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 204 });
      const adapter = apiAdapter('/api/consent');
      await adapter.remove();
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });

  describe('load() response handling', () => {
    it('returns null on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 502 });
      const adapter = apiAdapter('/api/consent');
      const result = await adapter.load();
      expect(result).toBeNull();
    });
  });
});
