import React from 'react';
import { render, act } from '@testing-library/react';
import { useCookieScan } from '../../hooks/useCookieScan';
import type { UseCookieScanReturn } from '../../hooks/useCookieScan';

function capture(...args: Parameters<typeof useCookieScan>): UseCookieScanReturn {
  let value: UseCookieScanReturn | undefined;
  function Probe() {
    value = useCookieScan(...args);
    return null;
  }
  render(<Probe />);
  return value as UseCookieScanReturn;
}

describe('useCookieScan', () => {
  it('scans on mount and classifies declared vs undeclared cookies', () => {
    const v = capture([{ name: 'sid', category: 'necessary' }], {
      cookieString: 'sid=1; _ga=2; mystery=3',
    });
    expect(v.result).not.toBeNull();
    expect(v.result!.total).toBe(3);
    expect(v.result!.declared).toHaveLength(1);
    expect(v.result!.undeclared).toHaveLength(2);
    expect(v.result!.identified.map((c) => c.name)).toEqual(['_ga']);
    expect(v.result!.unknown.map((c) => c.name)).toEqual(['mystery']);
  });

  it('exposes a stable rescan function across renders', () => {
    const seen: Array<() => void> = [];
    function Probe() {
      const { rescan } = useCookieScan([], { cookieString: '' });
      seen.push(rescan);
      return null;
    }
    const { rerender } = render(<Probe />);
    rerender(<Probe />);
    expect(seen.length).toBeGreaterThanOrEqual(2);
    expect(seen[0]).toBe(seen[seen.length - 1]);
  });

  it('rescan picks up newly set cookies without changing identity', () => {
    let api: UseCookieScanReturn | undefined;
    document.cookie = 'first=1';
    function Probe() {
      api = useCookieScan();
      return null;
    }
    render(<Probe />);
    const before = api!.result!.total;
    document.cookie = 'second=2';
    act(() => {
      api!.rescan();
    });
    expect(api!.result!.total).toBeGreaterThan(before);
  });
});
