import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NDPRSubjectRights } from '../../presets';

const TEST_URL = '/api/dsr';

// jsdom doesn't provide a global Response. Mint a minimal stand-in that
// satisfies what NDPRSubjectRights actually reads: `.ok`, `.status`, and
// `.clone().text()`. Returning the same object from `clone()` is fine
// because the production code calls `.text()` once.
function mockResponse(body: string | null, status = 200): Response {
  const ok = status >= 200 && status < 300;
  const r = {
    ok,
    status,
    text: () => Promise.resolve(body ?? ''),
    clone() { return r; },
  };
  return r as unknown as Response;
}

function fillAndSubmit() {
  fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Ada Lovelace' } });
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'ada@example.com' } });
  fireEvent.change(screen.getByLabelText(/request type/i), { target: { value: 'access' } });
  fireEvent.change(screen.getByLabelText(/identifier value/i), { target: { value: 'NIN-123' } });
  fireEvent.click(screen.getByRole('button', { name: /submit request/i }));
}

describe('NDPRSubjectRights submit callbacks', () => {
  const originalFetch = global.fetch;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('fires onSubmitSuccess with response + parsed JSON body on 2xx', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse(JSON.stringify({ referenceId: 'DSR-001' }), 200));
    const onSubmitSuccess = jest.fn();
    const onSubmitError = jest.fn();

    render(<NDPRSubjectRights submitTo={TEST_URL} onSubmitSuccess={onSubmitSuccess} onSubmitError={onSubmitError} />);
    fillAndSubmit();

    await waitFor(() => expect(onSubmitSuccess).toHaveBeenCalledTimes(1));
    const ctx = onSubmitSuccess.mock.calls[0][0];
    expect(ctx.response.ok).toBe(true);
    expect(ctx.body).toEqual({ referenceId: 'DSR-001' });
    expect(ctx.data.dataSubject.fullName).toBe('Ada Lovelace');
    expect(ctx.data.dataSubject.email).toBe('ada@example.com');
    expect(ctx.data.requestType).toBeDefined();
    expect(typeof ctx.data.submittedAt).toBe('number');
    expect(onSubmitError).not.toHaveBeenCalled();
  });

  it('fires onSubmitSuccess with body=undefined when response has no JSON', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse(null, 204));
    const onSubmitSuccess = jest.fn();

    render(<NDPRSubjectRights submitTo={TEST_URL} onSubmitSuccess={onSubmitSuccess} />);
    fillAndSubmit();

    await waitFor(() => expect(onSubmitSuccess).toHaveBeenCalledTimes(1));
    expect(onSubmitSuccess.mock.calls[0][0].body).toBeUndefined();
  });

  it('does NOT fire onSubmitSuccess on non-2xx — fires onSubmitError instead', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse('Server error', 500));
    const onSubmitSuccess = jest.fn();
    const onSubmitError = jest.fn();

    render(<NDPRSubjectRights submitTo={TEST_URL} onSubmitSuccess={onSubmitSuccess} onSubmitError={onSubmitError} />);
    fillAndSubmit();

    await waitFor(() => expect(onSubmitError).toHaveBeenCalledTimes(1));
    expect(onSubmitSuccess).not.toHaveBeenCalled();
    expect(onSubmitError.mock.calls[0][0].response?.status).toBe(500);
  });

  it('does NOT fire onSubmitSuccess on network error — fires onSubmitError', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network down'));
    const onSubmitSuccess = jest.fn();
    const onSubmitError = jest.fn();

    render(<NDPRSubjectRights submitTo={TEST_URL} onSubmitSuccess={onSubmitSuccess} onSubmitError={onSubmitError} />);
    fillAndSubmit();

    await waitFor(() => expect(onSubmitError).toHaveBeenCalledTimes(1));
    expect(onSubmitSuccess).not.toHaveBeenCalled();
    expect(onSubmitError.mock.calls[0][0].error).toBeInstanceOf(Error);
  });
});
