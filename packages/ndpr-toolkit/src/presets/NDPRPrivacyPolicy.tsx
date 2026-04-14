import React from 'react';
import { PolicyGenerator } from '../components/policy/PolicyGenerator';
import type { PolicyGeneratorClassNames } from '../components/policy/PolicyGenerator';
import type { PolicySection, PolicyVariable } from '../types/privacy';
import type { StorageAdapter } from '../adapters/types';
import { DEFAULT_POLICY_SECTIONS, DEFAULT_POLICY_VARIABLES } from '../utils/policy-templates';

export interface NDPRPrivacyPolicyProps {
  sections?: PolicySection[];
  variables?: PolicyVariable[];
  adapter?: StorageAdapter<{ sections: PolicySection[]; variables: PolicyVariable[]; content: string }>;
  classNames?: PolicyGeneratorClassNames;
  unstyled?: boolean;
  onGenerate?: (policy: { sections: PolicySection[]; variables: PolicyVariable[]; content: string }) => void;
}

export const NDPRPrivacyPolicy: React.FC<NDPRPrivacyPolicyProps> = ({
  sections = DEFAULT_POLICY_SECTIONS,
  variables = DEFAULT_POLICY_VARIABLES,
  adapter,
  classNames,
  unstyled,
  onGenerate = () => {},
}) => {
  const handleGenerate = (policy: { sections: PolicySection[]; variables: PolicyVariable[]; content: string }) => {
    if (adapter) adapter.save(policy);
    onGenerate(policy);
  };

  return (
    <PolicyGenerator
      sections={sections}
      variables={variables}
      onGenerate={handleGenerate}
      classNames={classNames}
      unstyled={unstyled}
    />
  );
};
