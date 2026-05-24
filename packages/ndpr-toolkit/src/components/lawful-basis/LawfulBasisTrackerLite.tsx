import React, { useMemo } from 'react';
import { LawfulBasis, ProcessingActivity, LawfulBasisSummary } from '../../types/lawful-basis';
import { assessComplianceGaps, generateLawfulBasisSummary, LawfulBasisComplianceGap } from '../../utils/lawful-basis';
import { resolveClass } from '../../utils/styling';

export interface LawfulBasisTrackerLiteClassNames {
  root?: string;
  header?: string;
  title?: string;
  summary?: string;
  summaryCard?: string;
  table?: string;
  tableHeader?: string;
  tableRow?: string;
  statusBadge?: string;
  complianceScore?: string;
  gapAlert?: string;
}

export interface LawfulBasisTrackerLiteProps {
  activities: ProcessingActivity[];
  title?: string;
  description?: string;
  className?: string;
  classNames?: LawfulBasisTrackerLiteClassNames;
  unstyled?: boolean;
  showSummary?: boolean;
  showComplianceGaps?: boolean;
  onActivityClick?: (activity: ProcessingActivity) => void;
}

const BASIS_LABELS: Record<LawfulBasis, string> = {
  consent: 'Consent',
  contract: 'Contract',
  legal_obligation: 'Legal Obligation',
  vital_interests: 'Vital Interests',
  public_interest: 'Public Interest',
  legitimate_interests: 'Legitimate Interests',
};

const BASIS_BADGE_CLASSES: Record<LawfulBasis, string> = {
  consent: 'ndpr-badge ndpr-badge--info',
  contract: 'ndpr-badge ndpr-badge--info',
  legal_obligation: 'ndpr-badge ndpr-badge--info',
  vital_interests: 'ndpr-badge ndpr-badge--destructive',
  public_interest: 'ndpr-badge ndpr-badge--warning',
  legitimate_interests: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
};

const STATUS_LABELS: Record<ProcessingActivity['status'], string> = {
  active: 'Active',
  inactive: 'Inactive',
  under_review: 'Under Review',
  archived: 'Archived',
};

const STATUS_BADGE_CLASSES: Record<ProcessingActivity['status'], string> = {
  active: 'ndpr-badge ndpr-badge--success',
  inactive: 'ndpr-badge ndpr-badge--neutral',
  under_review: 'ndpr-badge ndpr-badge--warning',
  archived: 'ndpr-badge ndpr-badge--destructive',
};

const formatDate = (timestamp: number): string => new Date(timestamp).toLocaleDateString();

