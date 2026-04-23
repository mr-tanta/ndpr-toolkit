/**
 * Country adequacy determinations for cross-border data transfers
 * under the Nigeria Data Protection Act (NDPA).
 *
 * This module provides a reference database of adequacy statuses for countries
 * that Nigerian businesses commonly transfer personal data to, along with
 * helper functions for querying adequacy and determining whether NDPC approval
 * is required for a given destination.
 */

/**
 * Adequacy status of a country for cross-border data transfers.
 */
export type CountryAdequacyStatus =
  | 'adequate'
  | 'partially_adequate'
  | 'not_adequate'
  | 'pending';

/**
 * Represents a country's adequacy determination for cross-border data transfers.
 */
export interface CountryAdequacy {
  /** Full country name */
  country: string;
  /** ISO 3166-1 alpha-2 country code */
  isoCode: string;
  /** Adequacy status for data protection purposes */
  adequacyStatus: CountryAdequacyStatus;
  /** Authority or framework that recognized the adequacy (e.g. 'NDPC', 'EU') */
  recognizedBy: string;
  /** Additional notes about the adequacy determination */
  notes: string;
  /** Date the adequacy determination was last reviewed */
  lastUpdated: string;
}

/**
 * Database of country adequacy determinations for cross-border data transfers.
 *
 * This map is keyed by ISO 3166-1 alpha-2 country code (uppercase).
 * Statuses reflect general assessments based on each country's data protection
 * framework and are provided for guidance purposes. Organizations should verify
 * current NDPC guidance before relying on these determinations.
 */
