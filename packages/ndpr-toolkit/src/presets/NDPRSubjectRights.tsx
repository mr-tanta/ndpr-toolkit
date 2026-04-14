import React from 'react';
import { DSRRequestForm } from '../components/dsr/DSRRequestForm';
import type { DSRRequestFormClassNames, DSRFormSubmission } from '../components/dsr/DSRRequestForm';
import type { RequestType } from '../types/dsr';
import type { StorageAdapter } from '../adapters/types';

const DEFAULT_REQUEST_TYPES: RequestType[] = [
  {
    id: 'access',
    name: 'Access My Data',
    description: 'Request a copy of your personal data held by us',
    ndpaSection: 'Section 30',
    estimatedCompletionTime: 30,
    requiresAdditionalInfo: false,
  },
  {
    id: 'rectification',
    name: 'Correct My Data',
    description: 'Request corrections to inaccurate personal data',
    ndpaSection: 'Section 31',
    estimatedCompletionTime: 30,
    requiresAdditionalInfo: true,
    additionalFields: [
      {
        id: 'correction_details',
        label: 'What data needs to be corrected?',
        type: 'textarea',
        required: true,
        placeholder: 'Please describe the inaccurate data and what the correct information should be',
      },
    ],
  },
  {
    id: 'erasure',
    name: 'Delete My Data',
    description: 'Request deletion of your personal data',
    ndpaSection: 'Section 32',
    estimatedCompletionTime: 30,
    requiresAdditionalInfo: false,
  },
  {
    id: 'portability',
    name: 'Export My Data',
    description: 'Receive your data in a portable format',
    ndpaSection: 'Section 34',
    estimatedCompletionTime: 30,
    requiresAdditionalInfo: false,
  },
  {
    id: 'restrict',
    name: 'Restrict Processing',
    description: 'Request restriction of data processing',
    ndpaSection: 'Section 33',
    estimatedCompletionTime: 30,
    requiresAdditionalInfo: false,
  },
  {
    id: 'object',
    name: 'Object to Processing',
    description: 'Object to processing of your personal data',
    ndpaSection: 'Section 35',
    estimatedCompletionTime: 30,
    requiresAdditionalInfo: false,
  },
];

export interface NDPRSubjectRightsProps {
  requestTypes?: RequestType[];
  adapter?: StorageAdapter<DSRFormSubmission>;
  classNames?: DSRRequestFormClassNames;
  unstyled?: boolean;
  onSubmit?: (data: DSRFormSubmission) => void;
}

export const NDPRSubjectRights: React.FC<NDPRSubjectRightsProps> = ({
  requestTypes = DEFAULT_REQUEST_TYPES,
  adapter,
  classNames,
  unstyled,
  onSubmit = () => {},
}) => {
  const handleSubmit = (data: DSRFormSubmission) => {
    if (adapter) adapter.save(data);
    onSubmit(data);
  };

  return (
    <DSRRequestForm
      requestTypes={requestTypes}
      onSubmit={handleSubmit}
      classNames={classNames}
      unstyled={unstyled}
    />
  );
};
