import React from 'react';
import { BreachReportForm } from '../components/breach/BreachReportForm';
import type { BreachReportFormClassNames, BreachFormSubmission } from '../components/breach/BreachReportForm';
import type { BreachCategory } from '../types/breach';
import type { StorageAdapter } from '../adapters/types';

const DEFAULT_CATEGORIES: BreachCategory[] = [
  {
    id: 'unauthorized_access',
    name: 'Unauthorized Access',
    description: 'Unauthorized access to personal data',
    defaultSeverity: 'high',
  },
  {
    id: 'data_loss',
    name: 'Data Loss',
    description: 'Loss of personal data',
    defaultSeverity: 'high',
  },
  {
    id: 'data_theft',
    name: 'Data Theft',
    description: 'Theft of personal data',
    defaultSeverity: 'critical',
  },
  {
    id: 'system_breach',
    name: 'System Breach',
    description: 'Breach of system containing personal data',
    defaultSeverity: 'critical',
  },
  {
    id: 'accidental_disclosure',
    name: 'Accidental Disclosure',
    description: 'Unintended disclosure of personal data',
    defaultSeverity: 'medium',
  },
];

export interface NDPRBreachReportProps {
  categories?: BreachCategory[];
  adapter?: StorageAdapter<BreachFormSubmission>;
  classNames?: BreachReportFormClassNames;
  unstyled?: boolean;
  onSubmit?: (data: BreachFormSubmission) => void;
}

export const NDPRBreachReport: React.FC<NDPRBreachReportProps> = ({
  categories = DEFAULT_CATEGORIES,
  adapter,
  classNames,
  unstyled,
  onSubmit = () => {},
}) => {
  const handleSubmit = (data: BreachFormSubmission) => {
    if (adapter) adapter.save(data);
    onSubmit(data);
  };

  return (
    <BreachReportForm
      categories={categories}
      onSubmit={handleSubmit}
      classNames={classNames}
      unstyled={unstyled}
    />
  );
};
