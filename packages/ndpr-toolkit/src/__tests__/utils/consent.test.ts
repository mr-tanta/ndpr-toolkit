import {
  validateConsent,
  validateConsentStructured,
  validateConsentOptionsStructured,
} from '../../utils/consent';
import { ConsentSettings, ConsentOption } from '../../types/consent';

describe('validateConsent (NDPA Section 26)', () => {
  it('should validate valid consent settings per NDPA requirements', () => {
    const settings: ConsentSettings = {
      consents: {
        necessary: true,
        analytics: false,
        marketing: true
      },
      timestamp: Date.now(),
      version: '1.0',
      method: 'banner',
      hasInteracted: true
    };

    const result = validateConsent(settings);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should invalidate settings with missing consents per NDPA requirements', () => {
    const settings: ConsentSettings = {
      consents: {},
      timestamp: Date.now(),
      version: '1.0',
      method: 'banner',
      hasInteracted: true
    };

    const result = validateConsent(settings);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Consent settings must include at least one consent option');
  });

  it('should invalidate settings with missing timestamp', () => {
    const settings = {
      consents: { necessary: true },
      version: '1.0',
      method: 'banner',
      hasInteracted: true
    } as unknown as ConsentSettings;

    const result = validateConsent(settings);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Consent timestamp is required');
  });

  it('should invalidate settings with missing version', () => {
    const settings = {
      consents: { necessary: true },
      timestamp: Date.now(),
      method: 'banner',
      hasInteracted: true
    } as unknown as ConsentSettings;

    const result = validateConsent(settings);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Consent version is required');
  });

  it('should invalidate settings with missing method', () => {
    const settings = {
      consents: { necessary: true },
      timestamp: Date.now(),
      version: '1.0',
      hasInteracted: true
    } as unknown as ConsentSettings;

    const result = validateConsent(settings);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Consent collection method is required');
  });

  it('should invalidate settings with missing hasInteracted', () => {
    const settings = {
      consents: { necessary: true },
      timestamp: Date.now(),
      version: '1.0',
      method: 'banner'
    } as unknown as ConsentSettings;

    const result = validateConsent(settings);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('User interaction status is required');
  });

  it('should pass for consent that is 394 days old (within 13 calendar months)', () => {
    // 394 days ago is within 13 calendar months (~395–396 days depending on
    // which months are in play). The old 390-day approximation
    // (13 * 30 * 24 * 60 * 60 * 1000) would wrongly reject this — calendar
    // months count for variable lengths and Feb pulls the window forward.
    // Slack of 1–2 days protects against sub-ms timing variance between the
    // test's `Date.now()` and the impl's `new Date()`, especially under
    // coverage instrumentation.
    const now = Date.now();
    const daysOld = 394;
    const timestamp = now - daysOld * 24 * 60 * 60 * 1000;

    const settings: ConsentSettings = {
      consents: { analytics: true },
      timestamp,
      version: '1.0',
      method: 'banner',
      hasInteracted: true,
    };

    const result = validateConsent(settings);
    expect(result.errors).not.toContain('Consent is older than 13 months and should be refreshed');
    expect(result.valid).toBe(true);
  });

  it('should produce a "missing timestamp" error for timestamp 0, not a staleness error', () => {
    const settings: ConsentSettings = {
      consents: { necessary: true },
      timestamp: 0,
      version: '1.0',
      method: 'banner',
      hasInteracted: true,
    };

    const result = validateConsent(settings);
    expect(result.valid).toBe(false);
    // timestamp 0 is falsy, so the "timestamp is required" branch fires
    expect(result.errors).toContain('Consent timestamp is required');
    // The staleness check should NOT also fire (would be a duplicate/confusing error)
    expect(result.errors).not.toContain('Consent is older than 13 months and should be refreshed');
  });
});

// ── validateConsentStructured (4.1.0 — structured-result family) ────────────

describe('validateConsentStructured', () => {
  it('returns { valid: true, errors: [], data } for a well-formed settings object', () => {
    const settings: ConsentSettings = {
      consents: { necessary: true, analytics: false },
      timestamp: Date.now(),
      version: '1.0',
      method: 'banner',
      hasInteracted: true,
    };

    const result = validateConsentStructured(settings);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.data).toBe(settings);
  });

  it('returns a single { field, code, message } entry for a single-field error', () => {
    const settings = {
      consents: { necessary: true },
      timestamp: Date.now(),
      version: '1.0',
      method: 'banner',
      // hasInteracted intentionally missing
    } as unknown as ConsentSettings;

    const result = validateConsentStructured(settings);
    expect(result.valid).toBe(false);
    expect(result.data).toBeUndefined();
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toEqual({
      field: 'hasInteracted',
      code: 'has_interacted_required',
      message: 'User interaction status is required',
    });
  });

  it('returns multiple entries when multiple fields fail', () => {
    const settings = {
      consents: {},
      // timestamp, version, method, hasInteracted all missing
    } as unknown as ConsentSettings;

    const result = validateConsentStructured(settings);
    expect(result.valid).toBe(false);
    expect(result.data).toBeUndefined();
    const codes = result.errors.map((e) => e.code);
    expect(codes).toEqual(
      expect.arrayContaining([
        'consents_required',
        'timestamp_required',
        'version_required',
        'method_required',
        'has_interacted_required',
      ]),
    );
    expect(result.errors.length).toBeGreaterThanOrEqual(5);
  });
});

// ── validateConsentOptionsStructured (4.1.0) ────────────────────────────────

describe('validateConsentOptionsStructured', () => {
  it('returns { valid: true, errors: [], data } when every option has a purpose', () => {
    const options: ConsentOption[] = [
      { id: 'analytics', label: 'Analytics', description: 'd', required: false, purpose: 'Analytics' },
      { id: 'marketing', label: 'Marketing', description: 'd', required: false, purpose: 'Email marketing' },
    ];
    const result = validateConsentOptionsStructured(options);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.data).toBe(options);
  });

  it('returns a single error keyed by index when one option is missing a purpose', () => {
    const options: ConsentOption[] = [
      { id: 'analytics', label: 'Analytics', description: 'd', required: false, purpose: 'Analytics' },
      { id: 'marketing', label: 'Marketing', description: 'd', required: false, purpose: '' },
    ];
    const result = validateConsentOptionsStructured(options);
    expect(result.valid).toBe(false);
    expect(result.data).toBeUndefined();
    expect(result.errors).toEqual([
      {
        field: 'options[1].purpose',
        code: 'purpose_required',
        message: expect.stringContaining('marketing'),
      },
    ]);
  });

  it('returns options_required + per-option entries when called with multiple problems', () => {
    const empty = validateConsentOptionsStructured([]);
    expect(empty.valid).toBe(false);
    expect(empty.errors).toEqual([
      { field: 'options', code: 'options_required', message: expect.any(String) },
    ]);

    const options: ConsentOption[] = [
      { id: 'a', label: 'A', description: 'd', required: false, purpose: '' },
      { id: 'b', label: 'B', description: 'd', required: false, purpose: '   ' },
    ];
    const result = validateConsentOptionsStructured(options);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(2);
    expect(result.errors.map((e) => e.field)).toEqual([
      'options[0].purpose',
      'options[1].purpose',
    ]);
    expect(result.errors.every((e) => e.code === 'purpose_required')).toBe(true);
  });
});
