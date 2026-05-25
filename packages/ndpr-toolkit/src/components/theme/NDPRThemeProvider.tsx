'use client';

import React, { useMemo } from 'react';

/**
 * Typed theme object for `NDPRThemeProvider`.
 *
 * Every field is optional. Each set field becomes one `--ndpr-*` CSS custom
 * property on the wrapping element; unset fields fall through to the
 * defaults shipped in `@tantainnovative/ndpr-toolkit/styles`.
 *
 * Color values are passed as **RGB triplets** (space-separated channels,
 * no `rgb()` wrapper) because the stylesheet uses `rgb(var(--ndpr-primary))`
 * everywhere. This lets the same token power solid backgrounds and
 * `rgb(var(--ndpr-primary) / 0.12)` tints.
 *
 * @example
 *   const theme: NDPRTheme = {
 *     colors: { primary: '22 163 74', primaryHover: '21 128 61' },
 *     radius: { base: '0.75rem' },
 *   };
 *
 * @example
 *   // Helper consumers may write themselves for hex inputs:
 *   //   const hexToRgbTriplet = (hex: string) => {
 *   //     const n = parseInt(hex.replace('#', ''), 16);
 *   //     return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
 *   //   };
 *   //   const theme: NDPRTheme = { colors: { primary: hexToRgbTriplet('#16a34a') } };
 */
export interface NDPRTheme {
  /** Light / dark mode hint. Sets `data-theme` so stylesheet's `[data-theme="dark"]` selector applies. */
  mode?: 'light' | 'dark';
  /** Color tokens — all values are RGB triplets, e.g. `'22 163 74'`. */
  colors?: {
    primary?: string;
    primaryHover?: string;
    primaryForeground?: string;
    background?: string;
    surface?: string;
    foreground?: string;
    muted?: string;
    mutedForeground?: string;
    border?: string;
    input?: string;
    ring?: string;
    success?: string;
    destructive?: string;
    warning?: string;
  };
  /** Border-radius scale — CSS length values, e.g. `'0.5rem'`. */
  radius?: {
    sm?: string;
    base?: string;
    lg?: string;
    full?: string;
  };
  /** Spacing scale — CSS length values. */
  spacing?: {
    1?: string;
    2?: string;
    3?: string;
    4?: string;
    5?: string;
    6?: string;
    8?: string;
  };
  /** Box-shadow tokens. */
  shadow?: {
    sm?: string;
    base?: string;
    lg?: string;
  };
  /** Typography tokens. `sans` is a font-family string; the rest are CSS length values. */
  font?: {
    sans?: string;
    sizeXs?: string;
    sizeSm?: string;
    sizeBase?: string;
    sizeLg?: string;
    sizeXl?: string;
    lineHeight?: string;
    lineHeightTight?: string;
  };
  /** Transition timing tokens, e.g. `'150ms ease-out'`. */
  transition?: {
    base?: string;
    slow?: string;
  };
  /** Z-index tokens for banners and modals. */
  z?: {
    banner?: number | string;
    modal?: number | string;
  };
}

export interface NDPRThemeProviderProps {
  /** Theme overrides. Only fields you set produce CSS variables. */
  theme?: NDPRTheme;
  /** Optional className on the wrapping `div` — useful for Tailwind utilities. */
  className?: string;
  children: React.ReactNode;
}

/**
 * Provides theme tokens to NDPR toolkit components by injecting `--ndpr-*`
 * CSS custom properties on a wrapping `div`.
 *
 * This is syntactic sugar over the toolkit's existing CSS-variable theming
 * model. The stylesheet at `@tantainnovative/ndpr-toolkit/styles` defines
 * all defaults; this provider only sets variables for fields you explicitly
 * supply, so unset tokens cascade from `:root`.
 *
 * @example
 *   import { NDPRThemeProvider, type NDPRTheme } from '@tantainnovative/ndpr-toolkit';
 *
 *   const theme: NDPRTheme = {
 *     colors: { primary: '22 163 74', primaryHover: '21 128 61' },
 *     radius: { base: '0.75rem' },
 *   };
 *
 *   <NDPRThemeProvider theme={theme}>
 *     <App />
 *   </NDPRThemeProvider>
 */
