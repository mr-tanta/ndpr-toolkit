import React from 'react';
import { AdaptivePolicyWizard } from '../components/policy/AdaptivePolicyWizard';
import type { PrivacyPolicy } from '../types/privacy';
import type { StorageAdapter } from '../adapters/types';
import type { PolicyDraft } from '../types/policy-engine';

export interface NDPRPrivacyPolicyProps {
  adapter?: StorageAdapter<PolicyDraft>;
  onComplete?: (policy: PrivacyPolicy) => void;
  classNames?: Record<string, string>;
  unstyled?: boolean;
}

export const NDPRPrivacyPolicy: React.FC<NDPRPrivacyPolicyProps> = (props) => {
  return <AdaptivePolicyWizard {...props} />;
};
