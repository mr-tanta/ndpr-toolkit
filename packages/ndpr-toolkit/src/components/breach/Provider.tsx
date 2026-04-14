import React from 'react';
import { useBreach } from '../../hooks/useBreach';
import { BreachCompoundContext } from './context';
import type { BreachCategory, BreachReport, RiskAssessment, RegulatoryNotification } from '../../types/breach';
import type { StorageAdapter } from '../../adapters/types';

export interface BreachProviderProps {
  categories: BreachCategory[];
  adapter?: StorageAdapter<{
    reports: BreachReport[];
    assessments: RiskAssessment[];
    notifications: RegulatoryNotification[];
  }>;
  storageKey?: string;
  useLocalStorage?: boolean;
  initialReports?: BreachReport[];
  onReport?: (report: BreachReport) => void;
  onAssessment?: (assessment: RiskAssessment) => void;
  onNotification?: (notification: RegulatoryNotification) => void;
  children: React.ReactNode;
}

export const BreachProvider: React.FC<BreachProviderProps> = ({
  categories,
  adapter,
  storageKey,
  useLocalStorage,
  initialReports,
  onReport,
  onAssessment,
  onNotification,
  children,
}) => {
  const breach = useBreach({
    categories,
    adapter,
    storageKey,
    useLocalStorage,
    initialReports,
    onReport,
    onAssessment,
    onNotification,
  });
  const value = { ...breach, categories };
  return (
    <BreachCompoundContext.Provider value={value}>
      {children}
    </BreachCompoundContext.Provider>
  );
};
