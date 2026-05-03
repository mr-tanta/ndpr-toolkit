/**
 * Root /unstyled barrel.
 *
 * Re-exports the curated unstyled API from the inner package so the
 * single-source-of-truth lives next to the styled components it wraps.
 * Use this when you want logic + ARIA + behaviour with no default
 * `.ndpr-*` classes on the rendered tree — handy if your design system
 * (Tailwind, Mantine, Chakra, raw CSS) needs to own all the styling.
 *
 * @example
 * ```tsx
 * import { ConsentBanner } from '@tantainnovative/ndpr-toolkit/unstyled';
 * <ConsentBanner classNames={{ root: 'my-banner' }} options={...} onSave={...} />
 * ```
 */
export {
  ConsentBanner,
  ConsentManager,
  DSRRequestForm,
} from '../packages/ndpr-toolkit/src/unstyled';

export type {
  ConsentBannerProps,
  ConsentBannerClassNames,
  ConsentAnalyticsEvent,
  ConsentManagerProps,
  ConsentManagerClassNames,
  DSRRequestFormProps,
  DSRRequestFormClassNames,
} from '../packages/ndpr-toolkit/src/unstyled';
