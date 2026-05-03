import type { PrivacyPolicy } from '../../types/privacy';
import type { HTMLExportOptions } from '../../types/policy-engine';

/** Escape special HTML characters to prevent injection in text content. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Substitute `{{var}}` placeholders in raw section text.
 *
 * Source-of-truth precedence: `policy.variableValues` first (this is what
 * `useDefaultPrivacyPolicy` populates), then `policy.organizationInfo` for
 * the canonical org-info fields the default templates reference. Tokens
 * that resolve to a non-empty string are replaced; tokens that don't are
 * left intact for `findUnfilledTokens` (or a CI guard) to surface.
 *
 * Escapes regex specials in keys so a variable like `user.name` or
 * `arr[0]` doesn't blow up the matcher.
 */
function substituteVariables(
  text: string,
  policy: { variableValues?: Record<string, string>; organizationInfo?: Record<string, unknown> | undefined },
): string {
  if (!text) return '';

  // Build the lookup table once. variableValues wins; organizationInfo fills
  // gaps for default-template tokens like {{orgName}} → organizationInfo.name.
  const vars: Record<string, string> = {};
  const org = policy.organizationInfo ?? {};
  // Map {{orgName}} → organizationInfo.name (this is the canonical default
  // template's naming convention; doesn't override an explicit
  // variableValues.orgName).
  if (typeof (org as { name?: unknown }).name === 'string' && (org as { name: string }).name) {
    vars.orgName = (org as { name: string }).name;
  }
  for (const [key, value] of Object.entries(org)) {
    if (typeof value === 'string' && value && !(key in vars)) vars[key] = value;
  }
  for (const [key, value] of Object.entries(policy.variableValues ?? {})) {
    if (typeof value === 'string' && value) vars[key] = value;
  }

  return text.replace(/\{\{\s*([^}\s]+)\s*\}\}/g, (whole, rawKey: string) => {
    const key = String(rawKey).trim();
    return Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : whole;
  });
}

/** Convert a section title to a URL-safe anchor slug. */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Convert plain-text content with basic formatting hints into HTML paragraphs.
 * Lines starting with "-" or "•" become list items.
 * Blank lines separate paragraphs.
 */
function contentToHtml(content: string): string {
  const lines = content.split('\n');
  const parts: string[] = [];
  let inList = false;

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.startsWith('- ') || line.startsWith('• ')) {
      if (!inList) {
        parts.push('<ul>');
        inList = true;
      }
      parts.push(`  <li>${escapeHtml(line.replace(/^[-•]\s*/, ''))}</li>`);
    } else {
      if (inList) {
        parts.push('</ul>');
        inList = false;
      }
      if (line.trim() === '') {
        // blank line → paragraph break (handled by spacing)
      } else {
        parts.push(`<p>${escapeHtml(line)}</p>`);
      }
    }
  }

  if (inList) parts.push('</ul>');
  return parts.join('\n');
}

/** Embedded CSS — responsive, print-friendly, dark/light via prefers-color-scheme. */
/** Light-theme color tokens (the default + safe fallback). */
const LIGHT_TOKENS = `
    --color-bg: #ffffff;
    --color-surface: #f9fafb;
    --color-border: #e5e7eb;
    --color-text: #111827;
    --color-text-muted: #6b7280;
    --color-accent: #16a34a;
    --color-accent-light: #dcfce7;
    --color-heading: #064e3b;
    --color-link: #15803d;
    --color-link-hover: #166534;`;

/** Dark-theme color tokens (only emitted when consumer opts in). */
const DARK_TOKENS = `
    --color-bg: #0f172a;
    --color-surface: #1e293b;
    --color-border: #334155;
    --color-text: #f1f5f9;
    --color-text-muted: #94a3b8;
    --color-accent: #22c55e;
    --color-accent-light: #14532d;
    --color-heading: #86efac;
    --color-link: #4ade80;
    --color-link-hover: #86efac;`;

