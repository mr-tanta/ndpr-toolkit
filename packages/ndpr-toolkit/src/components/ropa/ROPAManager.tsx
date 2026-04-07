import React, { useState, useEffect, useMemo } from 'react';
import type { LawfulBasis } from '../../types/lawful-basis';
import type {
  ProcessingRecord,
  RecordOfProcessingActivities,
  ROPASummary,
} from '../../types/ropa';
import type { ROPAComplianceGap } from '../../utils/ropa';
import {
  validateProcessingRecord,
  generateROPASummary,
  exportROPAToCSV,
  identifyComplianceGaps,
} from '../../utils/ropa';
import { resolveClass } from '../../utils/styling';

export interface ROPAManagerClassNames {
  root?: string;
  header?: string;
  title?: string;
  orgInfo?: string;
  summary?: string;
  summaryCard?: string;
  table?: string;
  tableHeader?: string;
  tableRow?: string;
  form?: string;
  input?: string;
  select?: string;
  submitButton?: string;
  statusBadge?: string;
  exportButton?: string;
  complianceGap?: string;
}

export interface ROPAManagerProps {
  /**
   * The full Record of Processing Activities
   */
  ropa: RecordOfProcessingActivities;

  /**
   * Callback when a new record is added
   */
  onAddRecord?: (record: ProcessingRecord) => void;

  /**
   * Callback when a record is updated
   */
  onUpdateRecord?: (id: string, updates: Partial<ProcessingRecord>) => void;

  /**
   * Callback when a record is archived
   */
  onArchiveRecord?: (id: string) => void;

  /**
   * Title displayed on the manager
   * @default "Record of Processing Activities (ROPA)"
   */
  title?: string;

  /**
   * Description text
   * @default "Maintain a comprehensive record of all data processing activities as required by the NDPA 2023."
   */
  description?: string;

  /**
   * Custom CSS class
   */
  className?: string;

  /**
   * Custom CSS class for buttons
   */
  buttonClassName?: string;

  /**
   * Override class names for individual sections of the component.
   * Takes priority over className / buttonClassName.
   */
  classNames?: ROPAManagerClassNames;

  /**
   * When true, all default styling is removed so consumers
   * can style from scratch using classNames.
   */
  unstyled?: boolean;
}

const LAWFUL_BASIS_OPTIONS: Array<{ value: LawfulBasis; label: string }> = [
  { value: 'consent', label: 'Consent (Section 25(1)(a))' },
  { value: 'contract', label: 'Contract (Section 25(1)(b))' },
  { value: 'legal_obligation', label: 'Legal Obligation (Section 25(1)(c))' },
  { value: 'vital_interests', label: 'Vital Interests (Section 25(1)(d))' },
  { value: 'public_interest', label: 'Public Interest (Section 25(1)(e))' },
  { value: 'legitimate_interests', label: 'Legitimate Interests (Section 25(1)(f))' },
];

const STATUS_OPTIONS: Array<{ value: ProcessingRecord['status']; label: string }> = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'archived', label: 'Archived' },
];

const DATA_SOURCE_OPTIONS: Array<{ value: ProcessingRecord['dataSource']; label: string }> = [
  { value: 'data_subject', label: 'Directly from Data Subject' },
  { value: 'third_party', label: 'Third Party' },
  { value: 'public_source', label: 'Public Source' },
  { value: 'other', label: 'Other' },
];

type ViewMode = 'list' | 'form' | 'summary';

