import { useConsent } from '@/contexts/ConsentContext';

/**
 * Hook to access only the consent state without actions
 */
export function useConsentState() {
  const { hasUserConsented, consentState, showBanner, showSettings } = useConsent();
  
  return {
    hasUserConsented,
    consentState,
    showBanner,
    showSettings,
  };
}