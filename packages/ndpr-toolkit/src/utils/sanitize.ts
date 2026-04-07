/**
 * Sanitizes user input to prevent XSS attacks.
 * Escapes HTML special characters so that data rendered in dashboards
 * or other consumer UIs cannot execute embedded scripts.
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
