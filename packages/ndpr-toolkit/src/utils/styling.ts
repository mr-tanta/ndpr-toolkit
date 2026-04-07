/**
 * Resolves class names for a component section.
 * If unstyled is true, only the override class is used.
 * Otherwise, the override is appended to the default.
 */
export function resolveClass(
  defaultClass: string,
  override?: string,
  unstyled?: boolean
): string {
  if (unstyled) return override || '';
  if (override) return override;
  return defaultClass;
}