export const COUNTRY_ADEQUACY_MAP: Record<string, CountryAdequacy> = {
  // --- EU/EEA Member States (adequate due to GDPR) ---
  AT: {
    country: 'Austria',
    isoCode: 'AT',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes: 'EU member state; protected by GDPR.',
    lastUpdated: '2024-01-01',
  },
  BE: {
    country: 'Belgium',
    isoCode: 'BE',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes: 'EU member state; protected by GDPR.',
    lastUpdated: '2024-01-01',
  },
  BG: {
    country: 'Bulgaria',
    isoCode: 'BG',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes: 'EU member state; protected by GDPR.',
    lastUpdated: '2024-01-01',
  },
  HR: {
    country: 'Croatia',
    isoCode: 'HR',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes: 'EU member state; protected by GDPR.',
    lastUpdated: '2024-01-01',
  },
  CY: {
    country: 'Cyprus',
    isoCode: 'CY',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes: 'EU member state; protected by GDPR.',
    lastUpdated: '2024-01-01',
  },
  CZ: {
    country: 'Czech Republic',
    isoCode: 'CZ',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes: 'EU member state; protected by GDPR.',
    lastUpdated: '2024-01-01',
  },
  DK: {
    country: 'Denmark',
    isoCode: 'DK',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes: 'EU member state; protected by GDPR.',
    lastUpdated: '2024-01-01',
  },
  EE: {
    country: 'Estonia',
    isoCode: 'EE',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes: 'EU member state; protected by GDPR.',
    lastUpdated: '2024-01-01',
  },
  FI: {
    country: 'Finland',
    isoCode: 'FI',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes: 'EU member state; protected by GDPR.',
    lastUpdated: '2024-01-01',
  },
  FR: {
    country: 'France',
    isoCode: 'FR',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes: 'EU member state; protected by GDPR.',
    lastUpdated: '2024-01-01',
  },
  DE: {
    country: 'Germany',
    isoCode: 'DE',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes: 'EU member state; protected by GDPR with additional national provisions (BDSG).',
    lastUpdated: '2024-01-01',
  },
  GR: {
    country: 'Greece',
    isoCode: 'GR',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes: 'EU member state; protected by GDPR.',
    lastUpdated: '2024-01-01',
  },
  HU: {
    country: 'Hungary',
    isoCode: 'HU',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes: 'EU member state; protected by GDPR.',
    lastUpdated: '2024-01-01',
  },
  IE: {
    country: 'Ireland',
    isoCode: 'IE',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes: 'EU member state; protected by GDPR. Hosts many multinational data processors.',
    lastUpdated: '2024-01-01',
  },
  IT: {
    country: 'Italy',
    isoCode: 'IT',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes: 'EU member state; protected by GDPR.',
    lastUpdated: '2024-01-01',
  },
  LV: {
    country: 'Latvia',
    isoCode: 'LV',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes: 'EU member state; protected by GDPR.',
    lastUpdated: '2024-01-01',
  },
  LT: {
    country: 'Lithuania',
    isoCode: 'LT',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes: 'EU member state; protected by GDPR.',
    lastUpdated: '2024-01-01',
  },
  LU: {
    country: 'Luxembourg',
    isoCode: 'LU',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes: 'EU member state; protected by GDPR.',
    lastUpdated: '2024-01-01',
  },
  MT: {
    country: 'Malta',
    isoCode: 'MT',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes: 'EU member state; protected by GDPR.',
    lastUpdated: '2024-01-01',
  },
  NL: {
    country: 'Netherlands',
    isoCode: 'NL',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes: 'EU member state; protected by GDPR.',
    lastUpdated: '2024-01-01',
  },
  PL: {
    country: 'Poland',
    isoCode: 'PL',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes: 'EU member state; protected by GDPR.',
    lastUpdated: '2024-01-01',
  },
  PT: {
    country: 'Portugal',
    isoCode: 'PT',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes: 'EU member state; protected by GDPR.',
    lastUpdated: '2024-01-01',
  },
  RO: {
    country: 'Romania',
    isoCode: 'RO',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes: 'EU member state; protected by GDPR.',
    lastUpdated: '2024-01-01',
  },
  SK: {
    country: 'Slovakia',
    isoCode: 'SK',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes: 'EU member state; protected by GDPR.',
    lastUpdated: '2024-01-01',
  },
  SI: {
    country: 'Slovenia',
    isoCode: 'SI',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes: 'EU member state; protected by GDPR.',
    lastUpdated: '2024-01-01',
  },
  ES: {
    country: 'Spain',
    isoCode: 'ES',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes: 'EU member state; protected by GDPR.',
    lastUpdated: '2024-01-01',
  },
  SE: {
    country: 'Sweden',
    isoCode: 'SE',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes: 'EU member state; protected by GDPR.',
    lastUpdated: '2024-01-01',
  },
  // EEA (non-EU)
  IS: {
    country: 'Iceland',
    isoCode: 'IS',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes: 'EEA member; GDPR applies through EEA Agreement.',
    lastUpdated: '2024-01-01',
  },
  LI: {
    country: 'Liechtenstein',
    isoCode: 'LI',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes: 'EEA member; GDPR applies through EEA Agreement.',
    lastUpdated: '2024-01-01',
  },
  NO: {
    country: 'Norway',
    isoCode: 'NO',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes: 'EEA member; GDPR applies through EEA Agreement.',
    lastUpdated: '2024-01-01',
  },

  // --- United Kingdom ---
  GB: {
    country: 'United Kingdom',
    isoCode: 'GB',
    adequacyStatus: 'adequate',
    recognizedBy: 'NDPC',
    notes: 'Protected by UK GDPR and the Data Protection Act 2018. EU adequacy decision granted post-Brexit.',
    lastUpdated: '2024-01-01',
  },

  // --- North America ---
  US: {
    country: 'United States',
    isoCode: 'US',
    adequacyStatus: 'partially_adequate',
    recognizedBy: 'NDPC',
    notes:
      'No comprehensive federal data protection law. Adequacy depends on transfer mechanism used (e.g. EU-US Data Privacy Framework, standard contractual clauses). Sector-specific laws exist (HIPAA, CCPA, etc.).',
    lastUpdated: '2024-01-01',
  },
  CA: {
    country: 'Canada',
    isoCode: 'CA',
    adequacyStatus: 'adequate',
    recognizedBy: 'NDPC',
    notes:
      'Protected by PIPEDA (Personal Information Protection and Electronic Documents Act) and provincial privacy laws. Recognized as adequate by the EU.',
    lastUpdated: '2024-01-01',
  },

  // --- Africa ---
  ZA: {
    country: 'South Africa',
    isoCode: 'ZA',
    adequacyStatus: 'adequate',
    recognizedBy: 'NDPC',
    notes:
      'Protected by POPIA (Protection of Personal Information Act, 2013). Comprehensive data protection framework with an independent Information Regulator.',
    lastUpdated: '2024-01-01',
  },
  GH: {
    country: 'Ghana',
    isoCode: 'GH',
    adequacyStatus: 'partially_adequate',
    recognizedBy: 'NDPC',
    notes:
      'Data Protection Act 2012 (Act 843) establishes a data protection framework. Enforcement capacity is still developing.',
    lastUpdated: '2024-01-01',
  },
  KE: {
    country: 'Kenya',
    isoCode: 'KE',
    adequacyStatus: 'partially_adequate',
    recognizedBy: 'NDPC',
    notes:
      'Data Protection Act 2019 provides a modern framework. The Office of the Data Protection Commissioner is operational but still maturing.',
    lastUpdated: '2024-01-01',
  },
  RW: {
    country: 'Rwanda',
    isoCode: 'RW',
    adequacyStatus: 'partially_adequate',
    recognizedBy: 'NDPC',
    notes:
      'Law No. 058/2021 on the Protection of Personal Data and Privacy. Framework is relatively new.',
    lastUpdated: '2024-01-01',
  },
  EG: {
    country: 'Egypt',
    isoCode: 'EG',
    adequacyStatus: 'partially_adequate',
    recognizedBy: 'NDPC',
    notes:
      'Personal Data Protection Law No. 151 of 2020. Implementation and enforcement are still in early stages.',
    lastUpdated: '2024-01-01',
  },
  TZ: {
    country: 'Tanzania',
    isoCode: 'TZ',
    adequacyStatus: 'not_adequate',
    recognizedBy: 'NDPC',
    notes: 'No comprehensive data protection legislation in force.',
    lastUpdated: '2024-01-01',
  },
  UG: {
    country: 'Uganda',
    isoCode: 'UG',
    adequacyStatus: 'partially_adequate',
    recognizedBy: 'NDPC',
    notes:
      'Data Protection and Privacy Act 2019 provides a framework, but enforcement capacity is limited.',
    lastUpdated: '2024-01-01',
  },
  SN: {
    country: 'Senegal',
    isoCode: 'SN',
    adequacyStatus: 'partially_adequate',
    recognizedBy: 'NDPC',
    notes:
      'Law No. 2008-12 on the Protection of Personal Data. One of the earlier African data protection laws.',
    lastUpdated: '2024-01-01',
  },
  MA: {
    country: 'Morocco',
    isoCode: 'MA',
    adequacyStatus: 'partially_adequate',
    recognizedBy: 'NDPC',
    notes:
      'Law No. 09-08 on the Protection of Individuals with Regard to the Processing of Personal Data (2009). Recognized as adequate by the EU.',
    lastUpdated: '2024-01-01',
  },
  MU: {
    country: 'Mauritius',
    isoCode: 'MU',
    adequacyStatus: 'adequate',
    recognizedBy: 'NDPC',
    notes:
      'Data Protection Act 2017 provides a comprehensive framework modelled on international standards.',
    lastUpdated: '2024-01-01',
  },

  // --- Asia ---
  CN: {
    country: 'China',
    isoCode: 'CN',
    adequacyStatus: 'not_adequate',
    recognizedBy: 'NDPC',
    notes:
      'Personal Information Protection Law (PIPL) enacted in 2021 but government access provisions and limited independent oversight raise concerns. Transfers require security assessments or standard contracts.',
    lastUpdated: '2024-01-01',
  },
  IN: {
    country: 'India',
    isoCode: 'IN',
    adequacyStatus: 'partially_adequate',
    recognizedBy: 'NDPC',
    notes:
      'Digital Personal Data Protection Act 2023 enacted. Implementation rules and enforcement mechanisms are still being finalized.',
    lastUpdated: '2024-01-01',
  },
  SG: {
    country: 'Singapore',
    isoCode: 'SG',
    adequacyStatus: 'adequate',
    recognizedBy: 'NDPC',
    notes:
      'Personal Data Protection Act 2012 (PDPA) provides a robust framework. Strong enforcement by the PDPC.',
    lastUpdated: '2024-01-01',
  },
  JP: {
    country: 'Japan',
    isoCode: 'JP',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes:
      'Act on the Protection of Personal Information (APPI). Recognized as adequate by the EU under mutual adequacy arrangement.',
    lastUpdated: '2024-01-01',
  },
  KR: {
    country: 'South Korea',
    isoCode: 'KR',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes:
      'Personal Information Protection Act (PIPA). Recognized as adequate by the EU.',
    lastUpdated: '2024-01-01',
  },

  // --- Middle East ---
  AE: {
    country: 'United Arab Emirates',
    isoCode: 'AE',
    adequacyStatus: 'partially_adequate',
    recognizedBy: 'NDPC',
    notes:
      'Federal Decree-Law No. 45 of 2021 on Personal Data Protection. DIFC and ADGM free zones have their own data protection regulations with stronger frameworks.',
    lastUpdated: '2024-01-01',
  },
  SA: {
    country: 'Saudi Arabia',
    isoCode: 'SA',
    adequacyStatus: 'partially_adequate',
    recognizedBy: 'NDPC',
    notes:
      'Personal Data Protection Law (Royal Decree M/19, 2021). Framework is new and enforcement is still developing.',
    lastUpdated: '2024-01-01',
  },
  IL: {
    country: 'Israel',
    isoCode: 'IL',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes:
      'Protection of Privacy Law 5741-1981 and regulations. Recognized as adequate by the EU.',
    lastUpdated: '2024-01-01',
  },

  // --- South America ---
  BR: {
    country: 'Brazil',
    isoCode: 'BR',
    adequacyStatus: 'partially_adequate',
    recognizedBy: 'NDPC',
    notes:
      'Lei Geral de Protecao de Dados (LGPD, 2020) provides a comprehensive framework. The ANPD is actively enforcing.',
    lastUpdated: '2024-01-01',
  },
  AR: {
    country: 'Argentina',
    isoCode: 'AR',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes:
      'Personal Data Protection Act No. 25,326. Recognized as adequate by the EU.',
    lastUpdated: '2024-01-01',
  },

  // --- Oceania ---
  AU: {
    country: 'Australia',
    isoCode: 'AU',
    adequacyStatus: 'partially_adequate',
    recognizedBy: 'NDPC',
    notes:
      'Privacy Act 1988 provides protection but does not fully align with GDPR-level standards. Reform efforts are ongoing.',
    lastUpdated: '2024-01-01',
  },
  NZ: {
    country: 'New Zealand',
    isoCode: 'NZ',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes:
      'Privacy Act 2020 provides a comprehensive framework. Recognized as adequate by the EU.',
    lastUpdated: '2024-01-01',
  },

  // --- Other ---
  CH: {
    country: 'Switzerland',
    isoCode: 'CH',
    adequacyStatus: 'adequate',
    recognizedBy: 'EU',
    notes:
      'Federal Act on Data Protection (FADP, revised 2023). Recognized as adequate by the EU.',
    lastUpdated: '2024-01-01',
  },
  RU: {
    country: 'Russia',
    isoCode: 'RU',
    adequacyStatus: 'not_adequate',
    recognizedBy: 'NDPC',
    notes:
      'Federal Law on Personal Data (No. 152-FZ). Data localization requirements and government access concerns.',
    lastUpdated: '2024-01-01',
  },
};

