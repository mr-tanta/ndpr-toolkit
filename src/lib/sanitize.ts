/**
 * Sanitization utilities for preventing XSS attacks
 * In production, consider using a library like DOMPurify
 */

/**
 * Escapes HTML special characters to prevent XSS
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Sanitizes user input for safe display
 * Removes dangerous tags and attributes
 */
export function sanitizeInput(input: string): string {
  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove on* event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Escape remaining HTML
  return escapeHtml(sanitized);
}

/**
 * Validates and sanitizes email addresses
 */
export function sanitizeEmail(email: string): string {
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }
  
  // Remove any HTML tags
  return email.replace(/<[^>]*>/g, '').trim().toLowerCase();
}

/**
 * Sanitizes file names to prevent directory traversal attacks
 */
export function sanitizeFileName(fileName: string): string {
  // Remove path separators and null bytes
  return fileName
    .replace(/[\/\\]/g, '')
    .replace(/\0/g, '')
    .replace(/\.{2,}/g, '.')
    .trim();
}

/**
 * Creates a safe HTML structure from markdown
 * This is a basic implementation - for production use a proper markdown parser
 */
export function markdownToSafeHtml(markdown: string): string {
  let html = escapeHtml(markdown);
  
  // Convert markdown syntax to HTML
  html = html
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Line breaks
    .replace(/\n/g, '<br />');
  
  return html;
}

/**
 * Validates and sanitizes URL to prevent open redirect vulnerabilities
 */
export function sanitizeUrl(url: string, allowedHosts?: string[]): string {
  try {
    const parsed = new URL(url);
    
    // Check if protocol is safe
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }
    
    // Check if host is allowed
    if (allowedHosts && !allowedHosts.includes(parsed.hostname)) {
      throw new Error('Host not allowed');
    }
    
    return parsed.toString();
  } catch {
    // If URL parsing fails, return a safe default
    return '#';
  }
}