/** Build the design-token block based on the consumer-selected theme. */
function buildTokenBlock(theme: 'light' | 'dark' | 'auto'): string {
  // `color-scheme` tells the UA to render native UI (scrollbars, form controls)
  // matching the chosen theme. For `auto` we declare both so the browser can
  // adapt; for `light`/`dark` we pin so consumers get the deterministic
  // rendering they asked for.
  const colorSchemeDecl =
    theme === 'auto' ? '    color-scheme: light dark;' :
    theme === 'dark' ? '    color-scheme: dark;' :
                       '    color-scheme: light;';

  // Primary token block uses light by default. When the consumer pins
  // `theme: 'dark'`, dark becomes the primary and we omit the prefers-* media
  // query entirely (otherwise it would never match anyway, but cleaner output).
  const primaryTokens = theme === 'dark' ? DARK_TOKENS : LIGHT_TOKENS;

  // The prefers-color-scheme override is only emitted for `theme: 'auto'`.
  // CRITICAL: prior to v3.4.1 this block was emitted unconditionally, which
  // caused dark colors to bleed through Shadow DOM on macOS / iOS / Android
  // dark mode for consumers whose host site is light-only. Shadow DOM does
  // NOT isolate prefers-color-scheme — the media query evaluates against
  // the user agent's setting globally regardless of scope.
  const autoOverride =
    theme === 'auto'
      ? `

  @media (prefers-color-scheme: dark) {
    :root {${DARK_TOKENS}
    }
  }`
      : '';

  return `
  :root {
${colorSchemeDecl}${primaryTokens}
    --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    --font-mono: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace;
    --radius: 8px;
    --shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
    --max-width: 860px;
  }${autoOverride}`;
}

const BASE_STYLES_HEAD = `
  /* ── Reset & Base ─────────────────────────── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Design tokens ────────────────────────── */`;

const BASE_STYLES_TAIL = `
  /* ── Layout ───────────────────────────────── */
  html { font-size: 16px; scroll-behavior: smooth; }

  body {
    font-family: var(--font-sans);
    background: var(--color-bg);
    color: var(--color-text);
    line-height: 1.7;
    padding: 2rem 1.25rem;
  }

  .policy-wrapper {
    max-width: var(--max-width);
    margin: 0 auto;
  }

  /* ── Header ───────────────────────────────── */
  .policy-header {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    padding: 2.5rem 2.5rem 2rem;
    margin-bottom: 2rem;
    box-shadow: var(--shadow);
  }

  .policy-header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-heading);
    line-height: 1.2;
    margin-bottom: 0.75rem;
    letter-spacing: -0.025em;
  }

  .policy-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.5rem;
    font-size: 0.875rem;
    color: var(--color-text-muted);
    margin-top: 0.5rem;
  }

  .policy-meta span { white-space: nowrap; }

  .compliance-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    background: var(--color-accent-light);
    color: var(--color-accent);
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    margin-top: 1rem;
    letter-spacing: 0.01em;
    border: 1px solid var(--color-accent);
  }

  /* ── Navigation / TOC ─────────────────────── */
  .policy-toc {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-left: 4px solid var(--color-accent);
    border-radius: var(--radius);
    padding: 1.5rem 2rem;
    margin-bottom: 2.5rem;
    box-shadow: var(--shadow);
  }

  .policy-toc h2 {
    font-size: 1rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-muted);
    margin-bottom: 1rem;
  }

  .policy-toc ol {
    list-style: decimal;
    padding-left: 1.25rem;
    column-count: 1;
  }

  @media (min-width: 600px) {
    .policy-toc ol { column-count: 2; column-gap: 2rem; }
  }

  .policy-toc li { margin-bottom: 0.35rem; break-inside: avoid; }

  .policy-toc a {
    color: var(--color-link);
    text-decoration: none;
    font-size: 0.9375rem;
    transition: color 0.15s ease;
  }

  .policy-toc a:hover { color: var(--color-link-hover); text-decoration: underline; }

  /* ── Article / Sections ───────────────────── */
  article.policy-body { display: flex; flex-direction: column; gap: 2.5rem; }

  .policy-section {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    padding: 2rem 2.5rem;
    box-shadow: var(--shadow);
    scroll-margin-top: 1.5rem;
  }

  .policy-section h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-heading);
    margin-bottom: 1.25rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid var(--color-accent-light);
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    line-height: 1.3;
  }

  .section-number {
    font-size: 0.75rem;
    font-weight: 700;
    background: var(--color-accent);
    color: #fff;
    width: 1.5rem;
    height: 1.5rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .policy-section p {
    margin-bottom: 0.875rem;
    font-size: 0.9375rem;
    color: var(--color-text);
  }

  .policy-section p:last-child { margin-bottom: 0; }

  .policy-section ul {
    margin: 0.75rem 0 0.875rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .policy-section ul li {
    font-size: 0.9375rem;
    color: var(--color-text);
    position: relative;
  }

  .policy-section ul li::marker { color: var(--color-accent); }

  /* ── Footer ───────────────────────────────── */
  .policy-footer {
    margin-top: 3rem;
    padding: 1.5rem 2rem;
    border-top: 1px solid var(--color-border);
    text-align: center;
    font-size: 0.8125rem;
    color: var(--color-text-muted);
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .policy-footer a { color: var(--color-link); text-decoration: none; }
  .policy-footer a:hover { text-decoration: underline; }

  /* ── Print styles ─────────────────────────── */
  @media print {
    :root {
      --color-bg: #fff;
      --color-surface: #fff;
      --color-border: #d1d5db;
      --color-text: #000;
      --color-text-muted: #374151;
      --color-accent: #16a34a;
      --color-accent-light: #f0fdf4;
      --color-heading: #064e3b;
      --color-link: #15803d;
    }

    body { padding: 0; font-size: 10pt; }
    .policy-wrapper { max-width: 100%; }

    .policy-toc { break-inside: avoid; }
    .policy-section { break-inside: avoid; box-shadow: none; border: 1px solid #d1d5db; }

    .policy-toc ol { column-count: 2; }
    .policy-footer { border-top: 1px solid #d1d5db; }

    a { color: inherit; text-decoration: none; }
  }
`;

