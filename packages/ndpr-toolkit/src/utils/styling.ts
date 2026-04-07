/**
 * Resolves class names for a component section.
 * If unstyled is true, only the override class is used (or empty string).
 * If an override is provided, it fully REPLACES the default — no appending.
 * Otherwise the default class string is returned as-is.
 */
export function resolveClass(
  defaultClass: string,
  override?: string,
  unstyled?: boolean
): string {
  if (unstyled) return override || '';
  if (override) return override;  // REPLACE, not append
  return defaultClass;
}