function createEmptyRecord(): ProcessingRecord {
  const now = Date.now();
  return {
    id: `proc_${now}_${Math.random().toString(36).substring(2, 11)}`,
    name: '',
    description: '',
    controllerDetails: { name: '', contact: '', address: '' },
    lawfulBasis: 'consent',
    lawfulBasisJustification: '',
    purposes: [],
    dataCategories: [],
    dataSubjectCategories: [],
    recipients: [],
    retentionPeriod: '',
    securityMeasures: [],
    dataSource: 'data_subject',
    dpiaRequired: false,
    automatedDecisionMaking: false,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
}

function formatDate(timestamp: number | undefined): string {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleDateString();
}

export const ROPAManager: React.FC<ROPAManagerProps> = ({
  ropa,
  onAddRecord,
  onUpdateRecord,
  onArchiveRecord,
  title = 'Record of Processing Activities (ROPA)',
  description = 'Maintain a comprehensive record of all data processing activities as required by the NDPA 2023.',
  className = '',
  buttonClassName = '',
  classNames,
  unstyled,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [basisFilter, setBasisFilter] = useState<string>('all');
  const [editingRecord, setEditingRecord] = useState<ProcessingRecord | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Temporary field values for comma-separated list inputs
  const [purposesInput, setPurposesInput] = useState('');
  const [dataCategoriesInput, setDataCategoriesInput] = useState('');
  const [sensitiveDataInput, setSensitiveDataInput] = useState('');
  const [subjectCategoriesInput, setSubjectCategoriesInput] = useState('');
  const [recipientsInput, setRecipientsInput] = useState('');
  const [securityMeasuresInput, setSecurityMeasuresInput] = useState('');
  const [systemsUsedInput, setSystemsUsedInput] = useState('');

  const summary = useMemo(() => generateROPASummary(ropa), [ropa]);
  const complianceGaps = useMemo(() => identifyComplianceGaps(ropa), [ropa]);

  // Filter records
  const filteredRecords = useMemo(() => {
    let filtered = [...ropa.records];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    if (basisFilter !== 'all') {
      filtered = filtered.filter((r) => r.lawfulBasis === basisFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(term) ||
          r.description.toLowerCase().includes(term) ||
          r.dataCategories.some((c) => c.toLowerCase().includes(term)) ||
          (r.department && r.department.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [ropa.records, statusFilter, basisFilter, searchTerm]);

  // Sync form inputs when editing record changes
  useEffect(() => {
    if (editingRecord) {
      setPurposesInput(editingRecord.purposes.join(', '));
      setDataCategoriesInput(editingRecord.dataCategories.join(', '));
      setSensitiveDataInput((editingRecord.sensitiveDataCategories || []).join(', '));
      setSubjectCategoriesInput(editingRecord.dataSubjectCategories.join(', '));
      setRecipientsInput(editingRecord.recipients.join(', '));
      setSecurityMeasuresInput(editingRecord.securityMeasures.join(', '));
      setSystemsUsedInput((editingRecord.systemsUsed || []).join(', '));
    }
  }, [editingRecord?.id]);

  const handleNewRecord = () => {
    const newRecord = createEmptyRecord();
    // Prefill controller details from the organization
    newRecord.controllerDetails.name = ropa.organizationName;
    newRecord.controllerDetails.contact = ropa.organizationContact;
    newRecord.controllerDetails.address = ropa.organizationAddress;
    if (ropa.ndpcRegistrationNumber) {
      newRecord.controllerDetails.registrationNumber = ropa.ndpcRegistrationNumber;
    }
    if (ropa.dpoDetails) {
      newRecord.controllerDetails.dpoContact = ropa.dpoDetails.email;
    }
    setEditingRecord(newRecord);
    setFormErrors([]);
    setViewMode('form');
  };

  const handleEditRecord = (record: ProcessingRecord) => {
    setEditingRecord({ ...record });
    setFormErrors([]);
    setViewMode('form');
  };

  const parseCommaSeparated = (value: string): string[] => {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  };

  const handleSaveRecord = () => {
    if (!editingRecord) return;

    // Apply comma-separated inputs to the record
    const recordToSave: ProcessingRecord = {
      ...editingRecord,
      purposes: parseCommaSeparated(purposesInput),
      dataCategories: parseCommaSeparated(dataCategoriesInput),
      sensitiveDataCategories: parseCommaSeparated(sensitiveDataInput),
      dataSubjectCategories: parseCommaSeparated(subjectCategoriesInput),
      recipients: parseCommaSeparated(recipientsInput),
      securityMeasures: parseCommaSeparated(securityMeasuresInput),
      systemsUsed: parseCommaSeparated(systemsUsedInput),
      updatedAt: Date.now(),
    };

    // Remove empty sensitive data categories
    if (
      recordToSave.sensitiveDataCategories &&
      recordToSave.sensitiveDataCategories.length === 0
    ) {
      recordToSave.sensitiveDataCategories = undefined;
    }

    // Remove empty systems used
    if (recordToSave.systemsUsed && recordToSave.systemsUsed.length === 0) {
      recordToSave.systemsUsed = undefined;
    }

    const validation = validateProcessingRecord(recordToSave);
    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    // Check if this is a new record or an update
    const existingRecord = ropa.records.find((r) => r.id === recordToSave.id);
    if (existingRecord) {
      onUpdateRecord?.(recordToSave.id, recordToSave);
    } else {
      onAddRecord?.(recordToSave);
    }

    setEditingRecord(null);
    setFormErrors([]);
    setViewMode('list');
  };

  const handleArchiveRecord = (id: string) => {
    onArchiveRecord?.(id);
  };

  const handleExportCSV = () => {
    const csv = exportROPAToCSV(ropa);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ropa_${ropa.organizationName.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const handleCancelForm = () => {
    setEditingRecord(null);
    setFormErrors([]);
    setViewMode('list');
  };

  const updateEditingField = (field: string, value: any) => {
    if (!editingRecord) return;
    setEditingRecord((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const updateControllerField = (field: string, value: string) => {
    if (!editingRecord) return;
    setEditingRecord((prev) =>
      prev
        ? {
            ...prev,
            controllerDetails: { ...prev.controllerDetails, [field]: value },
          }
        : prev
    );
  };

  const isReviewOverdue = (record: ProcessingRecord): boolean => {
    return !!record.nextReviewDate && record.nextReviewDate <= Date.now();
  };

  // Status badge rendering
  const renderStatusBadge = (status: ProcessingRecord['status']) => {
    const colorClasses: Record<ProcessingRecord['status'], string> = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      inactive: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      archived: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };

    const labels: Record<ProcessingRecord['status'], string> = {
      active: 'Active',
      inactive: 'Inactive',
      archived: 'Archived',
    };

    return (
      <span className={resolveClass(`px-2 py-1 rounded text-xs font-medium ${colorClasses[status]}`, classNames?.statusBadge, unstyled)}>
        {labels[status]}
      </span>
    );
  };

  // Lawful basis badge rendering
  const renderBasisBadge = (basis: LawfulBasis) => {
    const labels: Record<LawfulBasis, string> = {
      consent: 'Consent',
      contract: 'Contract',
      legal_obligation: 'Legal Obligation',
      vital_interests: 'Vital Interests',
      public_interest: 'Public Interest',
      legitimate_interests: 'Legitimate Interests',
    };

    return (
      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
        {labels[basis]}
      </span>
    );
  };

  // Render organization header
  const renderOrganizationHeader = () => (
    <div className={resolveClass('mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md', classNames?.orgInfo, unstyled)}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Organization</p>
          <p className="text-sm font-semibold">{ropa.organizationName}</p>
        </div>
        {ropa.dpoDetails && (
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Data Protection Officer
            </p>
            <p className="text-sm font-semibold">{ropa.dpoDetails.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{ropa.dpoDetails.email}</p>
          </div>
        )}
        {ropa.ndpcRegistrationNumber && (
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              NDPC Registration No.
            </p>
            <p className="text-sm font-semibold">{ropa.ndpcRegistrationNumber}</p>
          </div>
        )}
      </div>
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Version {ropa.version} | Last Updated: {formatDate(ropa.lastUpdated)}
      </div>
    </div>
  );

  // Render compliance summary dashboard
  const renderSummaryDashboard = () => (
    <div className={resolveClass('mb-6', classNames?.summary, unstyled)}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className={resolveClass('p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md text-center', classNames?.summaryCard, unstyled)}>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {summary.totalRecords}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400">Total Records</p>
        </div>
        <div className={resolveClass('p-4 bg-green-50 dark:bg-green-900/20 rounded-md text-center', classNames?.summaryCard, unstyled)}>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
            {summary.activeRecords}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400">Active</p>
        </div>
        <div className={resolveClass('p-4 bg-purple-50 dark:bg-purple-900/20 rounded-md text-center', classNames?.summaryCard, unstyled)}>
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
            {summary.crossBorderRecords}
          </p>
          <p className="text-xs text-purple-600 dark:text-purple-400">Cross-Border</p>
        </div>
        <div className={resolveClass('p-4 bg-orange-50 dark:bg-orange-900/20 rounded-md text-center', classNames?.summaryCard, unstyled)}>
          <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
            {complianceGaps.length}
          </p>
          <p className="text-xs text-orange-600 dark:text-orange-400">Records with Gaps</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
          <p className="text-sm font-medium mb-2">By Lawful Basis</p>
          {LAWFUL_BASIS_OPTIONS.map((option) => (
            <div key={option.value} className="flex justify-between text-xs mb-1">
              <span className="text-gray-600 dark:text-gray-400">{option.label.split(' (')[0]}</span>
              <span className="font-medium">{summary.byLawfulBasis[option.value] || 0}</span>
            </div>
          ))}
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
          <p className="text-sm font-medium mb-2">Risk Indicators</p>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600 dark:text-gray-400">Sensitive Data</span>
            <span className="font-medium">{summary.sensitiveDataRecords}</span>
          </div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600 dark:text-gray-400">DPIA Required</span>
            <span className="font-medium">{summary.dpiaRequiredRecords}</span>
          </div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600 dark:text-gray-400">Automated Decisions</span>
            <span className="font-medium">{summary.automatedDecisionRecords}</span>
          </div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600 dark:text-gray-400">Due for Review</span>
            <span className={`font-medium ${summary.recordsDueForReview.length > 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
              {summary.recordsDueForReview.length}
            </span>
          </div>
        </div>
        {summary.topDepartments.length > 0 && (
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
            <p className="text-sm font-medium mb-2">Top Departments</p>
            {summary.topDepartments.slice(0, 5).map((dept) => (
              <div key={dept.department} className="flex justify-between text-xs mb-1">
                <span className="text-gray-600 dark:text-gray-400">{dept.department}</span>
                <span className="font-medium">{dept.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {complianceGaps.length > 0 && (
        <div className={resolveClass('p-3 bg-red-50 dark:bg-red-900/20 rounded-md', classNames?.complianceGap, unstyled)}>
          <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
            Compliance Gaps Detected
          </p>
          {complianceGaps.slice(0, 5).map((gap) => (
            <div key={gap.recordId} className="mb-2">
              <p className="text-xs font-medium text-red-700 dark:text-red-300">{gap.recordName}</p>
              <ul className="list-disc list-inside">
                {gap.gaps.map((g, i) => (
                  <li key={i} className="text-xs text-red-600 dark:text-red-400">
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {complianceGaps.length > 5 && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              ...and {complianceGaps.length - 5} more record(s) with gaps.
            </p>
          )}
        </div>
      )}
    </div>
  );

  // Render the records table
  const renderRecordsTable = () => (
    <div>
      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="ropaSearch" className="block text-sm font-medium mb-1">
            Search
          </label>
          <input
            type="text"
            id="ropaSearch"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search records..."
            className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500', classNames?.input, unstyled)}
          />
        </div>
        <div>
          <label htmlFor="ropaStatusFilter" className="block text-sm font-medium mb-1">
            Status
          </label>
          <select
            id="ropaStatusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500', classNames?.select, unstyled)}
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ropaBasisFilter" className="block text-sm font-medium mb-1">
            Lawful Basis
          </label>
          <select
            id="ropaBasisFilter"
            value={basisFilter}
            onChange={(e) => setBasisFilter(e.target.value)}
            className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500', classNames?.select, unstyled)}
          >
            <option value="all">All Bases</option>
            {LAWFUL_BASIS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label.split(' (')[0]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end space-x-2">
          <button
            onClick={handleNewRecord}
            className={resolveClass(`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm ${buttonClassName}`, classNames?.submitButton, unstyled)}
          >
            Add Record
          </button>
          <button
            onClick={handleExportCSV}
            className={resolveClass(`px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm ${buttonClassName}`, classNames?.exportButton, unstyled)}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      {filteredRecords.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
          No processing records found.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className={resolveClass('w-full text-sm text-left', classNames?.table, unstyled)}>
            <thead className={resolveClass('text-xs uppercase bg-gray-50 dark:bg-gray-700', classNames?.tableHeader, unstyled)}>
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Lawful Basis</th>
                <th className="px-4 py-3">Data Categories</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Reviewed</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => {
                const overdue = isReviewOverdue(record);
                const hasGaps = complianceGaps.some((g) => g.recordId === record.id);

                return (
                  <tr
                    key={record.id}
                    className={resolveClass(`border-b dark:border-gray-600 ${
                      overdue
                        ? 'bg-red-50 dark:bg-red-900/10'
                        : hasGaps
                          ? 'bg-yellow-50 dark:bg-yellow-900/10'
                          : 'bg-white dark:bg-gray-800'
                    } hover:bg-gray-50 dark:hover:bg-gray-700`, classNames?.tableRow, unstyled)}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{record.name}</p>
                        {record.department && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {record.department}
                          </p>
                        )}
                        {overdue && (
                          <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                            Review Overdue
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">{renderBasisBadge(record.lawfulBasis)}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-600 dark:text-gray-300 max-w-xs truncate">
                        {record.dataCategories.join(', ')}
                      </p>
                    </td>
                    <td className="px-4 py-3">{renderStatusBadge(record.status)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(record.lastReviewedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditRecord(record)}
                          className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
                        >
                          Edit
                        </button>
                        {record.status !== 'archived' && (
                          <button
                            onClick={() => handleArchiveRecord(record.id)}
                            className="text-gray-600 dark:text-gray-400 hover:underline text-xs"
                          >
                            Archive
                          </button>
                        )}
                      </div>
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

  // Render the add/edit form
  const renderForm = () => {
    if (!editingRecord) return null;

    const isNew = !ropa.records.find((r) => r.id === editingRecord.id);

    return (
      <div className={resolveClass('', classNames?.form, unstyled)}>
        <div className={resolveClass('flex justify-between items-center mb-4', classNames?.header, unstyled)}>
          <h3 className="text-lg font-medium">
            {isNew ? 'Add Processing Record' : 'Edit Processing Record'}
          </h3>
          <button
            onClick={handleCancelForm}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
          >
            Cancel
          </button>
        </div>

        {formErrors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
            <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
              Please fix the following errors:
            </p>
            <ul className="list-disc list-inside">
              {formErrors.map((error, i) => (
                <li key={i} className="text-xs text-red-600 dark:text-red-400">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-6">
          {/* Basic Information */}
          <fieldset className="border border-gray-200 dark:border-gray-600 rounded-md p-4">
            <legend className="text-sm font-medium px-2">Basic Information</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="recordName" className="block text-sm font-medium mb-1">
                  Activity Name *
                </label>
                <input
                  type="text"
                  id="recordName"
                  value={editingRecord.name}
                  onChange={(e) => updateEditingField('name', e.target.value)}
                  className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500', classNames?.input, unstyled)}
                  placeholder="e.g., Customer Account Management"
                />
              </div>
              <div>
                <label htmlFor="recordDepartment" className="block text-sm font-medium mb-1">
                  Department
                </label>
                <input
                  type="text"
                  id="recordDepartment"
                  value={editingRecord.department || ''}
                  onChange={(e) => updateEditingField('department', e.target.value || undefined)}
                  className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500', classNames?.input, unstyled)}
                  placeholder="e.g., Marketing"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="recordDescription" className="block text-sm font-medium mb-1">
                  Description *
                </label>
                <textarea
                  id="recordDescription"
                  value={editingRecord.description}
                  onChange={(e) => updateEditingField('description', e.target.value)}
                  rows={3}
                  className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500', classNames?.input, unstyled)}
                  placeholder="Describe what personal data processing is performed..."
                />
              </div>
              <div>
                <label htmlFor="recordStatus" className="block text-sm font-medium mb-1">
                  Status *
                </label>
                <select
                  id="recordStatus"
                  value={editingRecord.status}
                  onChange={(e) =>
                    updateEditingField('status', e.target.value as ProcessingRecord['status'])
                  }
                  className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500', classNames?.select, unstyled)}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>

          {/* Controller Details */}
          <fieldset className="border border-gray-200 dark:border-gray-600 rounded-md p-4">
            <legend className="text-sm font-medium px-2">Controller Details</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="controllerName" className="block text-sm font-medium mb-1">
                  Controller Name *
                </label>
                <input
                  type="text"
                  id="controllerName"
                  value={editingRecord.controllerDetails.name}
                  onChange={(e) => updateControllerField('name', e.target.value)}
                  className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500', classNames?.input, unstyled)}
                />
              </div>
              <div>
                <label htmlFor="controllerContact" className="block text-sm font-medium mb-1">
                  Controller Contact *
                </label>
                <input
                  type="text"
                  id="controllerContact"
                  value={editingRecord.controllerDetails.contact}
                  onChange={(e) => updateControllerField('contact', e.target.value)}
                  className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500', classNames?.input, unstyled)}
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="controllerAddress" className="block text-sm font-medium mb-1">
                  Controller Address *
                </label>
                <input
                  type="text"
                  id="controllerAddress"
                  value={editingRecord.controllerDetails.address}
                  onChange={(e) => updateControllerField('address', e.target.value)}
                  className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500', classNames?.input, unstyled)}
                />
              </div>
            </div>
          </fieldset>

          {/* Lawful Basis */}
          <fieldset className="border border-gray-200 dark:border-gray-600 rounded-md p-4">
            <legend className="text-sm font-medium px-2">Lawful Basis (NDPA Section 25)</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="lawfulBasis" className="block text-sm font-medium mb-1">
                  Lawful Basis *
                </label>
                <select
                  id="lawfulBasis"
                  value={editingRecord.lawfulBasis}
                  onChange={(e) =>
                    updateEditingField('lawfulBasis', e.target.value as LawfulBasis)
                  }
                  className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500', classNames?.select, unstyled)}
                >
                  {LAWFUL_BASIS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="lawfulBasisJustification" className="block text-sm font-medium mb-1">
                  Justification *
                </label>
                <textarea
                  id="lawfulBasisJustification"
                  value={editingRecord.lawfulBasisJustification}
                  onChange={(e) =>
                    updateEditingField('lawfulBasisJustification', e.target.value)
                  }
                  rows={2}
                  className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500', classNames?.input, unstyled)}
                  placeholder="Explain why this lawful basis applies..."
                />
              </div>
            </div>
          </fieldset>

          {/* Data Details */}
          <fieldset className="border border-gray-200 dark:border-gray-600 rounded-md p-4">
            <legend className="text-sm font-medium px-2">Data Details</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="purposes" className="block text-sm font-medium mb-1">
                  Purposes * (comma-separated)
                </label>
                <input
                  type="text"
                  id="purposes"
                  value={purposesInput}
                  onChange={(e) => setPurposesInput(e.target.value)}
                  className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500', classNames?.input, unstyled)}
                  placeholder="e.g., Account management, Service delivery"
                />
              </div>
              <div>
                <label htmlFor="dataCategories" className="block text-sm font-medium mb-1">
                  Data Categories * (comma-separated)
                </label>
                <input
                  type="text"
                  id="dataCategories"
                  value={dataCategoriesInput}
                  onChange={(e) => setDataCategoriesInput(e.target.value)}
                  className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500', classNames?.input, unstyled)}
                  placeholder="e.g., Name, Email, Phone number"
                />
              </div>
              <div>
                <label htmlFor="sensitiveData" className="block text-sm font-medium mb-1">
                  Sensitive Data Categories (comma-separated)
                </label>
                <input
                  type="text"
                  id="sensitiveData"
                  value={sensitiveDataInput}
                  onChange={(e) => setSensitiveDataInput(e.target.value)}
                  className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500', classNames?.input, unstyled)}
                  placeholder="e.g., Health data, Biometric data"
                />
              </div>
              <div>
                <label htmlFor="subjectCategories" className="block text-sm font-medium mb-1">
                  Data Subject Categories * (comma-separated)
                </label>
                <input
                  type="text"
                  id="subjectCategories"
                  value={subjectCategoriesInput}
                  onChange={(e) => setSubjectCategoriesInput(e.target.value)}
                  className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500', classNames?.input, unstyled)}
                  placeholder="e.g., Customers, Employees"
                />
              </div>
              <div>
                <label htmlFor="recipients" className="block text-sm font-medium mb-1">
                  Recipients * (comma-separated)
                </label>
                <input
                  type="text"
                  id="recipients"
                  value={recipientsInput}
                  onChange={(e) => setRecipientsInput(e.target.value)}
                  className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500', classNames?.input, unstyled)}
                  placeholder="e.g., Payment processors, Cloud service providers"
                />
              </div>
              <div>
                <label htmlFor="dataSource" className="block text-sm font-medium mb-1">
                  Data Source *
                </label>
                <select
                  id="dataSource"
                  value={editingRecord.dataSource}
                  onChange={(e) =>
                    updateEditingField(
                      'dataSource',
                      e.target.value as ProcessingRecord['dataSource']
                    )
                  }
                  className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500', classNames?.select, unstyled)}
                >
                  {DATA_SOURCE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              {editingRecord.dataSource === 'third_party' && (
                <div className="md:col-span-2">
                  <label
                    htmlFor="thirdPartyDetails"
                    className="block text-sm font-medium mb-1"
                  >
                    Third-Party Source Details *
                  </label>
                  <input
                    type="text"
                    id="thirdPartyDetails"
                    value={editingRecord.thirdPartySourceDetails || ''}
                    onChange={(e) =>
                      updateEditingField('thirdPartySourceDetails', e.target.value || undefined)
                    }
                    className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500', classNames?.input, unstyled)}
                    placeholder="Describe the third-party data source..."
                  />
                </div>
              )}
            </div>
          </fieldset>

          {/* Retention and Security */}
          <fieldset className="border border-gray-200 dark:border-gray-600 rounded-md p-4">
            <legend className="text-sm font-medium px-2">Retention and Security</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="retentionPeriod" className="block text-sm font-medium mb-1">
                  Retention Period *
                </label>
                <input
                  type="text"
                  id="retentionPeriod"
                  value={editingRecord.retentionPeriod}
                  onChange={(e) => updateEditingField('retentionPeriod', e.target.value)}
                  className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500', classNames?.input, unstyled)}
                  placeholder="e.g., 5 years after account closure"
                />
              </div>
              <div>
                <label htmlFor="retentionJustification" className="block text-sm font-medium mb-1">
                  Retention Justification
                </label>
                <input
                  type="text"
                  id="retentionJustification"
                  value={editingRecord.retentionJustification || ''}
                  onChange={(e) =>
                    updateEditingField('retentionJustification', e.target.value || undefined)
                  }
                  className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500', classNames?.input, unstyled)}
                  placeholder="Why this retention period is necessary..."
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="securityMeasures" className="block text-sm font-medium mb-1">
                  Security Measures * (comma-separated)
                </label>
                <input
                  type="text"
                  id="securityMeasures"
                  value={securityMeasuresInput}
                  onChange={(e) => setSecurityMeasuresInput(e.target.value)}
                  className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500', classNames?.input, unstyled)}
                  placeholder="e.g., Encryption at rest, Access controls, Audit logging"
                />
              </div>
              <div>
                <label htmlFor="systemsUsed" className="block text-sm font-medium mb-1">
                  Systems Used (comma-separated)
                </label>
                <input
                  type="text"
                  id="systemsUsed"
                  value={systemsUsedInput}
                  onChange={(e) => setSystemsUsedInput(e.target.value)}
                  className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500', classNames?.input, unstyled)}
                  placeholder="e.g., CRM, ERP, Cloud Storage"
                />
              </div>
            </div>
          </fieldset>

          {/* Risk Indicators */}
          <fieldset className="border border-gray-200 dark:border-gray-600 rounded-md p-4">
            <legend className="text-sm font-medium px-2">Risk Indicators</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="dpiaRequired"
                  checked={editingRecord.dpiaRequired}
                  onChange={(e) => updateEditingField('dpiaRequired', e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <label htmlFor="dpiaRequired" className="text-sm font-medium">
                  DPIA Required
                </label>
              </div>
              {editingRecord.dpiaRequired && (
                <div>
                  <label htmlFor="dpiaReference" className="block text-sm font-medium mb-1">
                    DPIA Reference *
                  </label>
                  <input
                    type="text"
                    id="dpiaReference"
                    value={editingRecord.dpiaReference || ''}
                    onChange={(e) =>
                      updateEditingField('dpiaReference', e.target.value || undefined)
                    }
                    className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500', classNames?.input, unstyled)}
                    placeholder="Reference to the completed DPIA"
                  />
                </div>
              )}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="automatedDecisionMaking"
                  checked={editingRecord.automatedDecisionMaking}
                  onChange={(e) =>
                    updateEditingField('automatedDecisionMaking', e.target.checked)
                  }
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <label htmlFor="automatedDecisionMaking" className="text-sm font-medium">
                  Automated Decision-Making
                </label>
              </div>
              {editingRecord.automatedDecisionMaking && (
                <div>
                  <label
                    htmlFor="automatedDecisionMakingDetails"
                    className="block text-sm font-medium mb-1"
                  >
                    Automated Decision-Making Details *
                  </label>
                  <textarea
                    id="automatedDecisionMakingDetails"
                    value={editingRecord.automatedDecisionMakingDetails || ''}
                    onChange={(e) =>
                      updateEditingField(
                        'automatedDecisionMakingDetails',
                        e.target.value || undefined
                      )
                    }
                    rows={2}
                    className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500', classNames?.input, unstyled)}
                    placeholder="Describe the automated decision-making process..."
                  />
                </div>
              )}
            </div>
          </fieldset>

          {/* Review Schedule */}
          <fieldset className="border border-gray-200 dark:border-gray-600 rounded-md p-4">
            <legend className="text-sm font-medium px-2">Review Schedule</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nextReviewDate" className="block text-sm font-medium mb-1">
                  Next Review Date
                </label>
                <input
                  type="date"
                  id="nextReviewDate"
                  value={
                    editingRecord.nextReviewDate
                      ? new Date(editingRecord.nextReviewDate).toISOString().slice(0, 10)
                      : ''
                  }
                  onChange={(e) =>
                    updateEditingField(
                      'nextReviewDate',
                      e.target.value ? new Date(e.target.value).getTime() : undefined
                    )
                  }
                  className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500', classNames?.input, unstyled)}
                />
              </div>
            </div>
          </fieldset>

          {/* Save / Cancel */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancelForm}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveRecord}
              className={resolveClass(`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm ${buttonClassName}`, classNames?.submitButton, unstyled)}
            >
              {isNew ? 'Add Record' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // View mode tabs
  const renderViewTabs = () => (
    <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-600">
      <button
        onClick={() => setViewMode('list')}
        className={`pb-2 text-sm font-medium ${
          viewMode === 'list'
            ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
      >
        Processing Records
      </button>
      <button
        onClick={() => setViewMode('summary')}
        className={`pb-2 text-sm font-medium ${
          viewMode === 'summary'
            ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
      >
        Compliance Summary
      </button>
    </div>
  );

  return (
    <div className={resolveClass(`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md ${className}`, classNames?.root, unstyled)}>
      <h2 className={resolveClass('text-xl font-bold mb-2', classNames?.title, unstyled)}>{title}</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-300">{description}</p>

      {renderOrganizationHeader()}

      {viewMode !== 'form' && renderViewTabs()}

      {viewMode === 'list' && renderRecordsTable()}
      {viewMode === 'summary' && renderSummaryDashboard()}
      {viewMode === 'form' && renderForm()}
    </div>
  );
};
