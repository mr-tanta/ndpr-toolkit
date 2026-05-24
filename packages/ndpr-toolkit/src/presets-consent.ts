/**
 * Per-preset subpath entry — consent only.
 *
 * Importing from `@tantainnovative/ndpr-toolkit/presets/consent` is
 * narrower than importing from `/presets` (which barrels every preset
 * for re-export). Use this entry when bundle size matters and you only
 * need the consent banner preset.
 *
 * The full `/presets` barrel still works — this is an additive option,
 * not a replacement.
 *
 * @example
 *   import { NDPRConsent } from '@tantainnovative/ndpr-toolkit/presets/consent';
 */
export { NDPRConsent } from './presets/NDPRConsent';
export type { NDPRConsentProps, NDPRConsentCopy } from './presets/NDPRConsent';
