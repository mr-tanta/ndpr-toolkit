import React from 'react';
import { NDPRDashboard as Dashboard } from '../components/dashboard/NDPRDashboard';
import { getComplianceScore } from '../utils/compliance-score';
import type { ComplianceInput } from '../utils/compliance-score';
import type { NDPRDashboardClassNames } from '../components/dashboard/NDPRDashboard';

export interface NDPRDashboardPresetProps {
  /** Raw compliance input — the preset calls getComplianceScore() internally */
  input: ComplianceInput;
  /** Dashboard heading. Defaults to "NDPA Compliance Dashboard" */
  title?: string;
  /** Show/hide the recommendations section. Defaults to true */
  showRecommendations?: boolean;
  /** Maximum number of recommendations to render. Defaults to 5 */
  maxRecommendations?: number;
  /** Per-section class name overrides */
  classNames?: NDPRDashboardClassNames;
  /** When true, strips all default classes so consumers can style from scratch */
  unstyled?: boolean;
}

/**
 * Preset wrapper for NDPRDashboard.
 *
 * Accepts raw ComplianceInput, computes the report via getComplianceScore(),
 * and delegates rendering to the NDPRDashboard component.
 */
export const NDPRDashboard: React.FC<NDPRDashboardPresetProps> = ({ input, ...rest }) => {
  const report = getComplianceScore(input);
  return <Dashboard report={report} {...rest} />;
};
