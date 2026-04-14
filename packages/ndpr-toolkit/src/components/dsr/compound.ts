export { DSRProvider as Provider } from './Provider';
export type { DSRProviderProps } from './Provider';

// Re-export existing components as named sub-exports
export { DSRRequestForm as Form } from './DSRRequestForm';
export { DSRDashboard as Dashboard } from './DSRDashboard';
export { DSRTracker as Tracker } from './DSRTracker';

// Namespace object for compound pattern: <DSR.Provider>, <DSR.Form>, etc.
import { DSRProvider } from './Provider';
import { DSRRequestForm } from './DSRRequestForm';
import { DSRDashboard } from './DSRDashboard';
import { DSRTracker } from './DSRTracker';

export const DSR = {
  Provider: DSRProvider,
  Form: DSRRequestForm,
  Dashboard: DSRDashboard,
  Tracker: DSRTracker,
};
