export { ConsentProvider as Provider } from './Provider';
export type { ConsentProviderProps } from './Provider';
export { OptionList } from './OptionList';
export type { OptionListProps } from './OptionList';
export { AcceptButton } from './AcceptButton';
export type { AcceptButtonProps } from './AcceptButton';
export { RejectButton } from './RejectButton';
export type { RejectButtonProps } from './RejectButton';
export { SaveButton } from './SaveButton';
export type { SaveButtonProps } from './SaveButton';
// Re-export existing components
export { ConsentBanner as Banner } from './ConsentBanner';
export { ConsentManager as Settings } from './ConsentManager';
export { ConsentStorage as Storage } from './ConsentStorage';

// Namespace object for compound pattern: <Consent.Provider>, <Consent.Banner>, etc.
import { ConsentProvider } from './Provider';
import { OptionList } from './OptionList';
import { AcceptButton } from './AcceptButton';
import { RejectButton } from './RejectButton';
import { SaveButton } from './SaveButton';
import { ConsentBanner } from './ConsentBanner';
import { ConsentManager } from './ConsentManager';
import { ConsentStorage } from './ConsentStorage';

export const Consent = {
  Provider: ConsentProvider,
  OptionList,
  AcceptButton,
  RejectButton,
  SaveButton,
  Banner: ConsentBanner,
  Settings: ConsentManager,
  Storage: ConsentStorage,
};
