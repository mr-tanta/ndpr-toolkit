/**
 * Cookie scanner — audits the cookies actually present in the browser against
 * the cookies you have declared, surfacing undeclared cookies that put you out
 * of step with your cookie notice (NDPA 2023 S.25-26 / NDPC GAID 2025 on
 * specific, informed consent).
 *
 * Pure and DOM-optional: pass `cookieString` to scan an arbitrary value (a
 * `Cookie:` header on the server, a test fixture), or call it in the browser
 * and it reads `document.cookie`. Safe to import from a server bundle.
 */

/** A cookie you declare against a consent category. */
export interface DeclaredCookie {
  /** Exact cookie name, a prefix (with `prefix: true`), or a RegExp matched against the name. */
  name: string | RegExp;
  /** Consent category this cookie belongs to (e.g. 'necessary', 'analytics', 'marketing'). */
  category: string;
  /** Who sets the cookie (e.g. 'Google Analytics'). */
  provider?: string;
  /** What the cookie is used for — surfaced in your cookie policy. */
  purpose?: string;
  /** Treat a string `name` as a prefix match instead of an exact match. Ignored for RegExp names. */
  prefix?: boolean;
}

export interface CookieScanOptions {
  /**
   * The cookie string to scan, in `document.cookie` form (`a=1; b=2`).
   * Defaults to `document.cookie` in the browser, or `''` on the server.
   */
  cookieString?: string;
  /** Reference timestamp (epoch ms) recorded on the result. Defaults to `Date.now()`. */
  asOf?: number;
  /** Extra known cookies, checked before the built-in registry (so they can override it). */
  knownCookies?: DeclaredCookie[];
  /** Whether to fall back to the built-in known-cookie registry for undeclared cookies. @default true */
  useKnownRegistry?: boolean;
}

/** How a present cookie was classified. */
export type CookieMatchSource = 'declared' | 'known' | 'none';

export interface ScannedCookie {
  /** The cookie name as found in the cookie string. */
  name: string;
  /** Resolved consent category, or `null` when it could not be classified. */
  category: string | null;
  /** Whether it matched your declaration, only the known registry, or nothing. */
  matchedBy: CookieMatchSource;
  provider?: string;
  purpose?: string;
}

export interface CookieScanResult {
  /** When the scan ran (epoch ms). */
  scannedAt: number;
  /** Number of cookies present. */
  total: number;
  /** Every present cookie, classified. */
  cookies: ScannedCookie[];
  /** Cookies that matched one of your declared cookies. */
  declared: ScannedCookie[];
  /** Cookies present but NOT in your declaration — the compliance gap. */
  undeclared: ScannedCookie[];
  /** Undeclared cookies the built-in registry could still identify. */
  identified: ScannedCookie[];
  /** Undeclared cookies that could not be identified at all. */
  unknown: ScannedCookie[];
  /** Present cookies grouped by resolved category; unclassified cookies go under `uncategorized`. */
  byCategory: Record<string, ScannedCookie[]>;
  /** True when there are no undeclared cookies. */
  complete: boolean;
}

/**
 * Built-in registry of widely deployed third-party cookies, so an undeclared
 * cookie can often still be identified (provider + likely category). Override
 * or extend via {@link CookieScanOptions.knownCookies}; categories follow the
 * common necessary / functional / analytics / marketing taxonomy.
 */