/** Compose the full embedded stylesheet for the chosen theme. */
function buildBaseStyles(theme: 'light' | 'dark' | 'auto'): string {
  return `${BASE_STYLES_HEAD}${buildTokenBlock(theme)}${BASE_STYLES_TAIL}`.trim();
}

/**
 * Export a PrivacyPolicy as a self-contained HTML string.
 *
 * The returned string includes:
 * - An embedded `<style>` block (responsive, dark/light, print-friendly)
 * - An `<article>` wrapper with semantic markup
 * - A `<nav>` table of contents with anchor links
 * - A `<section>` for every included policy section
 * - A metadata footer (org name, effective date, version, generator credit)
 * - Optional custom CSS injection via `options.customCSS`
 */
export function exportHTML(policy: PrivacyPolicy, options?: HTMLExportOptions): string {
  const includeStyles = options?.includeStyles !== false;
  const customCSS = options?.customCSS ?? '';

  // Theme defaults to 'light' so the embedded `@media (prefers-color-scheme:
  // dark)` block is opt-in rather than OS-driven. Prior to v3.4.1 this was
  // unconditional and bled dark colors through Shadow DOM (which doesn't
  // isolate prefers-color-scheme) for any visitor on macOS / iOS / Android
  // dark mode — even when the host site was light-only.
  const theme: 'light' | 'dark' | 'auto' = options?.theme ?? 'light';

  const includedSections = policy.sections.filter((s) => s.included);

  const orgName = escapeHtml(policy.organizationInfo.name || 'Organisation');
  const title = escapeHtml(policy.title || 'Privacy Policy');
  const version = escapeHtml(policy.version || '1.0');
  const effectiveDateStr = policy.effectiveDate
    ? new Date(policy.effectiveDate).toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });

  const lastUpdatedStr = policy.lastUpdated
    ? new Date(policy.lastUpdated).toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : effectiveDateStr;

  const websiteHtml = policy.organizationInfo.website
    ? `<a href="${escapeHtml(policy.organizationInfo.website)}" target="_blank" rel="noopener">${escapeHtml(policy.organizationInfo.website)}</a>`
    : '';

  const emailHtml = policy.organizationInfo.privacyEmail
    ? `<a href="mailto:${escapeHtml(policy.organizationInfo.privacyEmail)}">${escapeHtml(policy.organizationInfo.privacyEmail)}</a>`
    : '';

  // ── Table of Contents ────────────────────────────────────────────────────
  const tocItems = includedSections
    .map((section, i) => {
      const anchor = slugify(section.title);
      return `      <li><a href="#${anchor}">${escapeHtml(section.title)}</a></li>`;
    })
    .join('\n');

  const tocHtml = `
  <nav class="policy-toc" aria-label="Table of Contents">
    <h2>Table of Contents</h2>
    <ol>
${tocItems}
    </ol>
  </nav>`;

  // ── Sections ─────────────────────────────────────────────────────────────
  // CRITICAL (v3.4.1): substitute `{{var}}` placeholders before rendering.
  // Prior to this fix, exportHTML rendered raw template strings, so
  // consumers using the recommended hook + PolicyPage flow shipped policies
  // with literal `{{orgName}}`, `{{address}}`, etc. visible to visitors.
  const sectionsHtml = includedSections
    .map((section, i) => {
      const anchor = slugify(section.title);
      const rawContent = section.template || section.defaultContent || '';
      const substituted = substituteVariables(rawContent, {
        variableValues: policy.variableValues,
        organizationInfo: policy.organizationInfo as unknown as Record<string, unknown>,
      });
      const contentHtml = contentToHtml(substituted);
      return `  <section class="policy-section" id="${anchor}" aria-labelledby="section-heading-${anchor}">
    <h2 id="section-heading-${anchor}">
      <span class="section-number" aria-hidden="true">${i + 1}</span>
      ${escapeHtml(section.title)}
    </h2>
    ${contentHtml}
  </section>`;
    })
    .join('\n\n');

  // ── Style block ──────────────────────────────────────────────────────────
  const safeCSS = customCSS ? customCSS.replace(/<\/style>/gi, '') : '';
  const styleBlock = includeStyles
    ? `<style>
${buildBaseStyles(theme)}
${safeCSS ? `\n/* ── Custom styles ──────────────────────────────────────── */\n${safeCSS}` : ''}
</style>`
    : safeCSS
    ? `<style>${safeCSS}</style>`
    : '';

  // ── Full document ────────────────────────────────────────────────────────
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Privacy Policy for ${orgName}" />
  <meta name="generator" content="NDPA Toolkit" />
  <title>${title} — ${orgName}</title>
