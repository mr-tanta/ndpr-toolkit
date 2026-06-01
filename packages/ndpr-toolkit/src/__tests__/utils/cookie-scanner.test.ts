import { scanCookies, KNOWN_COOKIES } from '../../utils/cookie-scanner';
import type { DeclaredCookie } from '../../utils/cookie-scanner';

describe('scanCookies — NDPA cookie audit (declared vs present)', () => {
  it('returns an empty, complete result when no cookies are present', () => {
    const r = scanCookies([], { cookieString: '' });
    expect(r.total).toBe(0);
    expect(r.cookies).toEqual([]);
    expect(r.undeclared).toEqual([]);
    expect(r.complete).toBe(true);
  });

  it('parses cookie names out of a document.cookie-style string', () => {
    const r = scanCookies([], { cookieString: 'a=1; b=two; c=' });
    expect(r.total).toBe(3);
    expect(r.cookies.map((c) => c.name).sort()).toEqual(['a', 'b', 'c']);
  });

  it('matches a present cookie to a declared cookie by exact name', () => {
    const declared: DeclaredCookie[] = [
      { name: 'session_id', category: 'necessary', provider: 'App', purpose: 'Login session' },
    ];
    const r = scanCookies(declared, { cookieString: 'session_id=abc' });
    const c = r.cookies[0];
    expect(c.matchedBy).toBe('declared');
    expect(c.category).toBe('necessary');
    expect(c.provider).toBe('App');
    expect(c.purpose).toBe('Login session');
    expect(r.declared).toHaveLength(1);
    expect(r.undeclared).toHaveLength(0);
    expect(r.complete).toBe(true);
  });

  it('matches by prefix when prefix: true', () => {
    const declared: DeclaredCookie[] = [
      { name: 'app_', category: 'functional', prefix: true },
    ];
    const r = scanCookies(declared, { cookieString: 'app_theme=dark; app_locale=en' });
    expect(r.declared).toHaveLength(2);
    expect(r.cookies.every((c) => c.category === 'functional')).toBe(true);
  });

  it('matches by RegExp name', () => {
    const declared: DeclaredCookie[] = [
      { name: /^sess-[0-9]+$/, category: 'necessary' },
    ];
    const r = scanCookies(declared, { cookieString: 'sess-42=x; other=y' });
    const sess = r.cookies.find((c) => c.name === 'sess-42')!;
    const other = r.cookies.find((c) => c.name === 'other')!;
    expect(sess.matchedBy).toBe('declared');
    expect(other.matchedBy).toBe('none');
  });

  it('flags an undeclared cookie that the known registry can still identify', () => {
    const r = scanCookies([], { cookieString: '_ga=GA1.2.3' });
    const ga = r.cookies[0];
    expect(ga.matchedBy).toBe('known');
    expect(ga.category).toBe('analytics');
    expect(ga.provider).toMatch(/Google/i);
    expect(r.declared).toHaveLength(0);
    expect(r.undeclared).toHaveLength(1);
    expect(r.identified).toHaveLength(1);
    expect(r.unknown).toHaveLength(0);
    expect(r.complete).toBe(false);
  });

  it('identifies GA4 and Meta cookies via prefix/known patterns', () => {
    const r = scanCookies([], { cookieString: '_ga_ABC123=1; _fbp=fb.1.2' });
    const ga4 = r.cookies.find((c) => c.name === '_ga_ABC123')!;
    const fbp = r.cookies.find((c) => c.name === '_fbp')!;
    expect(ga4.matchedBy).toBe('known');
    expect(ga4.category).toBe('analytics');
    expect(fbp.matchedBy).toBe('known');
    expect(fbp.category).toBe('marketing');
    expect(fbp.provider).toMatch(/Meta|Facebook/i);
  });

  it('classifies a fully unknown cookie as unmatched and uncategorized', () => {
    const r = scanCookies([], { cookieString: 'totally_custom=1' });
    const c = r.cookies[0];
    expect(c.matchedBy).toBe('none');
    expect(c.category).toBeNull();
    expect(r.unknown).toHaveLength(1);
    expect(r.identified).toHaveLength(0);
    expect(r.byCategory.uncategorized).toHaveLength(1);
  });

  it('lets your own declaration take precedence over the known registry', () => {
    const declared: DeclaredCookie[] = [
      { name: '_ga', category: 'statistics', provider: 'Our analytics' },
    ];
    const r = scanCookies(declared, { cookieString: '_ga=1' });
    const c = r.cookies[0];
    expect(c.matchedBy).toBe('declared');
    expect(c.category).toBe('statistics');
    expect(c.provider).toBe('Our analytics');
    expect(r.undeclared).toHaveLength(0);
  });

  it('treats known cookies as unknown when useKnownRegistry is false', () => {
    const r = scanCookies([], { cookieString: '_ga=1', useKnownRegistry: false });
    expect(r.cookies[0].matchedBy).toBe('none');
    expect(r.identified).toHaveLength(0);
    expect(r.unknown).toHaveLength(1);
  });

  it('lets callers extend the registry via knownCookies', () => {
    const r = scanCookies([], {
      cookieString: 'acme_pixel=1',
      knownCookies: [{ name: 'acme_pixel', category: 'marketing', provider: 'Acme Ads' }],
    });
    expect(r.cookies[0].matchedBy).toBe('known');
    expect(r.cookies[0].provider).toBe('Acme Ads');
  });

  it('groups present cookies by resolved category', () => {
    const declared: DeclaredCookie[] = [{ name: 'sid', category: 'necessary' }];
    const r = scanCookies(declared, { cookieString: 'sid=1; _ga=2; mystery=3' });
    expect(r.byCategory.necessary.map((c) => c.name)).toEqual(['sid']);
    expect(r.byCategory.analytics.map((c) => c.name)).toEqual(['_ga']);
    expect(r.byCategory.uncategorized.map((c) => c.name)).toEqual(['mystery']);
  });

  it('stamps scannedAt from the asOf option', () => {
    const r = scanCookies([], { cookieString: '', asOf: 1717000000000 });
    expect(r.scannedAt).toBe(1717000000000);
  });

  it('tolerates malformed cookie strings (blank segments, no value, stray spaces)', () => {
    const r = scanCookies([], { cookieString: '  ; a=1 ;; b ; =orphan; ' });
    const names = r.cookies.map((c) => c.name);
    expect(names).toContain('a');
    expect(names).toContain('b');
    expect(names).not.toContain('');
  });

  it('recognises the toolkit consent cookie as necessary', () => {
    const r = scanCookies([], { cookieString: 'ndpr_consent=eyJ9' });
    expect(r.cookies[0].matchedBy).toBe('known');
    expect(r.cookies[0].category).toBe('necessary');
  });

  it('exposes a non-empty built-in registry', () => {
    expect(Array.isArray(KNOWN_COOKIES)).toBe(true);
    expect(KNOWN_COOKIES.length).toBeGreaterThan(5);
  });
});
