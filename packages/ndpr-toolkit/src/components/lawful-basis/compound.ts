export { LawfulBasisProvider as Provider } from './Provider';
export type { LawfulBasisProviderProps } from './Provider';

// Re-export existing components as named sub-exports
export { LawfulBasisTracker } from './LawfulBasisTracker';

// Namespace object for compound pattern: <LawfulBasis.Provider>, <LawfulBasis.Tracker>, etc.
import { LawfulBasisProvider } from './Provider';
import { LawfulBasisTracker } from './LawfulBasisTracker';

export const LawfulBasis = {
  Provider: LawfulBasisProvider,
  Tracker: LawfulBasisTracker,
};
