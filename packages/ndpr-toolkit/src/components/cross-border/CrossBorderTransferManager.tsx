import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CrossBorderTransfer,
  CrossBorderSummary,
  TransferMechanism,
  AdequacyStatus,
} from '../../types/cross-border';
import {
  validateTransfer,
  getTransferMechanismDescription,
  assessTransferRisk,
  isNDPCApprovalRequired,
  TransferValidationResult,
} from '../../utils/cross-border';
import { resolveClass } from '../../utils/styling';

export interface CrossBorderTransferManagerClassNames {
  root?: string;
  header?: string;
  title?: string;
  summary?: string;
  summaryCard?: string;
  transferList?: string;
  transferItem?: string;
  form?: string;
  input?: string;
  select?: string;
  submitButton?: string;
  /** Alias for submitButton */
  primaryButton?: string;
  riskBadge?: string;
  statusBadge?: string;
  detailPanel?: string;
  approvalStatus?: string;
}

export interface CrossBorderTransferManagerProps {
  /**
   * List of cross-border transfers to display
   */
  transfers: CrossBorderTransfer[];

  /**
   * Callback when a new transfer is added
   */
  onAddTransfer?: (transfer: Omit<CrossBorderTransfer, 'id' | 'createdAt' | 'updatedAt'>) => void;

  /**
   * Callback when a transfer is updated
   */
  onUpdateTransfer?: (id: string, updates: Partial<CrossBorderTransfer>) => void;

  /**
   * Callback when a transfer is removed
   */
  onRemoveTransfer?: (id: string) => void;

  /**
   * Compliance summary data
   */
  summary?: CrossBorderSummary;

  /**
   * Title displayed on the manager
   * @default "Cross-Border Data Transfer Manager"
   */
  title?: string;

  /**
   * Description text displayed on the manager
   * @default "Manage and document cross-border personal data transfers in compliance with NDPA 2023 Part VI (Sections 41-45)."
   */
  description?: string;

  /**
   * Custom CSS class for the manager container
   */
  className?: string;

  /**
   * Custom CSS class for buttons
   */
  buttonClassName?: string;

  /**
   * Whether to show the compliance summary section
   * @default true
   */
  showSummary?: boolean;

  /**
   * Whether to show the TIA section in the form
   * @default true
   */
  showTIA?: boolean;

  /**
   * Override class names for individual sections of the component.
   * Takes priority over className / buttonClassName.
   */
  classNames?: CrossBorderTransferManagerClassNames;

  /**
   * When true, all default styling is removed so consumers
   * can style from scratch using classNames.
   */
  unstyled?: boolean;
}

/**
 * All transfer mechanism options with section references for the dropdown
 */
const MECHANISM_OPTIONS: { value: TransferMechanism; label: string }[] = [
  { value: 'adequacy_decision', label: 'Adequacy Decision (Section 41)' },
  { value: 'standard_clauses', label: 'Standard Contractual Clauses (Section 42)' },
  { value: 'binding_corporate_rules', label: 'Binding Corporate Rules (Section 43)' },
  { value: 'ndpc_authorization', label: 'NDPC Authorization (Section 44)' },
  { value: 'explicit_consent', label: 'Explicit Consent (Section 45(a))' },
  { value: 'contract_performance', label: 'Contract Performance (Section 45(b))' },
  { value: 'public_interest', label: 'Public Interest (Section 45(c))' },
  { value: 'legal_claims', label: 'Legal Claims (Section 45(d))' },
  { value: 'vital_interests', label: 'Vital Interests (Section 45(e))' },
];

const ADEQUACY_OPTIONS: { value: AdequacyStatus; label: string }[] = [
  { value: 'adequate', label: 'Adequate' },
  { value: 'inadequate', label: 'Inadequate' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'unknown', label: 'Unknown' },
];

const FREQUENCY_OPTIONS = [
  { value: 'one_time', label: 'One-Time' },
  { value: 'periodic', label: 'Periodic' },
  { value: 'continuous', label: 'Continuous' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'terminated', label: 'Terminated' },
  { value: 'pending_approval', label: 'Pending Approval' },
];

interface TransferFormData {
  destinationCountry: string;
  destinationCountryCode: string;
  adequacyStatus: AdequacyStatus;
  transferMechanism: TransferMechanism;
  dataCategories: string;
  includesSensitiveData: boolean;
  estimatedDataSubjects: string;
  recipientOrganization: string;
  recipientContactName: string;
  recipientContactEmail: string;
  recipientContactPhone: string;
  recipientContactAddress: string;
  purpose: string;
  safeguards: string;
  riskAssessment: string;
  riskLevel: 'low' | 'medium' | 'high';
  frequency: 'one_time' | 'periodic' | 'continuous';
  status: 'active' | 'suspended' | 'terminated' | 'pending_approval';
  tiaCompleted: boolean;
  tiaReference: string;
  ndpcApprovalApplied: boolean;
  ndpcApprovalApproved: boolean;
  ndpcApprovalReference: string;
}

