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
});
