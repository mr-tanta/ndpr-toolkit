import {
  validateConsentStructured,
  validateConsentOptionsStructured,
} from '../../utils/consent';
import { ConsentSettings, ConsentOption } from '../../types/consent';

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

  it('emits timestamp_invalid for a truthy-but-non-number timestamp', () => {
    const settings = {
      consents: { necessary: true },
      timestamp: 'not-a-number',
      version: '1.0',
      method: 'banner',
      hasInteracted: true,
    } as unknown as ConsentSettings;

    const result = validateConsentStructured(settings);
    expect(result.valid).toBe(false);
    const invalid = result.errors.find((e) => e.code === 'timestamp_invalid');
    expect(invalid).toBeDefined();
    expect(invalid?.field).toBe('timestamp');
    expect(result.errors.some((e) => e.code === 'timestamp_required')).toBe(false);
  });

  it('emits consent_stale when the timestamp is older than 13 months (NDPA refresh)', () => {
    const fourteenMonthsAgo = new Date();
    fourteenMonthsAgo.setMonth(fourteenMonthsAgo.getMonth() - 14);
    const settings: ConsentSettings = {
      consents: { necessary: true },
      timestamp: fourteenMonthsAgo.getTime(),
      version: '1.0',
      method: 'banner',
      hasInteracted: true,
    };

    const result = validateConsentStructured(settings);
    expect(result.valid).toBe(false);
    expect(result.errors.map((e) => e.code)).toContain('consent_stale');
    expect(result.data).toBeUndefined();
  });

  it('does not emit consent_stale for consent given within the last 13 months', () => {
    const tenMonthsAgo = new Date();
    tenMonthsAgo.setMonth(tenMonthsAgo.getMonth() - 10);
    const settings: ConsentSettings = {
      consents: { necessary: true },
      timestamp: tenMonthsAgo.getTime(),
      version: '1.0',
      method: 'banner',
      hasInteracted: true,
    };

    const result = validateConsentStructured(settings);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  describe('13-month staleness cutoff around month-end rollover', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('does not roll the cutoff forward when "now" is the 31st (Feb boundary)', () => {
      // 31 Mar 2026 minus 13 months must clamp to 28 Feb 2025, not roll
      // through "31 Feb" into early March.
      jest.spyOn(Date, 'now').mockReturnValue(new Date(2026, 2, 31, 12).getTime());

      const justUnderThirteenMonths: ConsentSettings = {
        consents: { necessary: true },
        timestamp: new Date(2025, 2, 2, 12).getTime(),
        version: '1.0',
        method: 'banner',
        hasInteracted: true,
      };
      expect(validateConsentStructured(justUnderThirteenMonths).valid).toBe(true);

      const justOverThirteenMonths: ConsentSettings = {
        ...justUnderThirteenMonths,
        timestamp: new Date(2025, 1, 27, 12).getTime(),
      };
      const result = validateConsentStructured(justOverThirteenMonths);
      expect(result.valid).toBe(false);
      expect(result.errors.map((e) => e.code)).toContain('consent_stale');
    });

    it('clamps to the last day of a 30-day target month', () => {
      // 31 May 2026 minus 13 months must clamp to 30 Apr 2025, not 1 May.
      jest.spyOn(Date, 'now').mockReturnValue(new Date(2026, 4, 31, 12).getTime());

      const justUnderThirteenMonths: ConsentSettings = {
        consents: { necessary: true },
        timestamp: new Date(2025, 3, 30, 18).getTime(),
        version: '1.0',
        method: 'banner',
        hasInteracted: true,
      };
      expect(validateConsentStructured(justUnderThirteenMonths).valid).toBe(true);

      const justOverThirteenMonths: ConsentSettings = {
        ...justUnderThirteenMonths,
        timestamp: new Date(2025, 3, 29, 12).getTime(),
      };
      const result = validateConsentStructured(justOverThirteenMonths);
      expect(result.valid).toBe(false);
      expect(result.errors.map((e) => e.code)).toContain('consent_stale');
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