const INITIAL_FORM_DATA: TransferFormData = {
  destinationCountry: '',
  destinationCountryCode: '',
  adequacyStatus: 'unknown',
  transferMechanism: 'adequacy_decision',
  dataCategories: '',
  includesSensitiveData: false,
  estimatedDataSubjects: '',
  recipientOrganization: '',
  recipientContactName: '',
  recipientContactEmail: '',
  recipientContactPhone: '',
  recipientContactAddress: '',
  purpose: '',
  safeguards: '',
  riskAssessment: '',
  riskLevel: 'medium',
  frequency: 'one_time',
  status: 'active',
  tiaCompleted: false,
  tiaReference: '',
  ndpcApprovalApplied: false,
  ndpcApprovalApproved: false,
  ndpcApprovalReference: '',
};

/**
 * Cross-border data transfer management component. Implements NDPA Sections 41-45 requirements
 * for managing international data transfers, including adequacy decisions, standard contractual
 * clauses, and NDPC authorization.
 */
export const CrossBorderTransferManager: React.FC<CrossBorderTransferManagerProps> = ({
  transfers,
  onAddTransfer,
  onUpdateTransfer,
  onRemoveTransfer,
  summary,
  title = 'Cross-Border Data Transfer Manager',
  description = 'Manage and document cross-border personal data transfers in compliance with NDPA 2023 Part VI (Sections 41-45).',
  className = '',
  buttonClassName = '',
  showSummary = true,
  showTIA = true,
  classNames,
  unstyled,
}) => {
  const [selectedTransferId, setSelectedTransferId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransferId, setEditingTransferId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TransferFormData>(INITIAL_FORM_DATA);
  const [validationResult, setValidationResult] = useState<TransferValidationResult | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [mechanismFilter, setMechanismFilter] = useState<string>('all');

  // Filtered transfers – derived data, no need for separate state
  const filteredTransfers = useMemo(() => {
    let filtered = [...transfers];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    if (mechanismFilter !== 'all') {
      filtered = filtered.filter((t) => t.transferMechanism === mechanismFilter);
    }

    filtered.sort((a, b) => b.updatedAt - a.updatedAt);
    return filtered;
  }, [transfers, statusFilter, mechanismFilter]);

  // Select first transfer if none selected
  useEffect(() => {
    if (filteredTransfers.length > 0 && !selectedTransferId) {
      setSelectedTransferId(filteredTransfers[0].id);
    }
  }, [filteredTransfers, selectedTransferId]);

  const selectedTransfer = useMemo(
    () => (selectedTransferId ? transfers.find((t) => t.id === selectedTransferId) ?? null : null),
    [transfers, selectedTransferId],
  );

  const formatDate = useCallback((timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setEditingTransferId(null);
    setValidationResult(null);
  }, []);

  // Open form for adding
  const handleOpenAddForm = useCallback(() => {
    resetForm();
    setIsFormOpen(true);
  }, [resetForm]);

  // Open form for editing
  const handleOpenEditForm = useCallback((transfer: CrossBorderTransfer) => {
    setEditingTransferId(transfer.id);
    setFormData({
      destinationCountry: transfer.destinationCountry,
      destinationCountryCode: transfer.destinationCountryCode || '',
      adequacyStatus: transfer.adequacyStatus,
      transferMechanism: transfer.transferMechanism,
      dataCategories: transfer.dataCategories.join(', '),
      includesSensitiveData: transfer.includesSensitiveData,
      estimatedDataSubjects: transfer.estimatedDataSubjects?.toString() || '',
      recipientOrganization: transfer.recipientOrganization,
      recipientContactName: transfer.recipientContact.name,
      recipientContactEmail: transfer.recipientContact.email,
      recipientContactPhone: transfer.recipientContact.phone || '',
      recipientContactAddress: transfer.recipientContact.address || '',
      purpose: transfer.purpose,
      safeguards: transfer.safeguards.join('\n'),
      riskAssessment: transfer.riskAssessment,
      riskLevel: transfer.riskLevel,
      frequency: transfer.frequency,
      status: transfer.status,
      tiaCompleted: transfer.tiaCompleted,
      tiaReference: transfer.tiaReference || '',
      ndpcApprovalApplied: transfer.ndpcApproval?.applied || false,
      ndpcApprovalApproved: transfer.ndpcApproval?.approved || false,
      ndpcApprovalReference: transfer.ndpcApproval?.referenceNumber || '',
    });
    setIsFormOpen(true);
  }, []);

  // Handle form field changes
  const handleFieldChange = useCallback(
    (field: keyof TransferFormData, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  // Build transfer object from form data
  const buildTransferFromForm = useCallback((): Omit<CrossBorderTransfer, 'id' | 'createdAt' | 'updatedAt'> => {
    const needsApproval = isNDPCApprovalRequired(formData.transferMechanism);
    const now = Date.now();

    return {
      destinationCountry: formData.destinationCountry.trim(),
      destinationCountryCode: formData.destinationCountryCode.trim() || undefined,
      adequacyStatus: formData.adequacyStatus,
      transferMechanism: formData.transferMechanism,
      dataCategories: formData.dataCategories
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
      includesSensitiveData: formData.includesSensitiveData,
      estimatedDataSubjects: formData.estimatedDataSubjects
        ? parseInt(formData.estimatedDataSubjects, 10)
        : undefined,
      recipientOrganization: formData.recipientOrganization.trim(),
      recipientContact: {
        name: formData.recipientContactName.trim(),
        email: formData.recipientContactEmail.trim(),
        phone: formData.recipientContactPhone.trim() || undefined,
        address: formData.recipientContactAddress.trim() || undefined,
      },
      purpose: formData.purpose.trim(),
      safeguards: formData.safeguards
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      riskAssessment: formData.riskAssessment.trim(),
      riskLevel: formData.riskLevel,
      frequency: formData.frequency,
      status: needsApproval && !formData.ndpcApprovalApproved ? 'pending_approval' : formData.status,
      tiaCompleted: formData.tiaCompleted,
      tiaReference: formData.tiaReference.trim() || undefined,
      ndpcApproval: needsApproval
        ? {
            required: true,
            applied: formData.ndpcApprovalApplied,
            approved: formData.ndpcApprovalApproved || undefined,
            referenceNumber: formData.ndpcApprovalReference.trim() || undefined,
            appliedAt: formData.ndpcApprovalApplied ? now : undefined,
            approvedAt: formData.ndpcApprovalApproved ? now : undefined,
          }
        : undefined,
      startDate: now,
      reviewDate: now + 365 * 24 * 60 * 60 * 1000, // Default review in 1 year
    };
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(() => {
    const transferData = buildTransferFromForm();

    // Validate by constructing a temporary full object
    const tempTransfer: CrossBorderTransfer = {
      id: editingTransferId || 'temp',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...transferData,
    };

    const result = validateTransfer(tempTransfer);
    setValidationResult(result);

    if (!result.isValid) {
      return;
    }

    if (editingTransferId) {
      if (onUpdateTransfer) {
        onUpdateTransfer(editingTransferId, transferData);
      }
    } else {
      if (onAddTransfer) {
        onAddTransfer(transferData);
      }
    }

    resetForm();
    setIsFormOpen(false);
  }, [buildTransferFromForm, editingTransferId, onUpdateTransfer, onAddTransfer, resetForm]);

  // Handle cancel form
  const handleCancelForm = useCallback(() => {
    resetForm();
    setIsFormOpen(false);
  }, [resetForm]);

  // Handle remove
  const handleRemove = useCallback((id: string) => {
    if (onRemoveTransfer) {
      onRemoveTransfer(id);
    }
    if (selectedTransferId === id) {
      setSelectedTransferId(null);
    }
  }, [onRemoveTransfer, selectedTransferId]);

  // Render risk badge
  const renderRiskBadge = useCallback((riskLevel: 'low' | 'medium' | 'high') => {
    const colorClasses = {
      low: 'ndpr-badge ndpr-badge--success',
      medium: 'ndpr-badge ndpr-badge--warning',
      high: 'ndpr-badge ndpr-badge--destructive',
    };

    return (
      <span className={resolveClass(`px-2 py-1 rounded text-xs font-medium ${colorClasses[riskLevel]}`, classNames?.riskBadge, unstyled)}>
        {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
      </span>
    );
  }, [classNames?.riskBadge, unstyled]);

  // Render status badge
  const renderStatusBadge = useCallback((status: CrossBorderTransfer['status']) => {
    const colorClasses = {
      active: 'ndpr-badge ndpr-badge--success',
      suspended: 'ndpr-badge ndpr-badge--warning',
      terminated: 'ndpr-badge ndpr-badge--neutral',
      pending_approval: 'ndpr-badge ndpr-badge--info',
    };

    const labels = {
      active: 'Active',
      suspended: 'Suspended',
      terminated: 'Terminated',
      pending_approval: 'Pending Approval',
    };

    return (
      <span className={resolveClass(`px-2 py-1 rounded text-xs font-medium ${colorClasses[status]}`, classNames?.statusBadge, unstyled)}>
        {labels[status]}
      </span>
    );
  }, [classNames?.statusBadge, unstyled]);

  // Render mechanism badge
  const renderMechanismBadge = useCallback((mechanism: TransferMechanism) => {
    const approvalRequired = isNDPCApprovalRequired(mechanism);
    const label = MECHANISM_OPTIONS.find((o) => o.value === mechanism)?.label || mechanism;

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${
          approvalRequired
            ? 'ndpr-badge ndpr-badge--info'
            : 'ndpr-badge ndpr-badge--info'
        }`}
      >
        {label}
      </span>
    );
  }, []);

  // Memoize expensive summary stats
  const summaryData = useMemo(() => {
    return summary || {
      totalActiveTransfers: transfers.filter((t) => t.status === 'active').length,
      pendingApproval: transfers.filter(
        (t) => t.status === 'pending_approval' || (t.ndpcApproval?.required && !t.ndpcApproval?.approved)
      ),
      highRiskTransfers: transfers.filter((t) => t.riskLevel === 'high' && t.status === 'active'),
      missingTIA: transfers.filter((t) => !t.tiaCompleted && t.status === 'active'),
      byMechanism: {} as Record<TransferMechanism, number>,
      byAdequacy: {} as Record<AdequacyStatus, number>,
      dueForReview: [] as CrossBorderTransfer[],
      lastUpdated: Date.now(),
    };
  }, [summary, transfers]);

  // Render compliance summary
  const renderSummary = () => {
    return (
      <div data-ndpr-component="cross-border-transfer-manager" role="status" aria-label="Transfer compliance summary" className={resolveClass('mb-6 grid grid-cols-2 md:grid-cols-4 gap-4', classNames?.summary, unstyled)}>
        <div className={resolveClass('ndpr-alert ndpr-alert--info', classNames?.summaryCard, unstyled)}>
          <p className='ndpr-stat__value ndpr-text-info'>
            {summaryData.totalActiveTransfers}
          </p>
          <p className="text-sm ndpr-text-info">Active Transfers</p>
        </div>
        <div className={resolveClass('ndpr-alert ndpr-alert--info', classNames?.summaryCard, unstyled)}>
          <p className='ndpr-stat__value ndpr-text-info'>
            {summaryData.pendingApproval.length}
          </p>
          <p className="text-sm ndpr-text-info">Pending Approval</p>
        </div>
        <div className={resolveClass('ndpr-alert ndpr-alert--destructive', classNames?.summaryCard, unstyled)}>
          <p className='ndpr-stat__value ndpr-text-destructive'>
            {summaryData.highRiskTransfers.length}
          </p>
          <p className="text-sm ndpr-text-destructive">High Risk</p>
        </div>
        <div className={resolveClass('ndpr-alert ndpr-alert--warning', classNames?.summaryCard, unstyled)}>
          <p className='ndpr-stat__value ndpr-text-warning'>
            {summaryData.missingTIA.length}
          </p>
          <p className="text-sm ndpr-text-warning">Missing TIA</p>
        </div>
      </div>
    );
  };

  // Render the add/edit form
  const renderForm = () => {
    const needsApproval = isNDPCApprovalRequired(formData.transferMechanism);

    return (
      <div className={resolveClass('bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-6', classNames?.form, unstyled)}>
        <div className={resolveClass('flex justify-between items-center mb-4', classNames?.header, unstyled)}>
          <h3 className='ndpr-section-heading'>
            {editingTransferId ? 'Edit Transfer' : 'Add New Transfer'}
          </h3>
          <button
            onClick={handleCancelForm}
            aria-label="Cancel form"
            className="text-gray-600 hover:ndpr-text-muted dark:hover:text-gray-200"
          >
            Cancel
          </button>
        </div>

        {/* Validation errors */}
        {validationResult && !validationResult.isValid && (
          <div id="cb-form-errors" role="alert" className='ndpr-alert ndpr-alert--destructive'>
            <p className="text-sm font-medium ndpr-text-destructive mb-1">
              Please fix the following errors:
            </p>
            <ul className="list-disc list-inside text-sm ndpr-text-destructive">
              {validationResult.errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {validationResult && validationResult.warnings.length > 0 && (
          <div id="cb-form-warnings" role="alert" className='ndpr-alert ndpr-alert--warning'>
            <p className="text-sm font-medium ndpr-text-warning mb-1">Warnings:</p>
            <ul className="list-disc list-inside text-sm ndpr-text-warning">
              {validationResult.warnings.map((warning, i) => (
                <li key={i}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        <div className='ndpr-form-grid ndpr-form-grid--2'>
          {/* Destination Country */}
          <div>
            <label htmlFor="cb-destinationCountry" className='ndpr-form-field__label'>
              Destination Country <span className="ndpr-form-field__required">*</span>
            </label>
            <input
              id="cb-destinationCountry"
              type="text"
              value={formData.destinationCountry}
              onChange={(e) => handleFieldChange('destinationCountry', e.target.value)}
              placeholder="e.g. United Kingdom"
              aria-required="true"
              aria-describedby="cb-form-errors"
              aria-label="Destination country"
              className={resolveClass('ndpr-form-field__input', classNames?.input, unstyled)}
            />
          </div>

          {/* Country Code */}
          <div>
            <label htmlFor="cb-destinationCountryCode" className='ndpr-form-field__label'>Country Code (ISO)</label>
            <input
              id="cb-destinationCountryCode"
              type="text"
              value={formData.destinationCountryCode}
              onChange={(e) => handleFieldChange('destinationCountryCode', e.target.value)}
              placeholder="e.g. GB"
              maxLength={3}
              aria-label="Country code in ISO format"
              className={resolveClass('ndpr-form-field__input', classNames?.input, unstyled)}
            />
          </div>

          {/* Recipient Organization */}
          <div>
            <label htmlFor="cb-recipientOrganization" className='ndpr-form-field__label'>
              Recipient Organization <span className="ndpr-form-field__required">*</span>
            </label>
            <input
              id="cb-recipientOrganization"
              type="text"
              value={formData.recipientOrganization}
              onChange={(e) => handleFieldChange('recipientOrganization', e.target.value)}
              placeholder="Organization name"
              aria-required="true"
              aria-describedby="cb-form-errors"
              className={resolveClass('ndpr-form-field__input', classNames?.input, unstyled)}
            />
          </div>

          {/* Transfer Mechanism */}
          <div>
            <label htmlFor="cb-transferMechanism" className='ndpr-form-field__label'>
              Transfer Mechanism <span className="ndpr-form-field__required">*</span>
            </label>
            <select
              id="cb-transferMechanism"
              value={formData.transferMechanism}
              onChange={(e) =>
                handleFieldChange('transferMechanism', e.target.value)
              }
              aria-required="true"
              aria-describedby="cb-form-errors"
              className={resolveClass('ndpr-form-field__input', classNames?.select, unstyled)}
            >
              {MECHANISM_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Adequacy Status */}
          <div>
            <label htmlFor="cb-adequacyStatus" className='ndpr-form-field__label'>Adequacy Status</label>
            <select
              id="cb-adequacyStatus"
              value={formData.adequacyStatus}
              onChange={(e) => handleFieldChange('adequacyStatus', e.target.value)}
              aria-label="Select adequacy status of destination country"
              className={resolveClass('ndpr-form-field__input', classNames?.select, unstyled)}
            >
              {ADEQUACY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Level */}
          <div>
            <label className='ndpr-form-field__label'>Risk Level</label>
            <select
              value={formData.riskLevel}
              onChange={(e) => handleFieldChange('riskLevel', e.target.value)}
              className={resolveClass('ndpr-form-field__input', classNames?.select, unstyled)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Data Categories */}
          <div className="md:col-span-2">
            <label htmlFor="cb-dataCategories" className='ndpr-form-field__label'>
              Data Categories <span className="ndpr-form-field__required">*</span>
            </label>
            <input
              id="cb-dataCategories"
              type="text"
              value={formData.dataCategories}
              onChange={(e) => handleFieldChange('dataCategories', e.target.value)}
              placeholder="Comma-separated, e.g. Names, Email addresses, Phone numbers"
              aria-required="true"
              aria-describedby="cb-dataCategories-help"
              className={resolveClass('ndpr-form-field__input', classNames?.input, unstyled)}
            />
            <p id="cb-dataCategories-help" className="text-xs text-gray-500 mt-1">Separate categories with commas</p>
          </div>

          {/* Sensitive Data */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includesSensitiveData"
              checked={formData.includesSensitiveData}
              onChange={(e) => handleFieldChange('includesSensitiveData', e.target.checked)}
              className='ndpr-form-field__checkbox'
            />
            <label htmlFor="includesSensitiveData" className='ndpr-text-sm ndpr-font-medium'>
              Includes sensitive personal data
            </label>
          </div>

          {/* Estimated Data Subjects */}
          <div>
            <label className='ndpr-form-field__label'>Estimated Data Subjects</label>
            <input
              type="number"
              value={formData.estimatedDataSubjects}
              onChange={(e) => handleFieldChange('estimatedDataSubjects', e.target.value)}
              placeholder="Number of data subjects"
              className={resolveClass('ndpr-form-field__input', classNames?.input, unstyled)}
            />
          </div>

          {/* Recipient Contact Name */}
          <div>
            <label htmlFor="cb-recipientContactName" className='ndpr-form-field__label'>
              Recipient Contact Name <span className="ndpr-form-field__required">*</span>
            </label>
            <input
              id="cb-recipientContactName"
              type="text"
              value={formData.recipientContactName}
              onChange={(e) => handleFieldChange('recipientContactName', e.target.value)}
              placeholder="Contact person name"
              aria-required="true"
              aria-describedby="cb-form-errors"
              className={resolveClass('ndpr-form-field__input', classNames?.input, unstyled)}
            />
          </div>

          {/* Recipient Contact Email */}
          <div>
            <label htmlFor="cb-recipientContactEmail" className='ndpr-form-field__label'>
              Recipient Contact Email <span className="ndpr-form-field__required">*</span>
            </label>
            <input
              id="cb-recipientContactEmail"
              type="email"
              value={formData.recipientContactEmail}
              onChange={(e) => handleFieldChange('recipientContactEmail', e.target.value)}
              placeholder="contact@example.com"
              aria-required="true"
              aria-describedby="cb-form-errors"
              className={resolveClass('ndpr-form-field__input', classNames?.input, unstyled)}
            />
          </div>

          {/* Recipient Contact Phone */}
          <div>
            <label className='ndpr-form-field__label'>Recipient Contact Phone</label>
            <input
              type="text"
              value={formData.recipientContactPhone}
              onChange={(e) => handleFieldChange('recipientContactPhone', e.target.value)}
              placeholder="Phone number"
              className={resolveClass('ndpr-form-field__input', classNames?.input, unstyled)}
            />
          </div>

          {/* Recipient Contact Address */}
          <div>
            <label className='ndpr-form-field__label'>Recipient Contact Address</label>
            <input
              type="text"
              value={formData.recipientContactAddress}
              onChange={(e) => handleFieldChange('recipientContactAddress', e.target.value)}
              placeholder="Address"
              className={resolveClass('ndpr-form-field__input', classNames?.input, unstyled)}
            />
          </div>

          {/* Purpose */}
          <div className="md:col-span-2">
            <label htmlFor="cb-purpose" className='ndpr-form-field__label'>
              Purpose of Transfer <span className="ndpr-form-field__required">*</span>
            </label>
            <textarea
              id="cb-purpose"
              value={formData.purpose}
              onChange={(e) => handleFieldChange('purpose', e.target.value)}
              placeholder="Describe the purpose of this data transfer"
              rows={2}
              aria-required="true"
              aria-describedby="cb-form-errors"
              className={resolveClass('ndpr-form-field__input', classNames?.input, unstyled)}
            />
          </div>

          {/* Safeguards */}
          <div className="md:col-span-2">
            <label htmlFor="cb-safeguards" className='ndpr-form-field__label'>
              Safeguards <span className="ndpr-form-field__required">*</span>
            </label>
            <textarea
              id="cb-safeguards"
              value={formData.safeguards}
              onChange={(e) => handleFieldChange('safeguards', e.target.value)}
              placeholder="One safeguard per line, e.g.&#10;End-to-end encryption&#10;Access control policies&#10;Regular security audits"
              rows={3}
              aria-required="true"
              aria-describedby="cb-safeguards-help"
              className={resolveClass('ndpr-form-field__input', classNames?.input, unstyled)}
            />
            <p id="cb-safeguards-help" className="text-xs text-gray-500 mt-1">Enter one safeguard per line</p>
          </div>

          {/* Risk Assessment */}
          <div className="md:col-span-2">
            <label htmlFor="cb-riskAssessment" className='ndpr-form-field__label'>
              Risk Assessment Summary <span className="ndpr-form-field__required">*</span>
            </label>
            <textarea
              id="cb-riskAssessment"
              value={formData.riskAssessment}
              onChange={(e) => handleFieldChange('riskAssessment', e.target.value)}
              placeholder="Summarize the risk assessment for this transfer"
              rows={2}
              aria-required="true"
              aria-describedby="cb-form-errors"
              className={resolveClass('ndpr-form-field__input', classNames?.input, unstyled)}
            />
          </div>

          {/* Frequency */}
          <div>
            <label className='ndpr-form-field__label'>Transfer Frequency</label>
            <select
              value={formData.frequency}
              onChange={(e) => handleFieldChange('frequency', e.target.value)}
              className={resolveClass('ndpr-form-field__input', classNames?.select, unstyled)}
            >
              {FREQUENCY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className='ndpr-form-field__label'>Status</label>
            <select
              value={formData.status}
              onChange={(e) => handleFieldChange('status', e.target.value)}
              className={resolveClass('ndpr-form-field__input', classNames?.select, unstyled)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* NDPC Approval Section (conditional) */}
        {needsApproval && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <h4 className="text-sm font-medium ndpr-text-info mb-3">
              NDPC Approval Required
            </h4>
            <p className="text-xs ndpr-text-info mb-3">
              The selected transfer mechanism requires approval from the Nigeria Data Protection
              Commission.
            </p>
            <div className='ndpr-form-grid ndpr-form-grid--2'>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ndpcApprovalApplied"
                  checked={formData.ndpcApprovalApplied}
                  onChange={(e) => handleFieldChange('ndpcApprovalApplied', e.target.checked)}
                  className='ndpr-form-field__checkbox'
                />
                <label htmlFor="ndpcApprovalApplied" className='ndpr-text-sm'>
                  Application submitted
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ndpcApprovalApproved"
                  checked={formData.ndpcApprovalApproved}
                  onChange={(e) => handleFieldChange('ndpcApprovalApproved', e.target.checked)}
                  className='ndpr-form-field__checkbox'
                />
                <label htmlFor="ndpcApprovalApproved" className='ndpr-text-sm'>
                  Approval granted
                </label>
              </div>
              <div className="md:col-span-2">
                <label className='ndpr-form-field__label'>NDPC Reference Number</label>
                <input
                  type="text"
                  value={formData.ndpcApprovalReference}
                  onChange={(e) => handleFieldChange('ndpcApprovalReference', e.target.value)}
                  placeholder="Reference number (if available)"
                  className={resolveClass('ndpr-form-field__input', classNames?.input, unstyled)}
                />
              </div>
            </div>
          </div>
        )}

        {/* TIA Section */}
        {showTIA && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-600 rounded-md">
            <h4 className="text-sm font-medium mb-3">Transfer Impact Assessment</h4>
            <div className='ndpr-form-grid ndpr-form-grid--2'>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="tiaCompleted"
                  checked={formData.tiaCompleted}
                  onChange={(e) => handleFieldChange('tiaCompleted', e.target.checked)}
                  className='ndpr-form-field__checkbox'
                />
                <label htmlFor="tiaCompleted" className='ndpr-text-sm'>
                  TIA completed
                </label>
              </div>
              <div>
                <label className='ndpr-form-field__label'>TIA Reference</label>
                <input
                  type="text"
                  value={formData.tiaReference}
                  onChange={(e) => handleFieldChange('tiaReference', e.target.value)}
                  placeholder="Document reference"
                  className={resolveClass('ndpr-form-field__input', classNames?.input, unstyled)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={handleCancelForm}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={resolveClass(`px-4 py-2 bg-[rgb(var(--ndpr-primary))] text-white rounded-md hover:bg-[rgb(var(--ndpr-primary-hover))] ${buttonClassName}`, classNames?.primaryButton || classNames?.submitButton, unstyled)}
          >
            {editingTransferId ? 'Update Transfer' : 'Add Transfer'}
          </button>
        </div>
      </div>
    );
  };

  // Render transfer detail view
  const renderTransferDetail = (transfer: CrossBorderTransfer) => {
    const riskResult = assessTransferRisk(transfer);
    const validation = validateTransfer(transfer);

    return (
      <div role="status" aria-label="Transfer details" className={resolveClass('', classNames?.detailPanel, unstyled)}>
        <div className="flex justify-between items-start mb-4">
          <h3 className='ndpr-section-heading'>
            {transfer.destinationCountry} — {transfer.recipientOrganization}
          </h3>
          <div className="flex gap-2">
            {renderStatusBadge(transfer.status)}
            {renderRiskBadge(transfer.riskLevel)}
          </div>
        </div>

        {/* Validation warnings */}
        {!validation.isValid && (
          <div className='ndpr-alert ndpr-alert--destructive'>
            <p className="text-sm font-medium ndpr-text-destructive mb-1">
              Compliance Issues
            </p>
            <ul className="list-disc list-inside text-sm ndpr-text-destructive">
              {validation.errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {validation.warnings.length > 0 && (
          <div className='ndpr-alert ndpr-alert--warning'>
            <p className="text-sm font-medium ndpr-text-warning mb-1">Warnings</p>
            <ul className="list-disc list-inside text-sm ndpr-text-warning">
              {validation.warnings.map((warning, i) => (
                <li key={i}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Transfer Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className='ndpr-text-sm'>
              <span className="font-medium">Destination:</span> {transfer.destinationCountry}
              {transfer.destinationCountryCode ? ` (${transfer.destinationCountryCode})` : ''}
            </p>
            <p className='ndpr-text-sm'>
              <span className="font-medium">Adequacy:</span>{' '}
              {ADEQUACY_OPTIONS.find((o) => o.value === transfer.adequacyStatus)?.label}
            </p>
            <p className='ndpr-text-sm'>
              <span className="font-medium">Frequency:</span>{' '}
              {FREQUENCY_OPTIONS.find((o) => o.value === transfer.frequency)?.label}
            </p>
            <p className='ndpr-text-sm'>
              <span className="font-medium">Start Date:</span> {formatDate(transfer.startDate)}
            </p>
            {transfer.endDate && (
              <p className='ndpr-text-sm'>
                <span className="font-medium">End Date:</span> {formatDate(transfer.endDate)}
              </p>
            )}
            {transfer.reviewDate && (
              <p className='ndpr-text-sm'>
                <span className="font-medium">Next Review:</span> {formatDate(transfer.reviewDate)}
              </p>
            )}
          </div>
          <div>
            <p className='ndpr-text-sm'>
              <span className="font-medium">Recipient:</span> {transfer.recipientOrganization}
            </p>
            <p className='ndpr-text-sm'>
              <span className="font-medium">Contact:</span> {transfer.recipientContact.name} (
              {transfer.recipientContact.email})
            </p>
            {transfer.estimatedDataSubjects && (
              <p className='ndpr-text-sm'>
                <span className="font-medium">Data Subjects:</span>{' '}
                {transfer.estimatedDataSubjects.toLocaleString()}
              </p>
            )}
            <p className='ndpr-text-sm'>
              <span className="font-medium">Sensitive Data:</span>{' '}
              {transfer.includesSensitiveData ? 'Yes' : 'No'}
            </p>
          </div>
        </div>

        {/* Transfer Mechanism */}
        <div className='ndpr-form-field'>
          <p className='ndpr-form-field__label'>Transfer Mechanism</p>
          <div className='ndpr-panel'>
            <p className="text-sm text-gray-700 dark:text-gray-200">
              {getTransferMechanismDescription(transfer.transferMechanism)}
            </p>
          </div>
        </div>

        {/* Purpose */}
        <div className='ndpr-form-field'>
          <p className='ndpr-form-field__label'>Purpose</p>
          <p className="text-sm ndpr-text-muted bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
            {transfer.purpose}
          </p>
        </div>

        {/* Data Categories */}
        <div className='ndpr-form-field'>
          <p className='ndpr-form-field__label'>Data Categories</p>
          <div className="flex flex-wrap gap-1">
            {transfer.dataCategories.map((category, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded text-xs"
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        {/* Safeguards */}
        <div className='ndpr-form-field'>
          <p className='ndpr-form-field__label'>Safeguards</p>
          <ul className="list-disc list-inside text-sm ndpr-text-muted">
            {transfer.safeguards.map((safeguard, i) => (
              <li key={i}>{safeguard}</li>
            ))}
          </ul>
        </div>

        {/* Risk Assessment */}
        <div className='ndpr-form-field'>
          <p className='ndpr-form-field__label'>Risk Assessment</p>
          <div className='ndpr-panel'>
            <p className="text-sm text-gray-700 dark:text-gray-200 mb-2">
              {transfer.riskAssessment}
            </p>
            <div className="mt-2" role="status" aria-label="Automated risk assessment result">
              <p className="text-xs font-medium ndpr-text-muted mb-1">
                Automated Assessment (Score: {riskResult.riskScore})
              </p>
              {riskResult.factors.length > 0 && (
                <ul className="list-disc list-inside text-xs ndpr-text-muted">
                  {riskResult.factors.map((factor, i) => (
                    <li key={i}>{factor}</li>
                  ))}
                </ul>
              )}
              {riskResult.recommendations.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium ndpr-text-muted mb-1">
                    Recommendations:
                  </p>
                  <ul className="list-disc list-inside text-xs ndpr-text-muted">
                    {riskResult.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* NDPC Approval */}
        {transfer.ndpcApproval && (
          <div className='ndpr-form-field'>
            <p className='ndpr-form-field__label'>NDPC Approval</p>
            <div
              className={resolveClass(`p-3 rounded-md ${
                transfer.ndpcApproval.approved
                  ? 'ndpr-alert ndpr-alert--success'
                  : transfer.ndpcApproval.applied
                    ? 'ndpr-alert ndpr-alert--warning'
                    : 'ndpr-alert ndpr-alert--destructive'
              }`, classNames?.approvalStatus, unstyled)}
            >
              <p className='ndpr-text-sm'>
                <span className="font-medium">Status:</span>{' '}
                {transfer.ndpcApproval.approved
                  ? 'Approved'
                  : transfer.ndpcApproval.applied
                    ? 'Application Submitted'
                    : 'Not Applied'}
              </p>
              {transfer.ndpcApproval.referenceNumber && (
                <p className='ndpr-text-sm'>
                  <span className="font-medium">Reference:</span>{' '}
                  {transfer.ndpcApproval.referenceNumber}
                </p>
              )}
              {transfer.ndpcApproval.appliedAt && (
                <p className='ndpr-text-sm'>
                  <span className="font-medium">Applied:</span>{' '}
                  {formatDate(transfer.ndpcApproval.appliedAt)}
                </p>
              )}
              {transfer.ndpcApproval.approvedAt && (
                <p className='ndpr-text-sm'>
                  <span className="font-medium">Approved:</span>{' '}
                  {formatDate(transfer.ndpcApproval.approvedAt)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* TIA */}
        <div className='ndpr-form-field'>
          <p className='ndpr-form-field__label'>Transfer Impact Assessment</p>
          <div
            className={`p-3 rounded-md ${
              transfer.tiaCompleted
                ? 'ndpr-alert ndpr-alert--success'
                : 'ndpr-alert ndpr-alert--warning'
            }`}
          >
            <p className='ndpr-text-sm'>
              <span className="font-medium">Status:</span>{' '}
              {transfer.tiaCompleted ? 'Completed' : 'Not Completed'}
            </p>
            {transfer.tiaReference && (
              <p className='ndpr-text-sm'>
                <span className="font-medium">Reference:</span> {transfer.tiaReference}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => handleOpenEditForm(transfer)}
            aria-label={`Edit transfer to ${transfer.destinationCountry}`}
            className={`px-4 py-2 bg-[rgb(var(--ndpr-primary))] text-white rounded-md hover:bg-[rgb(var(--ndpr-primary-hover))] ${buttonClassName}`}
          >
            Edit
          </button>
          <button
            onClick={() => handleRemove(transfer.id)}
            aria-label={`Remove transfer to ${transfer.destinationCountry}`}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Remove
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={resolveClass(`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md ${className}`, classNames?.root, unstyled)}>
      <h2 className={resolveClass('ndpr-section-heading', classNames?.title, unstyled)}>{title}</h2>
      <p className='ndpr-card__subtitle'>{description}</p>

      {/* Compliance Summary */}
      {showSummary && renderSummary()}

      {/* Add Transfer Button */}
      {!isFormOpen && (
        <div className="mb-6">
          <button
            onClick={handleOpenAddForm}
            className={resolveClass(`px-4 py-2 bg-[rgb(var(--ndpr-primary))] text-white rounded-md hover:bg-[rgb(var(--ndpr-primary-hover))] ${buttonClassName}`, classNames?.primaryButton || classNames?.submitButton, unstyled)}
          >
            Add Transfer
          </button>
        </div>
      )}

      {/* Add/Edit Form */}
      {isFormOpen && renderForm()}

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="cbStatusFilter" className='ndpr-form-field__label'>
            Status Filter
          </label>
          <select
            id="cbStatusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter transfers by status"
            className={resolveClass('ndpr-form-field__input', classNames?.select, unstyled)}
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="cbMechanismFilter" className='ndpr-form-field__label'>
            Mechanism Filter
          </label>
          <select
            id="cbMechanismFilter"
            value={mechanismFilter}
            onChange={(e) => setMechanismFilter(e.target.value)}
            aria-label="Filter transfers by mechanism"
            className={resolveClass('ndpr-form-field__input', classNames?.select, unstyled)}
          >
            <option value="all">All Mechanisms</option>
            {MECHANISM_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transfer List and Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Transfer List */}
        <div className="md:col-span-1">
          <h3 className="text-lg font-medium mb-3">Transfers</h3>

          {filteredTransfers.length === 0 ? (
            <p className='ndpr-card__subtitle'>
              No cross-border transfers found.
            </p>
          ) : (
            <div className={resolveClass('space-y-2 max-h-96 overflow-y-auto pr-2', classNames?.transferList, unstyled)}>
              {filteredTransfers.map((transfer) => (
                <div
                  key={transfer.id}
                  className={resolveClass(`p-3 rounded-md cursor-pointer ${
                    selectedTransferId === transfer.id
                      ? 'ndpr-alert ndpr-alert--info'
                      : 'ndpr-panel'
                  }`, classNames?.transferItem, unstyled)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View transfer to ${transfer.destinationCountry}`}
                  onClick={() => setSelectedTransferId(transfer.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedTransferId(transfer.id); } }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-sm">{transfer.destinationCountry}</h4>
                    {renderRiskBadge(transfer.riskLevel)}
                  </div>
                  <p className="text-xs ndpr-text-muted mb-1">
                    {transfer.recipientOrganization}
                  </p>
                  <p className="text-xs ndpr-text-muted mb-1">
                    {renderMechanismBadge(transfer.transferMechanism)}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    {renderStatusBadge(transfer.status)}
                    {transfer.ndpcApproval?.required && !transfer.ndpcApproval?.approved && (
                      <span className="text-xs ndpr-text-info">
                        NDPC Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transfer Details */}
        <div className="md:col-span-2">
          {selectedTransfer ? (
            renderTransferDetail(selectedTransfer)
          ) : (
            <div className='ndpr-empty-state'>
              <p className='ndpr-card__subtitle'>
                Select a transfer to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
