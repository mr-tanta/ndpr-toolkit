'use client';

import React, { createContext, useContext, useMemo, Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
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

  /**
   * Custom fallback UI to render when a child component throws during rendering.
   * Receives the error and a reset function. If omitted, a default fallback is shown.
   */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);

  /**
   * Called when the error boundary catches an error.
   * Useful for sending errors to an external reporting service.
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

const NDPRContext = createContext<NDPRConfig>({});

/* ------------------------------------------------------------------ */
/*  Error Boundary                                                     */
/* ------------------------------------------------------------------ */

interface NDPRErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback UI. Can be a static ReactNode or a render function. */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  /** Called when an error is caught. */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface NDPRErrorBoundaryState {
  error: Error | null;
}

/**
 * React Error Boundary that catches rendering errors from child components
 * and displays a fallback UI instead of crashing the entire application.
 *
 * Can be used standalone or is automatically included when using `NDPRProvider`.
 */
export class NDPRErrorBoundary extends Component<NDPRErrorBoundaryProps, NDPRErrorBoundaryState> {
  constructor(props: NDPRErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): NDPRErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  private reset = (): void => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;

    if (error) {
      const { fallback } = this.props;

      if (typeof fallback === 'function') {
        return fallback(error, this.reset);
      }

      if (fallback !== undefined) {
        return fallback;
      }

      // Default minimal fallback UI
      return (
        <div
          role="alert"
          style={{
            padding: '16px',
            border: '1px solid #e53e3e',
            borderRadius: '4px',
            backgroundColor: '#fff5f5',
            color: '#c53030',
          }}
        >
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Something went wrong</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>{error.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

/**
 * Provides NDPR configuration to all descendant toolkit components.
 *
 * When a `theme` is supplied, the corresponding CSS custom properties
 * (`--ndpr-primary`, `--ndpr-primary-hover`, `--ndpr-primary-foreground`)
 * are set on the wrapping element so components can reference them.
 *
 * Wraps children in an error boundary so that a rendering failure in any
 * toolkit component does not crash the host application.
 */
export const NDPRProvider: React.FC<NDPRConfig & { children: React.ReactNode }> = ({
  children,
  fallback,
  onError,
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
      <NDPRErrorBoundary fallback={fallback} onError={onError}>
        {style ? <div style={style}>{children}</div> : children}
      </NDPRErrorBoundary>
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