${styleBlock}
</head>
<body>
  <div class="policy-wrapper">

    <header class="policy-header">
      <h1>${title}</h1>
      <div class="policy-meta">
        <span><strong>Organisation:</strong> ${orgName}</span>
        <span><strong>Effective:</strong> ${effectiveDateStr}</span>
        <span><strong>Version:</strong> ${version}</span>
        ${lastUpdatedStr !== effectiveDateStr ? `<span><strong>Last updated:</strong> ${lastUpdatedStr}</span>` : ''}
      </div>
      <div>
        <span class="compliance-badge" role="img" aria-label="NDPA compliant">&#10003; NDPA 2023 Compliant</span>
      </div>
    </header>

${tocHtml}

    <article class="policy-body" aria-label="Policy content">

${sectionsHtml}

    </article>

    <footer class="policy-footer" role="contentinfo">
      <div>${orgName}${websiteHtml ? ` &mdash; ${websiteHtml}` : ''}</div>
      ${emailHtml ? `<div>Privacy contact: ${emailHtml}</div>` : ''}
      <div>Effective ${effectiveDateStr} &bull; Version ${version}</div>
      <div>Generated by <strong>NDPA Toolkit</strong> &mdash; Nigeria Data Protection Act 2023</div>
    </footer>

  </div>
</body>
</html>`;
}
