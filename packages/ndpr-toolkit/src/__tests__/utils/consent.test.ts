import { validateConsent } from '../../utils/consent';
import { ConsentSettings } from '../../types/consent';

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
