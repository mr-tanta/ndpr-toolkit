import React, { useMemo } from 'react';
import {
  CrossBorderTransfer,
  TransferMechanism,
  AdequacyStatus,
} from '../../types/cross-border';
import { resolveClass } from '../../utils/styling';

export interface CrossBorderTransferManagerLiteClassNames {
  root?: string;
  header?: string;
  title?: string;
  summary?: string;
  summaryCard?: string;
  table?: string;
  tableHeader?: string;
  tableRow?: string;
  statusBadge?: string;
  riskBadge?: string;
  riskAlert?: string;
}

export interface CrossBorderTransferManagerLiteProps {
  transfers: CrossBorderTransfer[];
  title?: string;
  description?: string;
  className?: string;
  classNames?: CrossBorderTransferManagerLiteClassNames;
  unstyled?: boolean;
  showSummary?: boolean;
  showRiskAlerts?: boolean;
  onTransferClick?: (transfer: CrossBorderTransfer) => void;
}

const MECHANISM_LABELS: Record<TransferMechanism, string> = {
  adequacy_decision: 'Adequacy Decision (Section 41)',
  standard_clauses: 'Standard Contractual Clauses (Section 42)',
  binding_corporate_rules: 'Binding Corporate Rules (Section 43)',
  ndpc_authorization: 'NDPC Authorization (Section 44)',
  explicit_consent: 'Explicit Consent (Section 45(a))',
  contract_performance: 'Contract Performance (Section 45(b))',
  public_interest: 'Public Interest (Section 45(c))',
  legal_claims: 'Legal Claims (Section 45(d))',
  vital_interests: 'Vital Interests (Section 45(e))',
};

const ADEQUACY_LABELS: Record<AdequacyStatus, string> = {
  adequate: 'Adequate',
  inadequate: 'Inadequate',
  pending_review: 'Pending Review',
  unknown: 'Unknown',
};

const STATUS_LABELS: Record<CrossBorderTransfer['status'], string> = {
  active: 'Active',
  suspended: 'Suspended',
  terminated: 'Terminated',
  pending_approval: 'Pending Approval',
};

const STATUS_CLASSES: Record<CrossBorderTransfer['status'], string> = {
  active: 'ndpr-badge ndpr-badge--success',
  suspended: 'ndpr-badge ndpr-badge--warning',
  terminated: 'ndpr-badge ndpr-badge--neutral',
  pending_approval: 'ndpr-badge ndpr-badge--info',
};

const RISK_CLASSES: Record<'low' | 'medium' | 'high', string> = {
  low: 'ndpr-badge ndpr-badge--success',
  medium: 'ndpr-badge ndpr-badge--warning',
  high: 'ndpr-badge ndpr-badge--destructive',
};

const NDPC_APPROVAL_MECHANISMS: ReadonlySet<TransferMechanism> = new Set<TransferMechanism>([
  'standard_clauses',
  'binding_corporate_rules',
  'ndpc_authorization',
]);

/**
 * Read-only, lightweight variant of {@link CrossBorderTransferManager}. Renders the
 * list + summary view without pulling in the full adequacy dataset, and exposes
 * no add/edit/delete affordances.
 */
