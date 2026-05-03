/**
 * Unstyled entry — design-system-friendly component variants.
 *
 * Components imported from this subpath default `unstyled` to `true`,
 * which strips every default class name from the rendered markup.
 * Consumers using their own design system (Tailwind, Mantine, Chakra,
 * shadcn, raw CSS) get logic + accessibility + semantic structure
 * without any pre-applied visual styling.
 *
 * Markup, ARIA attributes, focus management, keyboard handling, and the
 * `data-ndpr-component` data attributes are all preserved — those are
 * part of the contract, not styling.
 *
 * @example
 * ```tsx
 * // app/cookie-banner.tsx
 * import { ConsentBanner } from '@tantainnovative/ndpr-toolkit/unstyled';
 *
 * export function CookieBanner() {
 *   return (
 *     <ConsentBanner
 *       options={[]}
 *       onSave={() => {}}
 *       classNames={{
 *         root: 'fixed bottom-0 inset-x-0 bg-white p-6 shadow-2xl',
 *         title: 'text-xl font-bold mb-2',
 *         buttonGroup: 'flex gap-2 mt-4',
 *         acceptButton: 'btn-primary',
 *         rejectButton: 'btn-secondary',
 *       }}
 *     />
 *   );
 * }
 * ```
 *
 * For components not yet migrated to the BEM stylesheet (DPIA, Breach,
 * ROPA, etc.), import them from their normal subpath and pass
 * `unstyled` manually if available — the migration completes in 3.5.x.
 */

import React from 'react';
import {
  ConsentBanner as StyledConsentBanner,
  ConsentBannerProps,
} from './components/consent/ConsentBanner';
import {
  ConsentManager as StyledConsentManager,
  ConsentManagerProps,
} from './components/consent/ConsentManager';
import {
  DSRRequestForm as StyledDSRRequestForm,
  DSRRequestFormProps,
} from './components/dsr/DSRRequestForm';

/**
 * Wraps a component so the `unstyled` prop defaults to `true`. Consumers
 * can still pass `unstyled={false}` to opt back into default styling on
 * a per-instance basis (useful for migrating screen-by-screen).
 */
function asUnstyled<P extends { unstyled?: boolean }>(
  Inner: React.ComponentType<P>,
  displayName: string,
): React.FC<P> {
  const Wrapped: React.FC<P> = ({ unstyled = true, ...rest }) =>
    React.createElement(Inner, { ...(rest as P), unstyled } as P);
  Wrapped.displayName = displayName;
  return Wrapped;
}

export const ConsentBanner = asUnstyled<ConsentBannerProps>(
  StyledConsentBanner,
  'UnstyledConsentBanner',
);

export const ConsentManager = asUnstyled<ConsentManagerProps>(
  StyledConsentManager,
  'UnstyledConsentManager',
);

export const DSRRequestForm = asUnstyled<DSRRequestFormProps>(
  StyledDSRRequestForm,
  'UnstyledDSRRequestForm',
);

// Re-export prop types so consumers can type their wrappers.
export type {
  ConsentBannerProps,
  ConsentBannerClassNames,
  ConsentAnalyticsEvent,
} from './components/consent/ConsentBanner';
export type {
  ConsentManagerProps,
  ConsentManagerClassNames,
} from './components/consent/ConsentManager';
export type {
  DSRRequestFormProps,
  DSRRequestFormClassNames,
} from './components/dsr/DSRRequestForm';
