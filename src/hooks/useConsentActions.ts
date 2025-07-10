import { useConsent } from '@/contexts/ConsentContext';

/**
 * Hook to access only the consent actions without state
 */
export function useConsentActions() {
  const {
    acceptAll,
    rejectAll,
    savePreferences,
    openSettings,
    closeSettings,
    updateConsent,
  } = useConsent();
  
  return {
    acceptAll,
    rejectAll,
    savePreferences,
    openSettings,
    closeSettings,
    updateConsent,
  };
}