export const CrossBorderTransferManagerLite: React.FC<CrossBorderTransferManagerLiteProps> = ({
  transfers,
  title = 'Cross-Border Data Transfer Manager',
  description = 'Manage and document cross-border personal data transfers in compliance with NDPA 2023 Part VIII (Sections 41-43).',
  className = '',
  classNames,
  unstyled,
  showSummary = true,
  showRiskAlerts = true,
  onTransferClick,
}) => {
  const sortedTransfers = useMemo(
    () => [...transfers].sort((a, b) => b.updatedAt - a.updatedAt),
    [transfers],
  );

  const summaryData = useMemo(() => {
    let totalActiveTransfers = 0;
    let pendingApproval = 0;
    let highRiskTransfers = 0;
    let missingTIA = 0;
    let ndpcApprovalRequired = 0;
    for (const t of transfers) {
      const isActive = t.status === 'active';
      if (isActive) totalActiveTransfers += 1;
      if (t.status === 'pending_approval' || (t.ndpcApproval?.required && !t.ndpcApproval?.approved)) pendingApproval += 1;
      if (t.riskLevel === 'high' && isActive) highRiskTransfers += 1;
      if (!t.tiaCompleted && isActive) missingTIA += 1;
      if (t.ndpcApproval?.required || NDPC_APPROVAL_MECHANISMS.has(t.transferMechanism)) ndpcApprovalRequired += 1;
    }
    return { totalActiveTransfers, pendingApproval, highRiskTransfers, missingTIA, ndpcApprovalRequired };
  }, [transfers]);

  const interactive = typeof onTransferClick === 'function';

  return (
    <div
      data-ndpr-component="cross-border-transfer-manager-lite"
      className={resolveClass(`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md ${className}`, classNames?.root, unstyled)}
    >
      <div className={resolveClass('', classNames?.header, unstyled)}>
        <h2 className={resolveClass('ndpr-section-heading', classNames?.title, unstyled)}>{title}</h2>
        <p className="ndpr-card__subtitle">{description}</p>
      </div>

      {showSummary && (
        <div
          role="status"
          aria-label="Transfer compliance summary"
          className={resolveClass('mb-6 grid grid-cols-2 md:grid-cols-4 gap-4', classNames?.summary, unstyled)}
        >
          {([
            ['info', summaryData.totalActiveTransfers, 'Active Transfers'],
            ['info', summaryData.pendingApproval, 'Pending Approval'],
            ['destructive', summaryData.highRiskTransfers, 'High Risk'],
            ['warning', summaryData.missingTIA, 'Missing TIA'],
          ] as const).map(([tone, value, label]) => (
            <div key={label} className={resolveClass(`ndpr-alert ndpr-alert--${tone}`, classNames?.summaryCard, unstyled)}>
              <p className={`ndpr-stat__value ndpr-text-${tone}`}>{value}</p>
              <p className={`text-sm ndpr-text-${tone}`}>{label}</p>
            </div>
          ))}
        </div>
      )}

      {showRiskAlerts && (summaryData.highRiskTransfers > 0 || summaryData.ndpcApprovalRequired > 0) && (
        <div role="alert" aria-label="Cross-border transfer risk alerts" className={resolveClass('mb-6 ndpr-alert ndpr-alert--warning', classNames?.riskAlert, unstyled)}>
          <p className="text-sm font-medium ndpr-text-warning mb-1">Risk alerts</p>
          <ul className="list-disc list-inside text-sm ndpr-text-warning">
            {summaryData.highRiskTransfers > 0 && (
              <li>{summaryData.highRiskTransfers} high-risk active transfer{summaryData.highRiskTransfers === 1 ? '' : 's'} require enhanced safeguards.</li>
            )}
            {summaryData.ndpcApprovalRequired > 0 && (
              <li>{summaryData.ndpcApprovalRequired} transfer{summaryData.ndpcApprovalRequired === 1 ? '' : 's'} use a mechanism that typically requires NDPC approval.</li>
            )}
          </ul>
        </div>
      )}

      <h3 className="text-lg font-medium mb-3">Transfers</h3>
      {sortedTransfers.length === 0 ? (
        <p className="ndpr-card__subtitle">No cross-border transfers found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table
            className={resolveClass('w-full text-left text-sm', classNames?.table, unstyled)}
            aria-label="Cross-border transfers"
          >
            <thead className={resolveClass('ndpr-text-muted', classNames?.tableHeader, unstyled)}>
              <tr>
                {['Destination', 'Recipient', 'Mechanism', 'Adequacy', 'Risk', 'Status'].map((h) => (
                  <th key={h} className="py-2 pr-4 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedTransfers.map((transfer) => {
                const handleActivate = interactive ? () => onTransferClick!(transfer) : undefined;
                return (
                  <tr
                    key={transfer.id}
                    className={resolveClass(
                      `border-t border-gray-100 dark:border-gray-700 ${
                        interactive ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : ''
                      }`,
                      classNames?.tableRow,
                      unstyled,
                    )}
                    role={interactive ? 'button' : undefined}
                    tabIndex={interactive ? 0 : undefined}
                    aria-label={interactive ? `View transfer to ${transfer.destinationCountry}` : undefined}
                    onClick={handleActivate}
                    onKeyDown={
                      interactive
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleActivate!();
                            }
                          }
                        : undefined
                    }
                  >
                    <td className="py-2 pr-4">
                      <div className="font-medium">{transfer.destinationCountry}</div>
                      {transfer.destinationCountryCode && (
                        <div className="text-xs ndpr-text-muted">{transfer.destinationCountryCode}</div>
                      )}
                    </td>
                    <td className="py-2 pr-4">{transfer.recipientOrganization}</td>
                    <td className="py-2 pr-4">{MECHANISM_LABELS[transfer.transferMechanism]}</td>
                    <td className="py-2 pr-4">{ADEQUACY_LABELS[transfer.adequacyStatus]}</td>
                    <td className="py-2 pr-4">
                      <span className={resolveClass(`px-2 py-1 rounded text-xs font-medium ${RISK_CLASSES[transfer.riskLevel]}`, classNames?.riskBadge, unstyled)}>
                        {transfer.riskLevel.charAt(0).toUpperCase() + transfer.riskLevel.slice(1)} Risk
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      <span className={resolveClass(`px-2 py-1 rounded text-xs font-medium ${STATUS_CLASSES[transfer.status]}`, classNames?.statusBadge, unstyled)}>
                        {STATUS_LABELS[transfer.status]}
                      </span>
                    </td>
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
