import React, { useState, useEffect } from 'react';
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
}) => {
  const [selectedTransferId, setSelectedTransferId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransferId, setEditingTransferId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TransferFormData>(INITIAL_FORM_DATA);
  const [validationResult, setValidationResult] = useState<TransferValidationResult | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [mechanismFilter, setMechanismFilter] = useState<string>('all');

  // Filtered transfers
  const [filteredTransfers, setFilteredTransfers] = useState<CrossBorderTransfer[]>(transfers);

  useEffect(() => {
    let filtered = [...transfers];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    if (mechanismFilter !== 'all') {
      filtered = filtered.filter((t) => t.transferMechanism === mechanismFilter);
    }

    filtered.sort((a, b) => b.updatedAt - a.updatedAt);
    setFilteredTransfers(filtered);
  }, [transfers, statusFilter, mechanismFilter]);

  // Select first transfer if none selected
  useEffect(() => {
    if (filteredTransfers.length > 0 && !selectedTransferId) {
      setSelectedTransferId(filteredTransfers[0].id);
    }
  }, [filteredTransfers, selectedTransferId]);

  const selectedTransfer = selectedTransferId
    ? transfers.find((t) => t.id === selectedTransferId)
    : null;

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
  };

  // Reset form
  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setEditingTransferId(null);
    setValidationResult(null);
  };

  // Open form for adding
  const handleOpenAddForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  // Open form for editing
  const handleOpenEditForm = (transfer: CrossBorderTransfer) => {
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
  };

  // Handle form field changes
  const handleFieldChange = (
    field: keyof TransferFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Build transfer object from form data
  const buildTransferFromForm = (): Omit<CrossBorderTransfer, 'id' | 'createdAt' | 'updatedAt'> => {
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
  };

  // Handle form submission
  const handleSubmit = () => {
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
  };

  // Handle remove
  const handleRemove = (id: string) => {
    if (onRemoveTransfer) {
      onRemoveTransfer(id);
    }
    if (selectedTransferId === id) {
      setSelectedTransferId(null);
    }
  };

  // Render risk badge
  const renderRiskBadge = (riskLevel: 'low' | 'medium' | 'high') => {
    const colorClasses = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colorClasses[riskLevel]}`}>
        {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
      </span>
    );
  };

  // Render status badge
  const renderStatusBadge = (status: CrossBorderTransfer['status']) => {
    const colorClasses = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      suspended: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      terminated: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      pending_approval: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    };

    const labels = {
      active: 'Active',
      suspended: 'Suspended',
      terminated: 'Terminated',
      pending_approval: 'Pending Approval',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colorClasses[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // Render mechanism badge
  const renderMechanismBadge = (mechanism: TransferMechanism) => {
    const approvalRequired = isNDPCApprovalRequired(mechanism);
    const label = MECHANISM_OPTIONS.find((o) => o.value === mechanism)?.label || mechanism;

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${
          approvalRequired
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            : 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
        }`}
      >
        {label}
      </span>
    );
  };

  // Render compliance summary
  const renderSummary = () => {
    const summaryData = summary || {
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

    return (
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
            {summaryData.totalActiveTransfers}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-300">Active Transfers</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
            {summaryData.pendingApproval.length}
          </p>
          <p className="text-sm text-purple-600 dark:text-purple-300">Pending Approval</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <p className="text-2xl font-bold text-red-800 dark:text-red-200">
            {summaryData.highRiskTransfers.length}
          </p>
          <p className="text-sm text-red-600 dark:text-red-300">High Risk</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
            {summaryData.missingTIA.length}
          </p>
          <p className="text-sm text-yellow-600 dark:text-yellow-300">Missing TIA</p>
        </div>
      </div>
    );
  };

  // Render the add/edit form
  const renderForm = () => {
    const needsApproval = isNDPCApprovalRequired(formData.transferMechanism);

    return (
      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            {editingTransferId ? 'Edit Transfer' : 'Add New Transfer'}
          </h3>
          <button
            onClick={() => {
              resetForm();
              setIsFormOpen(false);
            }}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Cancel
          </button>
        </div>

        {/* Validation errors */}
        {validationResult && !validationResult.isValid && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
            <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
              Please fix the following errors:
            </p>
            <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300">
              {validationResult.errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {validationResult && validationResult.warnings.length > 0 && (
          <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">Warnings:</p>
            <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300">
              {validationResult.warnings.map((warning, i) => (
                <li key={i}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Destination Country */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Destination Country <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.destinationCountry}
              onChange={(e) => handleFieldChange('destinationCountry', e.target.value)}
              placeholder="e.g. United Kingdom"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Country Code */}
          <div>
            <label className="block text-sm font-medium mb-1">Country Code (ISO)</label>
            <input
              type="text"
              value={formData.destinationCountryCode}
              onChange={(e) => handleFieldChange('destinationCountryCode', e.target.value)}
              placeholder="e.g. GB"
              maxLength={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Recipient Organization */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Recipient Organization <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.recipientOrganization}
              onChange={(e) => handleFieldChange('recipientOrganization', e.target.value)}
              placeholder="Organization name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Transfer Mechanism */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Transfer Mechanism <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.transferMechanism}
              onChange={(e) =>
                handleFieldChange('transferMechanism', e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium mb-1">Adequacy Status</label>
            <select
              value={formData.adequacyStatus}
              onChange={(e) => handleFieldChange('adequacyStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium mb-1">Risk Level</label>
            <select
              value={formData.riskLevel}
              onChange={(e) => handleFieldChange('riskLevel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Data Categories */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Data Categories <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.dataCategories}
              onChange={(e) => handleFieldChange('dataCategories', e.target.value)}
              placeholder="Comma-separated, e.g. Names, Email addresses, Phone numbers"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Sensitive Data */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includesSensitiveData"
              checked={formData.includesSensitiveData}
              onChange={(e) => handleFieldChange('includesSensitiveData', e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="includesSensitiveData" className="text-sm font-medium">
              Includes sensitive personal data
            </label>
          </div>

          {/* Estimated Data Subjects */}
          <div>
            <label className="block text-sm font-medium mb-1">Estimated Data Subjects</label>
            <input
              type="number"
              value={formData.estimatedDataSubjects}
              onChange={(e) => handleFieldChange('estimatedDataSubjects', e.target.value)}
              placeholder="Number of data subjects"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Recipient Contact Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Recipient Contact Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.recipientContactName}
              onChange={(e) => handleFieldChange('recipientContactName', e.target.value)}
              placeholder="Contact person name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Recipient Contact Email */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Recipient Contact Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.recipientContactEmail}
              onChange={(e) => handleFieldChange('recipientContactEmail', e.target.value)}
              placeholder="contact@example.com"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Recipient Contact Phone */}
          <div>
            <label className="block text-sm font-medium mb-1">Recipient Contact Phone</label>
            <input
              type="text"
              value={formData.recipientContactPhone}
              onChange={(e) => handleFieldChange('recipientContactPhone', e.target.value)}
              placeholder="Phone number"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Recipient Contact Address */}
          <div>
            <label className="block text-sm font-medium mb-1">Recipient Contact Address</label>
            <input
              type="text"
              value={formData.recipientContactAddress}
              onChange={(e) => handleFieldChange('recipientContactAddress', e.target.value)}
              placeholder="Address"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Purpose */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Purpose of Transfer <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.purpose}
              onChange={(e) => handleFieldChange('purpose', e.target.value)}
              placeholder="Describe the purpose of this data transfer"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Safeguards */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Safeguards <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.safeguards}
              onChange={(e) => handleFieldChange('safeguards', e.target.value)}
              placeholder="One safeguard per line, e.g.&#10;End-to-end encryption&#10;Access control policies&#10;Regular security audits"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Risk Assessment */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Risk Assessment Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.riskAssessment}
              onChange={(e) => handleFieldChange('riskAssessment', e.target.value)}
              placeholder="Summarize the risk assessment for this transfer"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium mb-1">Transfer Frequency</label>
            <select
              value={formData.frequency}
              onChange={(e) => handleFieldChange('frequency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => handleFieldChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-3">
              NDPC Approval Required
            </h4>
            <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
              The selected transfer mechanism requires approval from the Nigeria Data Protection
              Commission.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ndpcApprovalApplied"
                  checked={formData.ndpcApprovalApplied}
                  onChange={(e) => handleFieldChange('ndpcApprovalApplied', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="ndpcApprovalApplied" className="text-sm">
                  Application submitted
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ndpcApprovalApproved"
                  checked={formData.ndpcApprovalApproved}
                  onChange={(e) => handleFieldChange('ndpcApprovalApproved', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="ndpcApprovalApproved" className="text-sm">
                  Approval granted
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">NDPC Reference Number</label>
                <input
                  type="text"
                  value={formData.ndpcApprovalReference}
                  onChange={(e) => handleFieldChange('ndpcApprovalReference', e.target.value)}
                  placeholder="Reference number (if available)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TIA Section */}
        {showTIA && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-600 rounded-md">
            <h4 className="text-sm font-medium mb-3">Transfer Impact Assessment</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="tiaCompleted"
                  checked={formData.tiaCompleted}
                  onChange={(e) => handleFieldChange('tiaCompleted', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="tiaCompleted" className="text-sm">
                  TIA completed
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">TIA Reference</label>
                <input
                  type="text"
                  value={formData.tiaReference}
                  onChange={(e) => handleFieldChange('tiaReference', e.target.value)}
                  placeholder="Document reference"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={() => {
              resetForm();
              setIsFormOpen(false);
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${buttonClassName}`}
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
      <div>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-medium">
            {transfer.destinationCountry} — {transfer.recipientOrganization}
          </h3>
          <div className="flex gap-2">
            {renderStatusBadge(transfer.status)}
            {renderRiskBadge(transfer.riskLevel)}
          </div>
        </div>

        {/* Validation warnings */}
        {!validation.isValid && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
            <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
              Compliance Issues
            </p>
            <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300">
              {validation.errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {validation.warnings.length > 0 && (
          <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">Warnings</p>
            <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300">
              {validation.warnings.map((warning, i) => (
                <li key={i}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Transfer Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm">
              <span className="font-medium">Destination:</span> {transfer.destinationCountry}
              {transfer.destinationCountryCode ? ` (${transfer.destinationCountryCode})` : ''}
            </p>
            <p className="text-sm">
              <span className="font-medium">Adequacy:</span>{' '}
              {ADEQUACY_OPTIONS.find((o) => o.value === transfer.adequacyStatus)?.label}
            </p>
            <p className="text-sm">
              <span className="font-medium">Frequency:</span>{' '}
              {FREQUENCY_OPTIONS.find((o) => o.value === transfer.frequency)?.label}
            </p>
            <p className="text-sm">
              <span className="font-medium">Start Date:</span> {formatDate(transfer.startDate)}
            </p>
            {transfer.endDate && (
              <p className="text-sm">
                <span className="font-medium">End Date:</span> {formatDate(transfer.endDate)}
              </p>
            )}
            {transfer.reviewDate && (
              <p className="text-sm">
                <span className="font-medium">Next Review:</span> {formatDate(transfer.reviewDate)}
              </p>
            )}
          </div>
          <div>
            <p className="text-sm">
              <span className="font-medium">Recipient:</span> {transfer.recipientOrganization}
            </p>
            <p className="text-sm">
              <span className="font-medium">Contact:</span> {transfer.recipientContact.name} (
              {transfer.recipientContact.email})
            </p>
            {transfer.estimatedDataSubjects && (
              <p className="text-sm">
                <span className="font-medium">Data Subjects:</span>{' '}
                {transfer.estimatedDataSubjects.toLocaleString()}
              </p>
            )}
            <p className="text-sm">
              <span className="font-medium">Sensitive Data:</span>{' '}
              {transfer.includesSensitiveData ? 'Yes' : 'No'}
            </p>
          </div>
        </div>

        {/* Transfer Mechanism */}
        <div className="mb-4">
          <p className="text-sm font-medium mb-1">Transfer Mechanism</p>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
            <p className="text-sm text-gray-700 dark:text-gray-200">
              {getTransferMechanismDescription(transfer.transferMechanism)}
            </p>
          </div>
        </div>

        {/* Purpose */}
        <div className="mb-4">
          <p className="text-sm font-medium mb-1">Purpose</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
            {transfer.purpose}
          </p>
        </div>

        {/* Data Categories */}
        <div className="mb-4">
          <p className="text-sm font-medium mb-1">Data Categories</p>
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
        <div className="mb-4">
          <p className="text-sm font-medium mb-1">Safeguards</p>
          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
            {transfer.safeguards.map((safeguard, i) => (
              <li key={i}>{safeguard}</li>
            ))}
          </ul>
        </div>

        {/* Risk Assessment */}
        <div className="mb-4">
          <p className="text-sm font-medium mb-1">Risk Assessment</p>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
            <p className="text-sm text-gray-700 dark:text-gray-200 mb-2">
              {transfer.riskAssessment}
            </p>
            <div className="mt-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Automated Assessment (Score: {riskResult.riskScore})
              </p>
              {riskResult.factors.length > 0 && (
                <ul className="list-disc list-inside text-xs text-gray-500 dark:text-gray-400">
                  {riskResult.factors.map((factor, i) => (
                    <li key={i}>{factor}</li>
                  ))}
                </ul>
              )}
              {riskResult.recommendations.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Recommendations:
                  </p>
                  <ul className="list-disc list-inside text-xs text-gray-500 dark:text-gray-400">
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
          <div className="mb-4">
            <p className="text-sm font-medium mb-1">NDPC Approval</p>
            <div
              className={`p-3 rounded-md ${
                transfer.ndpcApproval.approved
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : transfer.ndpcApproval.applied
                    ? 'bg-yellow-50 dark:bg-yellow-900/20'
                    : 'bg-red-50 dark:bg-red-900/20'
              }`}
            >
              <p className="text-sm">
                <span className="font-medium">Status:</span>{' '}
                {transfer.ndpcApproval.approved
                  ? 'Approved'
                  : transfer.ndpcApproval.applied
                    ? 'Application Submitted'
                    : 'Not Applied'}
              </p>
              {transfer.ndpcApproval.referenceNumber && (
                <p className="text-sm">
                  <span className="font-medium">Reference:</span>{' '}
                  {transfer.ndpcApproval.referenceNumber}
                </p>
              )}
              {transfer.ndpcApproval.appliedAt && (
                <p className="text-sm">
                  <span className="font-medium">Applied:</span>{' '}
                  {formatDate(transfer.ndpcApproval.appliedAt)}
                </p>
              )}
              {transfer.ndpcApproval.approvedAt && (
                <p className="text-sm">
                  <span className="font-medium">Approved:</span>{' '}
                  {formatDate(transfer.ndpcApproval.approvedAt)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* TIA */}
        <div className="mb-4">
          <p className="text-sm font-medium mb-1">Transfer Impact Assessment</p>
          <div
            className={`p-3 rounded-md ${
              transfer.tiaCompleted
                ? 'bg-green-50 dark:bg-green-900/20'
                : 'bg-yellow-50 dark:bg-yellow-900/20'
            }`}
          >
            <p className="text-sm">
              <span className="font-medium">Status:</span>{' '}
              {transfer.tiaCompleted ? 'Completed' : 'Not Completed'}
            </p>
            {transfer.tiaReference && (
              <p className="text-sm">
                <span className="font-medium">Reference:</span> {transfer.tiaReference}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => handleOpenEditForm(transfer)}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${buttonClassName}`}
          >
            Edit
          </button>
          <button
            onClick={() => handleRemove(transfer.id)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Remove
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md ${className}`}>
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-300">{description}</p>

      {/* Compliance Summary */}
      {showSummary && renderSummary()}

      {/* Add Transfer Button */}
      {!isFormOpen && (
        <div className="mb-6">
          <button
            onClick={handleOpenAddForm}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${buttonClassName}`}
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
          <label htmlFor="cbStatusFilter" className="block text-sm font-medium mb-1">
            Status Filter
          </label>
          <select
            id="cbStatusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <label htmlFor="cbMechanismFilter" className="block text-sm font-medium mb-1">
            Mechanism Filter
          </label>
          <select
            id="cbMechanismFilter"
            value={mechanismFilter}
            onChange={(e) => setMechanismFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No cross-border transfers found.
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {filteredTransfers.map((transfer) => (
                <div
                  key={transfer.id}
                  className={`p-3 rounded-md cursor-pointer ${
                    selectedTransferId === transfer.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => setSelectedTransferId(transfer.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-sm">{transfer.destinationCountry}</h4>
                    {renderRiskBadge(transfer.riskLevel)}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {transfer.recipientOrganization}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {renderMechanismBadge(transfer.transferMechanism)}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    {renderStatusBadge(transfer.status)}
                    {transfer.ndpcApproval?.required && !transfer.ndpcApproval?.approved && (
                      <span className="text-xs text-purple-600 dark:text-purple-400">
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
            <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-700 rounded-md">
              <p className="text-gray-500 dark:text-gray-400">
                Select a transfer to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
