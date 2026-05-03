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
 * Renders a full privacy policy from a typed `PrivacyPolicy` object.
 *
 * ## Choosing a mode
 *
 * | mode | renders | SEO | host-CSS isolation | best for |
 * |------|---------|-----|--------------------|----------|
 * | `'shadow'` (default) | Inside a Shadow DOM root, opinionated styles included | ❌ markup is invisible to crawlers (lives in shadow) | ✅ structurally impossible to leak | in-app embeds where you want a polished drop-in widget |
 * | `'inline'` | Directly in the host document body | ✅ crawlable markup | ⚠️ consumer styles the markup themselves | SSR'd `/privacy` pages, public legal pages |
 *
 * Inline mode defaults `includeStyles: false` so bare element selectors
 * (`body`, `article`, `h1`...) don't leak into the host page. The rendered
 * markup is plain semantic HTML — `<article>`, `<section>`, `<h2>`, `<p>`,
 * `<ul>`. Pair it with your own typography to make it look right.
 *
 * @example **Inline mode + Tailwind `@tailwindcss/typography`**
 * ```tsx
 * import { PolicyPage } from '@tantainnovative/ndpr-toolkit';
 *
 * // Wrap with the `prose` class so headings, paragraphs, and lists pick
 * // up Tailwind's typography defaults. dark:prose-invert handles dark mode.
 * <article className="prose prose-slate dark:prose-invert max-w-3xl mx-auto">
 *   <PolicyPage policy={policy} mode="inline" />
 * </article>
 * ```
 *
 * @example **Inline mode with shadcn-ui typography**
 * ```tsx
 * <Card>
 *   <CardContent className="prose dark:prose-invert">
 *     <PolicyPage policy={policy} mode="inline" />
 *   </CardContent>
 * </Card>
 * ```
 *
 * @example **Inline mode with raw CSS**
 * ```css
 * .ndpr-policy-page article { font-family: Georgia, serif; line-height: 1.7; }
 * .ndpr-policy-page h2 { font-size: 1.5rem; margin-top: 2rem; }
 * .ndpr-policy-page section { margin-bottom: 1.5rem; }
 * ```
 *
 * @example **Theming the shadow-mode default**
 * ```tsx
 * // Brand the policy without leaving shadow mode — pass theme + customCSS.
 * <PolicyPage
 *   policy={policy}
 *   options={{
 *     theme: 'auto', // or 'light' (default) / 'dark'
 *     customCSS: ':root { --color-accent: #1d4ed8; --max-width: 64rem; }',
 *   }}
 * />
 * ```
 *
 * HTML is generated internally by `exportHTML` from a typed `PrivacyPolicy`
 * and never contains untrusted user input.
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

    // ── TOC anchor handling (v3.5.1 fix)
    //
    // Browser default behaviour for `<a href="#section">` is to look up the
    // target in the LIGHT DOM only. The exported policy lives inside a
    // Shadow DOM root, so the section anchors are invisible to the default
    // scroll-into-view machinery — TOC clicks do nothing without help.
    //
    // Intercept clicks on intra-document anchor links inside the shadow
    // root, find the target by id within the same shadow tree, and scroll
    // it into view. Cross-document and external links pass through.
    const handleAnchorClick = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute('href') ?? '';
      if (!href.startsWith('#') || href.length < 2) return;
      const id = decodeURIComponent(href.slice(1));
      const dest = shadow.getElementById(id);
      if (!dest) return;
      event.preventDefault();
      dest.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    shadow.addEventListener('click', handleAnchorClick);

    return () => {
      shadow.removeEventListener('click', handleAnchorClick);
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