export const KNOWN_COOKIES: DeclaredCookie[] = [
  // Google Analytics / GA4 / Tag Manager
  { name: '_ga', category: 'analytics', provider: 'Google Analytics', purpose: 'Distinguishes users' },
  { name: '_ga_', prefix: true, category: 'analytics', provider: 'Google Analytics (GA4)', purpose: 'Persists session state' },
  { name: '_gid', category: 'analytics', provider: 'Google Analytics', purpose: 'Distinguishes users' },
  { name: '_gat', prefix: true, category: 'analytics', provider: 'Google Analytics', purpose: 'Throttles request rate' },
  { name: '_dc_gtm_', prefix: true, category: 'analytics', provider: 'Google Tag Manager', purpose: 'Throttles request rate' },
  // Google Ads / DoubleClick
  { name: '_gcl_', prefix: true, category: 'marketing', provider: 'Google Ads', purpose: 'Conversion tracking' },
  { name: 'IDE', category: 'marketing', provider: 'Google DoubleClick', purpose: 'Ad targeting' },
  { name: 'test_cookie', category: 'marketing', provider: 'Google DoubleClick', purpose: 'Checks cookie support' },
  // Meta / Facebook
  { name: '_fbp', category: 'marketing', provider: 'Meta (Facebook)', purpose: 'Ad delivery and measurement' },
  { name: '_fbc', category: 'marketing', provider: 'Meta (Facebook)', purpose: 'Click attribution' },
  { name: 'fr', category: 'marketing', provider: 'Meta (Facebook)', purpose: 'Ad delivery and measurement' },
  // Microsoft Clarity
  { name: '_clck', category: 'analytics', provider: 'Microsoft Clarity', purpose: 'Session analytics' },
  { name: '_clsk', category: 'analytics', provider: 'Microsoft Clarity', purpose: 'Session analytics' },
  // Hotjar
  { name: '_hj', prefix: true, category: 'analytics', provider: 'Hotjar', purpose: 'Behaviour analytics' },
  // LinkedIn
  { name: 'bcookie', category: 'marketing', provider: 'LinkedIn', purpose: 'Browser identification' },
  { name: 'lidc', category: 'marketing', provider: 'LinkedIn', purpose: 'Routing / ad delivery' },
  { name: 'li_', prefix: true, category: 'marketing', provider: 'LinkedIn', purpose: 'Ad delivery' },
  // TikTok
  { name: '_ttp', category: 'marketing', provider: 'TikTok', purpose: 'Ad measurement' },
  // X / Twitter
  { name: 'personalization_id', category: 'marketing', provider: 'X (Twitter)', purpose: 'Ad personalisation' },
  { name: 'guest_id', category: 'marketing', provider: 'X (Twitter)', purpose: 'Identifies the browser' },
  // HubSpot
  { name: 'hubspotutk', category: 'marketing', provider: 'HubSpot', purpose: 'Visitor identification' },
  { name: '__hs', prefix: true, category: 'analytics', provider: 'HubSpot', purpose: 'Analytics / session' },
  // Stripe
  { name: '__stripe_mid', category: 'necessary', provider: 'Stripe', purpose: 'Fraud prevention' },
  { name: '__stripe_sid', category: 'necessary', provider: 'Stripe', purpose: 'Fraud prevention' },
  // Intercom
  { name: 'intercom-', prefix: true, category: 'functional', provider: 'Intercom', purpose: 'Live chat / messaging' },
  // This toolkit's own consent record
  { name: 'ndpr_consent', category: 'necessary', provider: 'NDPR Toolkit', purpose: 'Stores the consent decision' },
];

function nameMatches(cookieName: string, decl: DeclaredCookie): boolean {
  if (decl.name instanceof RegExp) return decl.name.test(cookieName);
  if (decl.prefix) return cookieName.startsWith(decl.name);
  return cookieName === decl.name;
}

/** Extract cookie names from a `document.cookie`-style string, ignoring blanks and values. */
function parseCookieNames(cookieString: string): string[] {
  return cookieString
    .split(';')
    .map((segment) => {
      const trimmed = segment.trim();
      const eq = trimmed.indexOf('=');
      return (eq === -1 ? trimmed : trimmed.slice(0, eq)).trim();
    })
    .filter((name) => name.length > 0);
}

/**
 * Scan the cookies present against your declared cookies and a registry of
 * well-known third-party cookies. Returns which cookies are declared, which are
 * undeclared (and whether they can still be identified), and a per-category view.
 */
export function scanCookies(
  declared: DeclaredCookie[] = [],
  options: CookieScanOptions = {},
): CookieScanResult {
  const cookieString =
    options.cookieString ?? (typeof document !== 'undefined' ? document.cookie : '');
  const scannedAt = options.asOf ?? Date.now();
  const useRegistry = options.useKnownRegistry ?? true;
  const registry = useRegistry ? [...(options.knownCookies ?? []), ...KNOWN_COOKIES] : [];

  const cookies: ScannedCookie[] = parseCookieNames(cookieString).map((name) => {
    const declaredMatch = declared.find((d) => nameMatches(name, d));
    if (declaredMatch) {
      return {
        name,
        category: declaredMatch.category,
        matchedBy: 'declared',
        provider: declaredMatch.provider,
        purpose: declaredMatch.purpose,
      };
    }

    const knownMatch = registry.find((d) => nameMatches(name, d));
    if (knownMatch) {
      return {
        name,
        category: knownMatch.category,
        matchedBy: 'known',
        provider: knownMatch.provider,
        purpose: knownMatch.purpose,
      };
    }

    return { name, category: null, matchedBy: 'none' };
  });

  const byCategory: Record<string, ScannedCookie[]> = {};
  for (const cookie of cookies) {
    const key = cookie.category ?? 'uncategorized';
    (byCategory[key] ??= []).push(cookie);
  }

  const undeclared = cookies.filter((c) => c.matchedBy !== 'declared');

  return {
    scannedAt,
    total: cookies.length,
    cookies,
    declared: cookies.filter((c) => c.matchedBy === 'declared'),
    undeclared,
    identified: cookies.filter((c) => c.matchedBy === 'known'),
    unknown: cookies.filter((c) => c.matchedBy === 'none'),
    byCategory,
    complete: undeclared.length === 0,
  };
}
