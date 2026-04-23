import type { NDPRLocale } from '../types/locale';
import { defaultLocale } from '../locales/en';

/**
 * Deep merges a partial locale with the default English locale.
 * Any missing keys fall back to English.
 */
export function mergeLocale(partial?: NDPRLocale): typeof defaultLocale {
  if (!partial) return defaultLocale;

  const result = { ...defaultLocale };
  for (const key of Object.keys(partial) as (keyof NDPRLocale)[]) {
    if (partial[key]) {
      (result as Record<string, unknown>)[key] = { ...defaultLocale[key], ...partial[key] };
    }
  }
  return result as typeof defaultLocale;
}
