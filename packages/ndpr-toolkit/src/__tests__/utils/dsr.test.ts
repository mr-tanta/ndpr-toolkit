import {
  formatDSRRequestStructured,
  validateDsrSubmissionStructured,
} from '../../utils/dsr';
import { DSRRequest, DSRType, DSRStatus } from '../../types/dsr';

// ── validateDsrSubmissionStructured (4.1.0 — structured-result family) ──────

describe('validateDsrSubmissionStructured', () => {
  function validPayload() {
    return {
      requestType: 'access',
      dataSubject: {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+2348012345678',
        identifierType: 'email',
        identifierValue: 'jane@example.com',
      },
      additionalInfo: { notes: 'Please respond by post.' },
      submittedAt: 1_700_000_000_000,
    };
  }

  it('returns { valid: true, errors: [], data } for a well-formed payload', () => {
    const r = validateDsrSubmissionStructured(validPayload());
    expect(r.valid).toBe(true);
    expect(r.errors).toEqual([]);
    expect(r.data?.requestType).toBe('access');
    expect(r.data?.dataSubject.email).toBe('jane@example.com');
  });

  it('returns a single { field, code, message } entry for an invalid email', () => {
    const p = validPayload();
    p.dataSubject.email = 'not-an-email';
    const r = validateDsrSubmissionStructured(p);
    expect(r.valid).toBe(false);
    expect(r.data).toBeUndefined();
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0]).toEqual({
      field: 'dataSubject.email',
      code: 'email_invalid_format',
      message: 'Email address format is invalid',
    });
  });

  it('returns multiple entries when multiple fields fail', () => {
    const r = validateDsrSubmissionStructured({
      requestType: '',
      dataSubject: { fullName: '', email: '', identifierType: '', identifierValue: '' },
      submittedAt: 'now',
    });
    expect(r.valid).toBe(false);
    expect(r.data).toBeUndefined();
    const codes = r.errors.map((e) => e.code);
    expect(codes).toEqual(
      expect.arrayContaining([
        'request_type_required',
        'full_name_required',
        'email_required',
        'identifier_type_required',
        'identifier_value_required',
        'submitted_at_invalid',
      ]),
    );
    expect(r.errors.length).toBeGreaterThanOrEqual(6);
  });

  it('emits payload_not_object for non-object payloads', () => {
    const r = validateDsrSubmissionStructured(null);
    expect(r.valid).toBe(false);
    expect(r.errors).toEqual([
      { field: '_root', code: 'payload_not_object', message: 'Payload must be an object' },
    ]);
  });

  it('emits request_type_not_allowed when the type is outside the allow-list', () => {
    const r = validateDsrSubmissionStructured(
      { ...validPayload(), requestType: 'invalid' },
      { allowedRequestTypes: ['access', 'erasure'] },
    );
    expect(r.valid).toBe(false);
    expect(r.errors[0].code).toBe('request_type_not_allowed');
  });
});

// ── formatDSRRequestStructured (4.1.0) ──────────────────────────────────────

describe('formatDSRRequestStructured', () => {
  it('returns { valid: true, errors: [], data } and a formattedRequest for a complete request', () => {
    const request: DSRRequest = {
      id: '500',
      type: 'access',
      status: 'pending',
      createdAt: 1620000000000,
      updatedAt: 1620000000000,
      subject: {
        name: 'John Doe',
        email: 'john@example.com',
      },
    };
    const result = formatDSRRequestStructured(request);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.data).toBe(request);
    expect(result.formattedRequest.requestId).toBe('500');
  });

  it('returns a single { field, code, message } entry when only the subject name is missing', () => {
    const request = {
      id: '501',
      type: 'access',
      status: 'pending',
      createdAt: 1620000000000,
      updatedAt: 1620000000000,
      subject: { name: '', email: 'jane@example.com' },
    } as DSRRequest;

    const result = formatDSRRequestStructured(request);
    expect(result.valid).toBe(false);
    expect(result.data).toBeUndefined();
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toEqual({
      field: 'subject.name',
      code: 'subject_name_required',
      message: 'Data subject name is required',
    });
    // formattedRequest is still populated for display.
    expect(result.formattedRequest.requestId).toBe('501');
  });

  it('returns multiple entries when multiple fields are missing', () => {
    const request = {
      id: '',
      type: undefined,
      status: undefined,
      createdAt: 0,
      subject: undefined,
    } as unknown as DSRRequest;

    const result = formatDSRRequestStructured(request);
    expect(result.valid).toBe(false);
    const codes = result.errors.map((e) => e.code);
    expect(codes).toEqual(
      expect.arrayContaining([
        'request_id_required',
        'request_type_required',
        'request_status_required',
        'created_at_required',
        'subject_name_required',
        'subject_email_required',
      ]),
    );
    expect(result.errors).toHaveLength(6);
  });
});
