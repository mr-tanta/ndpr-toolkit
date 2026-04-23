import {
  COUNTRY_ADEQUACY_MAP,
  getCountryAdequacy,
  getAdequateCountries,
  requiresNDPCApproval,
} from '../../utils/country-adequacy';

describe('country-adequacy', () => {
  // ---- getCountryAdequacy ----

  describe('getCountryAdequacy', () => {
    it('returns an adequate entry for "United Kingdom"', () => {
      const result = getCountryAdequacy('United Kingdom');
      expect(result).toBeDefined();
      expect(result!.isoCode).toBe('GB');
      expect(result!.adequacyStatus).toBe('adequate');
      expect(result!.country).toBe('United Kingdom');
    });

    it('looks up by ISO code "GB"', () => {
      const result = getCountryAdequacy('GB');
      expect(result).toBeDefined();
      expect(result!.country).toBe('United Kingdom');
      expect(result!.adequacyStatus).toBe('adequate');
    });

    it('is case-insensitive for country names', () => {
      const result = getCountryAdequacy('united kingdom');
      expect(result).toBeDefined();
      expect(result!.isoCode).toBe('GB');
    });

    it('is case-insensitive for ISO codes', () => {
      const result = getCountryAdequacy('gb');
      expect(result).toBeDefined();
      expect(result!.country).toBe('United Kingdom');
    });

    it('returns undefined for an unknown country', () => {
      expect(getCountryAdequacy('Narnia')).toBeUndefined();
    });

    it('returns partially_adequate for "United States"', () => {
      const result = getCountryAdequacy('United States');
      expect(result).toBeDefined();
      expect(result!.adequacyStatus).toBe('partially_adequate');
      expect(result!.isoCode).toBe('US');
    });

    it('returns not_adequate for countries like China and Russia', () => {
      expect(getCountryAdequacy('China')!.adequacyStatus).toBe('not_adequate');
      expect(getCountryAdequacy('Russia')!.adequacyStatus).toBe('not_adequate');
    });

    it('handles whitespace in input', () => {
      const result = getCountryAdequacy('  GB  ');
      expect(result).toBeDefined();
      expect(result!.country).toBe('United Kingdom');
    });
  });

  // ---- getAdequateCountries ----

  describe('getAdequateCountries', () => {
    it('returns an array of only adequate countries', () => {
      const adequate = getAdequateCountries();
      expect(Array.isArray(adequate)).toBe(true);
      expect(adequate.length).toBeGreaterThan(0);
      for (const entry of adequate) {
        expect(entry.adequacyStatus).toBe('adequate');
      }
    });

    it('includes EU countries, UK, Canada, and other adequate nations', () => {
      const adequate = getAdequateCountries();
      const countryCodes = adequate.map((e) => e.isoCode);

      // EU members
      expect(countryCodes).toContain('DE'); // Germany
      expect(countryCodes).toContain('FR'); // France
      expect(countryCodes).toContain('IT'); // Italy
      expect(countryCodes).toContain('ES'); // Spain
      expect(countryCodes).toContain('NL'); // Netherlands
      expect(countryCodes).toContain('IE'); // Ireland

      // Non-EU adequate
      expect(countryCodes).toContain('GB'); // United Kingdom
      expect(countryCodes).toContain('CA'); // Canada
      expect(countryCodes).toContain('JP'); // Japan
      expect(countryCodes).toContain('NZ'); // New Zealand
      expect(countryCodes).toContain('CH'); // Switzerland
      expect(countryCodes).toContain('AR'); // Argentina
      expect(countryCodes).toContain('IL'); // Israel
    });

    it('does NOT include the US (partially adequate)', () => {
      const adequate = getAdequateCountries();
      const countryCodes = adequate.map((e) => e.isoCode);
      expect(countryCodes).not.toContain('US');
    });

    it('does NOT include not_adequate countries', () => {
      const adequate = getAdequateCountries();
      const countryCodes = adequate.map((e) => e.isoCode);
      expect(countryCodes).not.toContain('CN'); // China
      expect(countryCodes).not.toContain('RU'); // Russia
      expect(countryCodes).not.toContain('TZ'); // Tanzania
    });
  });

  // ---- requiresNDPCApproval ----

  describe('requiresNDPCApproval', () => {
    it('returns false for adequate countries (no approval needed)', () => {
      // Nigeria -> not in the map, but let's test known adequate ones
      expect(requiresNDPCApproval('United Kingdom')).toBe(false);
      expect(requiresNDPCApproval('Germany')).toBe(false);
      expect(requiresNDPCApproval('Canada')).toBe(false);
      expect(requiresNDPCApproval('JP')).toBe(false);
    });

    it('returns true for partially adequate countries', () => {
      expect(requiresNDPCApproval('United States')).toBe(true);
      expect(requiresNDPCApproval('Ghana')).toBe(true);
      expect(requiresNDPCApproval('India')).toBe(true);
      expect(requiresNDPCApproval('Brazil')).toBe(true);
    });

    it('returns true for not_adequate countries', () => {
      expect(requiresNDPCApproval('China')).toBe(true);
      expect(requiresNDPCApproval('Russia')).toBe(true);
      expect(requiresNDPCApproval('Tanzania')).toBe(true);
    });

    it('returns true for unknown countries', () => {
      expect(requiresNDPCApproval('Unknown Country')).toBe(true);
      expect(requiresNDPCApproval('Narnia')).toBe(true);
    });

    it('works with ISO codes', () => {
      expect(requiresNDPCApproval('GB')).toBe(false);
      expect(requiresNDPCApproval('US')).toBe(true);
    });
  });

  // ---- COUNTRY_ADEQUACY_MAP ----

  describe('COUNTRY_ADEQUACY_MAP', () => {
    it('has entries for key countries (spot check)', () => {
      const expectedCodes = [
        'GB', 'US', 'CA', 'DE', 'FR', 'IT', 'ES', 'NL',
        'JP', 'KR', 'SG', 'AU', 'NZ', 'ZA', 'BR', 'CH',
      ];
      for (const code of expectedCodes) {
        expect(COUNTRY_ADEQUACY_MAP[code]).toBeDefined();
        expect(COUNTRY_ADEQUACY_MAP[code].isoCode).toBe(code);
        expect(COUNTRY_ADEQUACY_MAP[code].country).toBeTruthy();
        expect(COUNTRY_ADEQUACY_MAP[code].adequacyStatus).toBeTruthy();
        expect(COUNTRY_ADEQUACY_MAP[code].lastUpdated).toBeTruthy();
      }
    });

    it('each entry has the required shape', () => {
      for (const [code, entry] of Object.entries(COUNTRY_ADEQUACY_MAP)) {
        expect(entry.isoCode).toBe(code);
        expect(typeof entry.country).toBe('string');
        expect(['adequate', 'partially_adequate', 'not_adequate', 'pending']).toContain(
          entry.adequacyStatus
        );
        expect(typeof entry.recognizedBy).toBe('string');
        expect(typeof entry.notes).toBe('string');
        expect(typeof entry.lastUpdated).toBe('string');
      }
    });
  });
});
