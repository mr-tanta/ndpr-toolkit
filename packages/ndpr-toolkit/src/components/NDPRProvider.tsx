import React, { createContext, useContext, useMemo } from 'react';
import type { NDPRLocale } from '../types/locale';
import { mergeLocale } from '../utils/locale';
import { defaultLocale } from '../locales/en';

/**
 * Configuration for the NDPR toolkit provider.
 */
export interface NDPRConfig {
  /** The official name of the organisation */
  organizationName?: string;

  /** Email address of the Data Protection Officer */
  dpoEmail?: string;

  /** NDPC registration number, if registered */
  ndpcRegistrationNumber?: string;

  /** Prefix for localStorage/sessionStorage keys used by toolkit components */
  storageKeyPrefix?: string;

  /** When true, removes all default styles from toolkit components */
  unstyled?: boolean;

  /** Theme overrides applied as CSS custom properties */
  theme?: {
    /** Primary brand colour (e.g. "#0070f3") */
    primary?: string;
    /** Hover state for primary colour */
    primaryHover?: string;
    /** Foreground colour used on primary backgrounds */
    primaryForeground?: string;
  };

  /**
   * Locale strings for all toolkit components.
   * Pass partial overrides — missing keys fall back to English defaults.
   */
  locale?: NDPRLocale;
}

const NDPRContext = createContext<NDPRConfig>({});

/**
 * Provides NDPR configuration to all descendant toolkit components.
 *
 * When a `theme` is supplied, the corresponding CSS custom properties
 * (`--ndpr-primary`, `--ndpr-primary-hover`, `--ndpr-primary-foreground`)
 * are set on the wrapping element so components can reference them.
 */
export const NDPRProvider: React.FC<NDPRConfig & { children: React.ReactNode }> = ({
  children,
  ...config
}) => {
  const style = useMemo<React.CSSProperties | undefined>(() => {
    if (!config.theme) return undefined;

    const vars: Record<string, string> = {};
    if (config.theme.primary) vars['--ndpr-primary'] = config.theme.primary;
    if (config.theme.primaryHover) vars['--ndpr-primary-hover'] = config.theme.primaryHover;
    if (config.theme.primaryForeground) vars['--ndpr-primary-foreground'] = config.theme.primaryForeground;

    return Object.keys(vars).length > 0 ? (vars as React.CSSProperties) : undefined;
  }, [config.theme]);

  return (
    <NDPRContext.Provider value={config}>
      {style ? <div style={style}>{children}</div> : children}
    </NDPRContext.Provider>
  );
};

/**
 * Returns the current NDPR configuration from the nearest `NDPRProvider`.
 * If no provider is found, returns an empty config object.
 */
export function useNDPRConfig(): NDPRConfig {
  return useContext(NDPRContext);
}

/**
 * Returns the resolved locale for the nearest `NDPRProvider`.
 * Merges any partial `locale` prop with the default English strings,
 * so all keys are always present and non-nullable.
 */
export function useNDPRLocale(): typeof defaultLocale {
  const { locale } = useContext(NDPRContext);
  return useMemo(() => mergeLocale(locale), [locale]);
}