export const LawfulBasisTrackerLite: React.FC<LawfulBasisTrackerLiteProps> = ({
  activities,
  title = 'Lawful Basis Tracker',
  description = 'Document and track the lawful basis for each processing activity as required by NDPA 2023 Section 25.',
  className = '',
  classNames,
  unstyled,
  showSummary = true,
  showComplianceGaps = true,
  onActivityClick,
}) => {
  const sortedActivities = useMemo(() => [...activities].sort((a, b) => b.updatedAt - a.updatedAt), [activities]);
  const summary: LawfulBasisSummary = useMemo(() => generateLawfulBasisSummary(activities), [activities]);
  const complianceGaps: LawfulBasisComplianceGap[] = useMemo(() => assessComplianceGaps(activities), [activities]);
  const highSeverityGaps = useMemo(() => complianceGaps.filter(g => g.severity === 'high'), [complianceGaps]);
  const mediumSeverityGaps = useMemo(() => complianceGaps.filter(g => g.severity === 'medium'), [complianceGaps]);

  const renderStatusBadge = (status: ProcessingActivity['status']) => (
    <span className={resolveClass(`px-2 py-1 rounded text-xs font-medium ${STATUS_BADGE_CLASSES[status]}`, classNames?.statusBadge, unstyled)}>
      {STATUS_LABELS[status]}
    </span>
  );

  const renderBasisBadge = (basis: LawfulBasis) => (
    <span className={`px-2 py-1 rounded text-xs font-medium ${BASIS_BADGE_CLASSES[basis]}`}>
      {BASIS_LABELS[basis]}
    </span>
  );

  const renderApprovalIndicator = (activity: ProcessingActivity) => {
    if (!activity.dpoApproval) {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
          No DPO Review
        </span>
      );
    }
    if (activity.dpoApproval.approved) {
      return <span className="ndpr-badge ndpr-badge--success">Approved</span>;
    }
    return <span className="ndpr-badge ndpr-badge--warning">Pending Approval</span>;
  };

  const renderSummary = () => (
    <div data-ndpr-component="lawful-basis-tracker-lite" className={resolveClass('grid grid-cols-2 md:grid-cols-4 gap-4 mb-6', classNames?.summary, unstyled)} role="status" aria-label="Compliance summary">
      <div className={resolveClass('ndpr-alert ndpr-alert--info', classNames?.summaryCard, unstyled)}>
        <p className="ndpr-stat__value ndpr-text-info">{summary.totalActivities}</p>
        <p className="text-sm ndpr-text-info">Total Activities</p>
      </div>
      <div className={resolveClass('bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg', classNames?.summaryCard, unstyled)}>
        <p className="ndpr-stat__value ndpr-text-warning">{summary.sensitiveDataActivities}</p>
        <p className="text-sm ndpr-text-warning">Sensitive Data</p>
      </div>
      <div className={resolveClass('ndpr-alert ndpr-alert--info', classNames?.summaryCard, unstyled)}>
        <p className="ndpr-stat__value ndpr-text-info">{summary.crossBorderActivities}</p>
        <p className="text-sm ndpr-text-info">Cross-Border Transfers</p>
      </div>
      <div className={resolveClass('ndpr-alert ndpr-alert--destructive', classNames?.summaryCard, unstyled)}>
        <p className="ndpr-stat__value ndpr-text-destructive">{summary.activitiesWithoutApproval.length}</p>
        <p className="text-sm ndpr-text-destructive">Pending Approval</p>
      </div>
    </div>
  );

  const renderComplianceGaps = () => {
    if (complianceGaps.length === 0) {
      return (
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-6" role="status" aria-label="No compliance gaps">
          <p className="text-sm ndpr-text-success font-medium">No compliance gaps detected.</p>
          <p className="text-xs ndpr-text-success mt-1">All processing activities appear to be properly documented.</p>
        </div>
      );
    }

    return (
      <div className="mb-6" role="status" aria-label={`${complianceGaps.length} compliance gaps detected`}>
        {highSeverityGaps.length > 0 && (
          <div className={resolveClass('bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-3', classNames?.gapAlert, unstyled)}>
            <p className="text-sm ndpr-text-destructive font-medium mb-2">
              High Priority ({highSeverityGaps.length})
            </p>
            <ul className="space-y-1">
              {highSeverityGaps.map((gap, index) => (
                <li key={index} className="text-xs ndpr-text-destructive">
                  {gap.description}
                </li>
              ))}
            </ul>
          </div>
        )}
        {mediumSeverityGaps.length > 0 && (
          <div className={resolveClass('ndpr-alert ndpr-alert--warning', classNames?.gapAlert, unstyled)}>
            <p className="text-sm ndpr-text-warning font-medium mb-2">
              Medium Priority ({mediumSeverityGaps.length})
            </p>
            <ul className="space-y-1">
              {mediumSeverityGaps.map((gap, index) => (
                <li key={index} className="text-xs ndpr-text-warning">
                  {gap.description}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={resolveClass(`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md ${className}`, classNames?.root, unstyled)}>
      <div className={resolveClass('', classNames?.header, unstyled)}>
        <h2 className={resolveClass('ndpr-section-heading', classNames?.title, unstyled)}>{title}</h2>
        <p className="ndpr-card__subtitle">{description}</p>
      </div>

      {showSummary && renderSummary()}
      {showComplianceGaps && renderComplianceGaps()}

      {sortedActivities.length === 0 ? (
        <div className="flex items-center justify-center h-32 bg-gray-50 dark:bg-gray-700 rounded-md">
          <p className="ndpr-card__subtitle">No processing activities found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className={resolveClass('w-full text-sm text-left', classNames?.table, unstyled)}>
            <thead className={resolveClass('ndpr-table__head', classNames?.tableHeader, unstyled)}>
              <tr>
                <th className="ndpr-table__cell">Activity</th>
                <th className="ndpr-table__cell">Lawful Basis</th>
                <th className="ndpr-table__cell">Status</th>
                <th className="ndpr-table__cell">DPO Approval</th>
                <th className="ndpr-table__cell">Sensitive Data</th>
                <th className="ndpr-table__cell">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {sortedActivities.map(activity => {
                const interactive = typeof onActivityClick === 'function';
                const handleKey = interactive
                  ? (e: React.KeyboardEvent<HTMLTableRowElement>) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onActivityClick!(activity);
                      }
                    }
                  : undefined;
                return (
                  <tr
                    key={activity.id}
                    className={resolveClass(
                      `border-b border-gray-200 dark:border-gray-600${interactive ? ' hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer' : ''}`,
                      classNames?.tableRow,
                      unstyled
                    )}
                    onClick={interactive ? () => onActivityClick!(activity) : undefined}
                    onKeyDown={handleKey}
                    role={interactive ? 'button' : undefined}
                    tabIndex={interactive ? 0 : undefined}
                    aria-label={interactive ? `View ${activity.name}` : undefined}
                  >
                    <td className="ndpr-table__cell">
                      <span className="font-medium ndpr-text-primary">{activity.name}</span>
                      <p className="text-xs ndpr-text-muted mt-1 truncate max-w-xs">{activity.description}</p>
                    </td>
                    <td className="ndpr-table__cell">{renderBasisBadge(activity.lawfulBasis)}</td>
                    <td className="ndpr-table__cell">{renderStatusBadge(activity.status)}</td>
                    <td className="ndpr-table__cell">{renderApprovalIndicator(activity)}</td>
                    <td className="ndpr-table__cell">
                      <span className={`text-xs ${activity.involvesSensitiveData ? 'ndpr-text-warning font-medium' : 'ndpr-card__subtitle'}`}>
                        {activity.involvesSensitiveData ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="ndpr-table__cell ndpr-table__cell--muted">{formatDate(activity.updatedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
