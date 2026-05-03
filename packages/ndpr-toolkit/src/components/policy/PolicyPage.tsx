'use client';

import React, { useEffect, useRef } from 'react';
import type { PrivacyPolicy } from '../../types/privacy';
import type { HTMLExportOptions } from '../../types/policy-engine';
import { exportHTML } from '../../utils/policy-export';

export type PolicyPageMode = 'shadow' | 'inline';

export interface PolicyPageProps {
  policy: PrivacyPolicy;
  className?: string;
  /**
   * Render mode.
   *
   * - `'shadow'` (default): mounts the rendered policy inside a Shadow DOM
   *   root, fully isolating the embedded `<style>` block from the host page.
   *   Use this for in-app embeds where you want the rich, opinionated
   *   default styling without polluting global CSS. Client-only.
   *
   * - `'inline'`: injects the policy markup directly into the host document.
   *   Defaults to `includeStyles: false` so bare element selectors don't
   *   leak. Pair with your own CSS / design tokens. SSR-safe.
   */
  mode?: PolicyPageMode;
  /**
   * Pass-through to {@link exportHTML}. Lets you toggle `includeStyles`,
   * `includePrintCSS`, or inject `customCSS`. Defaults differ by mode:
   * shadow mode includes styles; inline mode omits them.
   */
  options?: HTMLExportOptions;
}

/**
 * PolicyPage renders a full privacy policy. By default uses Shadow DOM so the
 * embedded stylesheet (bare selectors like `body`, `article`, `h1`) cannot
 * leak into the host application's CSS. Pass `mode="inline"` for SSR/SEO
 * scenarios where the policy text must appear in the host document.
 *
 * HTML is generated internally by exportHTML from a typed PrivacyPolicy and
 * never contains untrusted user input.
 */
// eslint-disable-next-line react/no-danger
export const PolicyPage: React.FC<PolicyPageProps> = ({
  policy,
  className,
  mode = 'shadow',
  options,
}) => {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (mode !== 'shadow') return;
    const host = hostRef.current;
    if (!host) return;

    const shadowHtml = exportHTML(policy, {
      includeStyles: true,
      includePrintCSS: true,
      ...options,
    });
    // attachShadow throws if called twice on the same host; reuse on re-render.
    const shadow = host.shadowRoot ?? host.attachShadow({ mode: 'open' });
    shadow.innerHTML = shadowHtml;

    return () => {
      if (host.shadowRoot) host.shadowRoot.innerHTML = '';
    };
  }, [policy, options, mode]);

  if (mode === 'shadow') {
    return (
      <div
        ref={hostRef}
        data-ndpr-component="policy-page"
        className={className}
      />
    );
  }

  // Inline mode: defaults to includeStyles=false so bare-selector rules don't
  // leak into the host document. Consumers who want the rich styles in inline
  // mode must opt in explicitly via `options={{ includeStyles: true }}`.
  const inlineHtml = exportHTML(policy, {
    includeStyles: false,
    ...options,
  });
  return (
    // The HTML string is produced by exportHTML from a structured PrivacyPolicy
    // object — not from raw user input — so XSS risk is not present here.
    <div
      data-ndpr-component="policy-page"
      className={className}
      // nosemgrep: react-dangerouslysetinnerhtml
      dangerouslySetInnerHTML={{ __html: inlineHtml }} // NOSONAR: content is generated from typed internal data
    />
  );
};
