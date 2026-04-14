export { ROPAProvider as Provider } from './Provider';
export type { ROPAProviderProps } from './Provider';

// Re-export existing components as named sub-exports
export { ROPAManager } from './ROPAManager';

// Namespace object for compound pattern: <ROPA.Provider>, <ROPA.Manager>, etc.
import { ROPAProvider } from './Provider';
import { ROPAManager } from './ROPAManager';

export const ROPA = {
  Provider: ROPAProvider,
  Manager: ROPAManager,
};
