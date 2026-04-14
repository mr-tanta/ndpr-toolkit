export { PolicyProvider as Provider } from './Provider';
export type { PolicyProviderProps } from './Provider';

// Re-export existing components as named sub-exports
export { PolicyGenerator } from './PolicyGenerator';
export { PolicyPreview } from './PolicyPreview';
export { PolicyExporter } from './PolicyExporter';

// Namespace object for compound pattern: <Policy.Provider>, <Policy.Generator>, etc.
import { PolicyProvider } from './Provider';
import { PolicyGenerator } from './PolicyGenerator';
import { PolicyPreview } from './PolicyPreview';
import { PolicyExporter } from './PolicyExporter';

export const Policy = {
  Provider: PolicyProvider,
  Generator: PolicyGenerator,
  Preview: PolicyPreview,
  Exporter: PolicyExporter,
};
