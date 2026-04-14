export { CrossBorderProvider as Provider } from './Provider';
export type { CrossBorderProviderProps } from './Provider';

// Re-export existing components as named sub-exports
export { CrossBorderTransferManager } from './CrossBorderTransferManager';

// Namespace object for compound pattern: <CrossBorder.Provider>, <CrossBorder.Manager>, etc.
import { CrossBorderProvider } from './Provider';
import { CrossBorderTransferManager } from './CrossBorderTransferManager';

export const CrossBorder = {
  Provider: CrossBorderProvider,
  Manager: CrossBorderTransferManager,
};
