import React, { useMemo } from 'react';
import type { LawfulBasis } from '../../types/lawful-basis';
import type { ProcessingRecord, RecordOfProcessingActivities } from '../../types/ropa';
import type { ROPAComplianceGap } from '../../utils/ropa';
import { generateROPASummary, identifyComplianceGaps } from '../../utils/ropa';
import { resolveClass } from '../../utils/styling';
import { useNDPRLocale } from '../NDPRProvider';

export interface ROPAManagerLiteClassNames {
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

export interface ROPAManagerLiteProps {
  /**
   * Full Record of Processing Activities — matches the full `ROPAManager` API.
   */
  ropa: RecordOfProcessingActivities;

  title?: string;
  description?: string;
  className?: string;
  classNames?: ROPAManagerLiteClassNames;
  unstyled?: boolean;
  showSummary?: boolean;
  showComplianceGaps?: boolean;
  onRecordClick?: (record: ProcessingRecord) => void;
}

const LAWFUL_BASIS_LABELS: Record<LawfulBasis, string> = {
  consent: 'Consent', contract: 'Contract', legal_obligation: 'Legal Obligation',
  vital_interests: 'Vital Interests', public_interest: 'Public Interest',
  legitimate_interests: 'Legitimate Interests',
};
const LAWFUL_BASIS_ORDER: LawfulBasis[] = [
  'consent', 'contract', 'legal_obligation', 'vital_interests', 'public_interest', 'legitimate_interests',
];
const STATUS_BADGE_CLASSES: Record<ProcessingRecord['status'], string> = {
  active: 'ndpr-badge ndpr-badge--success',
  inactive: 'ndpr-badge ndpr-badge--warning',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};
const STATUS_LABELS: Record<ProcessingRecord['status'], string> = {
  active: 'Active', inactive: 'Inactive', archived: 'Archived',
};

function formatDate(timestamp: number | undefined): string {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleDateString();
}

function isReviewOverdue(record: ProcessingRecord): boolean {
  return !!record.nextReviewDate && record.nextReviewDate <= Date.now();
}

export const ROPAManagerLite: React.FC<ROPAManagerLiteProps> = ({
  ropa,
  // i18n: explicit prop > provider locale > English default.
  title,
  description,
  className = '',
  classNames,
  unstyled,
  showSummary = true,
  showComplianceGaps = true,
  onRecordClick,
}) => {
  const locale = useNDPRLocale();
  const resolvedTitle = title ?? locale.ropa.title ?? 'Record of Processing Activities (ROPA)';
  const resolvedDescription =
    description ?? locale.ropa.description ??
    'Maintain a comprehensive record of all data processing activities as required by the NDPA accountability principle.';

  const resolvedRecords = ropa.records;
  const summary = useMemo(() => generateROPASummary(ropa), [ropa]);
  const complianceGaps = useMemo<ROPAComplianceGap[]>(
    () => identifyComplianceGaps(ropa),
    [ropa]
  );

  return (
    <div className={resolveClass(`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md ${className}`, classNames?.root, unstyled)}>
      <div className={resolveClass('', classNames?.header, unstyled)}>
        <h2 className={resolveClass('ndpr-section-heading', classNames?.title, unstyled)}>{resolvedTitle}</h2>
        <p className='ndpr-card__subtitle'>{resolvedDescription}</p>
      </div>

      {showSummary && (
        <div className={resolveClass('mb-6', classNames?.summary, unstyled)}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {([
              ['p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md text-center', 'ndpr-text-info', 'Total Records', summary.totalRecords, false],
              ['p-4 bg-green-50 dark:bg-green-900/20 rounded-md text-center', 'ndpr-text-success', 'Active', summary.activeRecords, false],
              ['p-4 bg-purple-50 dark:bg-purple-900/20 rounded-md text-center', 'ndpr-text-info', 'Cross-Border', summary.crossBorderRecords, false],
              ['p-4 bg-orange-50 dark:bg-orange-900/20 rounded-md text-center', 'ndpr-text-warning', 'Records with Gaps', complianceGaps.length, true],
            ] as Array<[string, string, string, number, boolean]>).map(([card, tone, label, value, isScore]) => (
              <div key={label} className={resolveClass(card, classNames?.summaryCard, unstyled)}>
                <p className={isScore
                  ? resolveClass(`ndpr-stat__value ${tone}`, classNames?.complianceScore, unstyled)
                  : `ndpr-stat__value ${tone}`}>{value}</p>
                <p className={`text-xs ${tone}`}>{label}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div className='ndpr-panel'>
              <p className='ndpr-form-field__label'>By Lawful Basis</p>
              {LAWFUL_BASIS_ORDER.map((basis) => (
                <div key={basis} className="flex justify-between text-xs mb-1">
                  <span className='ndpr-card__subtitle'>{LAWFUL_BASIS_LABELS[basis]}</span>
                  <span className="font-medium">{summary.byLawfulBasis[basis] || 0}</span>
                </div>
              ))}
            </div>
            <div className='ndpr-panel'>
              <p className='ndpr-form-field__label'>Risk Indicators</p>
              {([
                ['Sensitive Data', summary.sensitiveDataRecords, false],
                ['DPIA Required', summary.dpiaRequiredRecords, false],
                ['Automated Decisions', summary.automatedDecisionRecords, false],
                ['Due for Review', summary.recordsDueForReview.length, summary.recordsDueForReview.length > 0],
              ] as Array<[string, number, boolean]>).map(([label, value, danger]) => (
                <div key={label} className="flex justify-between text-xs mb-1">
                  <span className='ndpr-card__subtitle'>{label}</span>
                  <span className={`font-medium ${danger ? 'ndpr-text-destructive' : ''}`}>{value}</span>
                </div>
              ))}
            </div>
            {summary.topDepartments.length > 0 && (
              <div className='ndpr-panel'>
                <p className='ndpr-form-field__label'>Top Departments</p>
                {summary.topDepartments.slice(0, 5).map((dept) => (
                  <div key={dept.department} className="flex justify-between text-xs mb-1">
                    <span className='ndpr-card__subtitle'>{dept.department}</span>
                    <span className="font-medium">{dept.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showComplianceGaps && complianceGaps.length > 0 && (
        <div className={resolveClass('p-3 bg-red-50 dark:bg-red-900/20 rounded-md mb-6', classNames?.gapAlert, unstyled)} role="status" aria-live="polite">
          <p className="text-sm font-medium ndpr-text-destructive mb-2">Compliance Gaps Detected</p>
          {complianceGaps.slice(0, 5).map((gap) => (
            <div key={gap.recordId} className="mb-2">
              <p className="text-xs font-medium ndpr-text-destructive">{gap.recordName}</p>
              <ul className="list-disc list-inside">
                {gap.gaps.map((g, i) => (
                  <li key={i} className="text-xs ndpr-text-destructive">{g}</li>
                ))}
              </ul>
            </div>
          ))}
          {complianceGaps.length > 5 && (
            <p className="text-xs ndpr-text-destructive mt-1">
              ...and {complianceGaps.length - 5} more record(s) with gaps.
            </p>
          )}
        </div>
      )}

      {resolvedRecords.length === 0 ? (
        <p className='ndpr-empty-state'>No processing records found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className={resolveClass('w-full text-sm text-left', classNames?.table, unstyled)}>
            <thead className={resolveClass('ndpr-table__head', classNames?.tableHeader, unstyled)}>
              <tr>
                <th className='ndpr-table__cell'>Name</th>
                <th className='ndpr-table__cell'>Lawful Basis</th>
                <th className='ndpr-table__cell'>Data Categories</th>
                <th className='ndpr-table__cell'>Retention</th>
                <th className='ndpr-table__cell'>Status</th>
                <th className='ndpr-table__cell'>Last Reviewed</th>
              </tr>
            </thead>
            <tbody>
              {resolvedRecords.map((record) => {
                const overdue = isReviewOverdue(record);
                const hasGaps = complianceGaps.some((g) => g.recordId === record.id);
                const clickable = !!onRecordClick;
                return (
                  <tr
                    key={record.id}
                    onClick={clickable ? () => onRecordClick?.(record) : undefined}
                    role={clickable ? 'button' : undefined}
                    tabIndex={clickable ? 0 : undefined}
                    onKeyDown={clickable ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onRecordClick?.(record);
                      }
                    } : undefined}
                    className={resolveClass(`border-b dark:border-gray-600 ${
                      overdue ? 'bg-red-50 dark:bg-red-900/10'
                        : hasGaps ? 'bg-yellow-50 dark:bg-yellow-900/10'
                          : 'bg-white dark:bg-gray-800'
                    } ${clickable ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : ''}`, classNames?.tableRow, unstyled)}
                  >
                    <td className='ndpr-table__cell'>
                      <div>
                        <p className="font-medium">{record.name}</p>
                        {record.department && (
                          <p className='ndpr-form-field__hint'>{record.department}</p>
                        )}
                        {overdue && (
                          <span className="text-xs ndpr-text-destructive font-medium">Review Overdue</span>
                        )}
                      </div>
                    </td>
                    <td className='ndpr-table__cell'>
                      <span className='ndpr-badge ndpr-badge--info'>{LAWFUL_BASIS_LABELS[record.lawfulBasis]}</span>
                    </td>
                    <td className='ndpr-table__cell'>
                      <p className="text-xs ndpr-text-muted max-w-xs truncate">{record.dataCategories.join(', ')}</p>
                    </td>
                    <td className='ndpr-table__cell ndpr-table__cell--muted'>{record.retentionPeriod || 'N/A'}</td>
                    <td className='ndpr-table__cell'>
                      <span className={resolveClass(`px-2 py-1 rounded text-xs font-medium ${STATUS_BADGE_CLASSES[record.status]}`, classNames?.statusBadge, unstyled)}>
                        {STATUS_LABELS[record.status]}
                      </span>
                    </td>
                    <td className='ndpr-table__cell ndpr-table__cell--muted'>{formatDate(record.lastReviewedAt)}</td>
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