/**
 * Look up the adequacy determination for a country by name or ISO code.
 *
 * The search is case-insensitive and matches against both the `country` field
 * and the `isoCode` field.
 *
 * @param countryOrCode A country name (e.g. "Germany") or ISO 3166-1 alpha-2 code (e.g. "DE")
 * @returns The matching CountryAdequacy entry, or undefined if not found
 */
export function getCountryAdequacy(countryOrCode: string): CountryAdequacy | undefined {
  const normalized = countryOrCode.trim().toUpperCase();

  // Try direct ISO code lookup first
  if (COUNTRY_ADEQUACY_MAP[normalized]) {
    return COUNTRY_ADEQUACY_MAP[normalized];
  }

  // Fall back to searching by country name
  const lowerInput = countryOrCode.trim().toLowerCase();
  for (const entry of Object.values(COUNTRY_ADEQUACY_MAP)) {
    if (entry.country.toLowerCase() === lowerInput) {
      return entry;
    }
  }

  return undefined;
}

/**
 * Returns all countries that are considered adequate for cross-border data transfers.
 *
 * @returns Array of CountryAdequacy entries with adequacyStatus === 'adequate'
 */
export function getAdequateCountries(): CountryAdequacy[] {
  return Object.values(COUNTRY_ADEQUACY_MAP).filter(
    (entry) => entry.adequacyStatus === 'adequate'
  );
}

/**
 * Determines whether a transfer to the specified country requires NDPC approval.
 *
 * Countries that are not in the adequacy database or that have a status other
 * than 'adequate' require NDPC approval (or an alternative transfer mechanism
 * such as standard contractual clauses or binding corporate rules).
 *
 * @param countryOrCode A country name or ISO 3166-1 alpha-2 code
 * @returns true if NDPC approval is likely required for transfers to this country
 */
export function requiresNDPCApproval(countryOrCode: string): boolean {
  const entry = getCountryAdequacy(countryOrCode);

  // Unknown countries always require approval
  if (!entry) {
    return true;
  }

  // Only 'adequate' countries can rely on an adequacy decision without further approval
  return entry.adequacyStatus !== 'adequate';
}
