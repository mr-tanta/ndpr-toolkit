/**
 * Sanitization utilities for the docs site.
 *
 * This module deliberately contains only `escapeHtml`. It previously also
 * exported `sanitizeInput`, `sanitizeEmail`, `sanitizeFileName`,
 * `markdownToSafeHtml`, and `sanitizeUrl`, none of which had a single caller
 * anywhere in the repository, and all of which were built from denylist regexes
 * that CodeQL correctly flagged as unsound:
 *
 * - the `<script>…</script>` strip missed `</script >` and could reassemble the
 *   tag out of surviving fragments (js/bad-tag-filter,
 *   js/incomplete-multi-character-sanitization)
 * - the `on*` handler strip only matched quoted values, so `onerror=alert(1)`
 *   passed straight through (js/incomplete-multi-character-sanitization)
 * - the scheme strip removed `javascript:` but not `data:` or `vbscript:`
 *   (js/incomplete-url-scheme-check)
 * - the email tag strip had the same single-pass reassembly flaw
 *
 * Deleting them is strictly safer than patching them. Unused, subtly broken
 * sanitizers are a trap: the next caller reasonably assumes the name means what
 * it says. Anything needing real HTML sanitization should use the `dompurify`
 * dependency the workspace already pins, and anything needing escaping for text
 * display should use `escapeHtml` below, which escapes the full set and has no
 * bypass.
 */

/**
 * Escapes the five HTML-significant characters so a value is inert when placed
 * in element text or a quoted attribute.
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
