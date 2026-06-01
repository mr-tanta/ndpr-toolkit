import { useCallback, useEffect, useRef, useState } from 'react';
import { scanCookies } from '../utils/cookie-scanner';
import type { DeclaredCookie, CookieScanOptions, CookieScanResult } from '../utils/cookie-scanner';

export interface UseCookieScanReturn {
  /** The latest scan, or `null` before the first client-side scan (e.g. during SSR). */
  result: CookieScanResult | null;
  /** Re-read the cookies and recompute the scan with the current arguments. */
  rescan: () => void;
}

/**
 * React hook that scans `document.cookie` against your declared cookies on
 * mount and exposes a `rescan()` to re-run after you set or clear cookies.
 *
 * `result` is `null` until the first client-side scan, so server and first
 * client render agree (no hydration mismatch). `rescan` is stable and always
 * reads the latest `declared`/`options` — callers don't need to memoise them.
 */
export function useCookieScan(
  declared?: DeclaredCookie[],
  options?: CookieScanOptions,
): UseCookieScanReturn {
  const [result, setResult] = useState<CookieScanResult | null>(null);

  const declaredRef = useRef(declared);
  const optionsRef = useRef(options);
  declaredRef.current = declared;
  optionsRef.current = options;

  const rescan = useCallback(() => {
    setResult(scanCookies(declaredRef.current, optionsRef.current));
  }, []);

  useEffect(() => {
    rescan();
  }, [rescan]);

  return { result, rescan };
}