export const NDPRThemeProvider: React.FC<NDPRThemeProviderProps> = ({
  theme,
  className,
  children,
}) => {
  const style = useMemo<React.CSSProperties | undefined>(() => {
    if (!theme) return undefined;
    const vars: Record<string, string> = {};

    if (theme.colors) {
      const c = theme.colors;
      if (c.primary !== undefined) vars['--ndpr-primary'] = c.primary;
      if (c.primaryHover !== undefined) vars['--ndpr-primary-hover'] = c.primaryHover;
      if (c.primaryForeground !== undefined) vars['--ndpr-primary-foreground'] = c.primaryForeground;
      if (c.background !== undefined) vars['--ndpr-background'] = c.background;
      if (c.surface !== undefined) vars['--ndpr-surface'] = c.surface;
      if (c.foreground !== undefined) vars['--ndpr-foreground'] = c.foreground;
      if (c.muted !== undefined) vars['--ndpr-muted'] = c.muted;
      if (c.mutedForeground !== undefined) vars['--ndpr-muted-foreground'] = c.mutedForeground;
      if (c.border !== undefined) vars['--ndpr-border'] = c.border;
      if (c.input !== undefined) vars['--ndpr-input'] = c.input;
      if (c.ring !== undefined) vars['--ndpr-ring'] = c.ring;
      if (c.success !== undefined) vars['--ndpr-success'] = c.success;
      if (c.destructive !== undefined) vars['--ndpr-destructive'] = c.destructive;
      if (c.warning !== undefined) vars['--ndpr-warning'] = c.warning;
    }

    if (theme.radius) {
      const r = theme.radius;
      if (r.sm !== undefined) vars['--ndpr-radius-sm'] = r.sm;
      if (r.base !== undefined) vars['--ndpr-radius'] = r.base;
      if (r.lg !== undefined) vars['--ndpr-radius-lg'] = r.lg;
      if (r.full !== undefined) vars['--ndpr-radius-full'] = r.full;
    }

    if (theme.spacing) {
      const s = theme.spacing;
      if (s[1] !== undefined) vars['--ndpr-space-1'] = s[1];
      if (s[2] !== undefined) vars['--ndpr-space-2'] = s[2];
      if (s[3] !== undefined) vars['--ndpr-space-3'] = s[3];
      if (s[4] !== undefined) vars['--ndpr-space-4'] = s[4];
      if (s[5] !== undefined) vars['--ndpr-space-5'] = s[5];
      if (s[6] !== undefined) vars['--ndpr-space-6'] = s[6];
      if (s[8] !== undefined) vars['--ndpr-space-8'] = s[8];
    }

    if (theme.shadow) {
      const sh = theme.shadow;
      if (sh.sm !== undefined) vars['--ndpr-shadow-sm'] = sh.sm;
      if (sh.base !== undefined) vars['--ndpr-shadow'] = sh.base;
      if (sh.lg !== undefined) vars['--ndpr-shadow-lg'] = sh.lg;
    }

    if (theme.font) {
      const f = theme.font;
      if (f.sans !== undefined) vars['--ndpr-font-sans'] = f.sans;
      if (f.sizeXs !== undefined) vars['--ndpr-font-size-xs'] = f.sizeXs;
      if (f.sizeSm !== undefined) vars['--ndpr-font-size-sm'] = f.sizeSm;
      if (f.sizeBase !== undefined) vars['--ndpr-font-size-base'] = f.sizeBase;
      if (f.sizeLg !== undefined) vars['--ndpr-font-size-lg'] = f.sizeLg;
      if (f.sizeXl !== undefined) vars['--ndpr-font-size-xl'] = f.sizeXl;
      if (f.lineHeight !== undefined) vars['--ndpr-line-height'] = f.lineHeight;
      if (f.lineHeightTight !== undefined) vars['--ndpr-line-height-tight'] = f.lineHeightTight;
    }

    if (theme.transition) {
      const t = theme.transition;
      if (t.base !== undefined) vars['--ndpr-transition'] = t.base;
      if (t.slow !== undefined) vars['--ndpr-transition-slow'] = t.slow;
    }

    if (theme.z) {
      const z = theme.z;
      if (z.banner !== undefined) vars['--ndpr-z-banner'] = String(z.banner);
      if (z.modal !== undefined) vars['--ndpr-z-modal'] = String(z.modal);
    }

    return Object.keys(vars).length > 0 ? (vars as React.CSSProperties) : undefined;
  }, [theme]);

  const dataTheme = theme?.mode;

  return (
    <div
      data-ndpr-theme=""
      data-theme={dataTheme}
      className={className}
      style={style}
    >
      {children}
    </div>
  );
};
