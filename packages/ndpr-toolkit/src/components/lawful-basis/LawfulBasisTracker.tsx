import React, { useState, useEffect } from 'react';
import {
  LawfulBasis,
  ProcessingActivity,
  SensitiveDataCondition,
  LawfulBasisSummary,
} from '../../types/lawful-basis';
import {
  validateProcessingActivity,
  getLawfulBasisDescription,
  assessComplianceGaps,
  generateLawfulBasisSummary,
  LawfulBasisComplianceGap,
} from '../../utils/lawful-basis';
import { resolveClass } from '../../utils/styling';

export interface LawfulBasisTrackerClassNames {
  root?: string;
  header?: string;
  title?: string;
  summary?: string;
  summaryCard?: string;
  table?: string;
  tableHeader?: string;
  tableRow?: string;
  form?: string;
  input?: string;
  select?: string;
  submitButton?: string;
  /** Alias for submitButton */
  primaryButton?: string;
  statusBadge?: string;
  complianceScore?: string;
  gapAlert?: string;
}

export interface LawfulBasisTrackerProps {
  /**
   * List of processing activities to display
   */
  activities: ProcessingActivity[];

  /**
   * Callback when a new activity is created
   */
  onAddActivity?: (activity: Omit<ProcessingActivity, 'id' | 'createdAt' | 'updatedAt'>) => void;

  /**
   * Callback when an activity is updated
   */
  onUpdateActivity?: (id: string, updates: Partial<ProcessingActivity>) => void;

  /**
   * Callback when an activity is archived
   */
  onArchiveActivity?: (id: string) => void;

  /**
   * Title displayed on the tracker
   * @default "Lawful Basis Tracker"
   */
  title?: string;

  /**
   * Description text displayed on the tracker
   * @default "Document and track the lawful basis for each processing activity as required by NDPA 2023 Section 25."
   */
  description?: string;

  /**
   * Custom CSS class for the tracker container
   */
  className?: string;

  /**
   * Custom CSS class for buttons
   */
  buttonClassName?: string;

  /**
   * Whether to show the compliance summary at the top
   * @default true
   */
  showSummary?: boolean;

  /**
   * Whether to show compliance gap alerts
   * @default true
   */
  showComplianceGaps?: boolean;

  /**
   * Override class names for individual sections of the component.
   * Takes priority over className / buttonClassName.
   */
  classNames?: LawfulBasisTrackerClassNames;

  /**
   * When true, all default styling is removed so consumers
   * can style from scratch using classNames.
   */
  unstyled?: boolean;
}

type ViewMode = 'list' | 'form' | 'detail';

interface FormData {
  name: string;
  description: string;
  lawfulBasis: LawfulBasis;
  lawfulBasisJustification: string;
  dataCategories: string;
  involvesSensitiveData: boolean;
  sensitiveDataCondition: SensitiveDataCondition | '';
  dataSubjectCategories: string;
  purposes: string;
  retentionPeriod: string;
  retentionJustification: string;
  recipients: string;
  crossBorderTransfer: boolean;
  reviewDate: string;
  // LIA fields
  liaPurposeTest: string;
  liaNecessityTest: string;
  liaBalancingTest: string;
  liaSafeguards: string;
  liaConclusion: string;
}

const EMPTY_FORM: FormData = {
  name: '',
  description: '',
  lawfulBasis: 'consent',
  lawfulBasisJustification: '',
  dataCategories: '',
  involvesSensitiveData: false,
  sensitiveDataCondition: '',
  dataSubjectCategories: '',
  purposes: '',
  retentionPeriod: '',
  retentionJustification: '',
  recipients: '',
  crossBorderTransfer: false,
  reviewDate: '',
  liaPurposeTest: '',
  liaNecessityTest: '',
  liaBalancingTest: '',
  liaSafeguards: '',
  liaConclusion: '',
};

const LAWFUL_BASIS_OPTIONS: { value: LawfulBasis; label: string }[] = [
  { value: 'consent', label: 'Consent' },
  { value: 'contract', label: 'Contract' },
  { value: 'legal_obligation', label: 'Legal Obligation' },
  { value: 'vital_interests', label: 'Vital Interests' },
  { value: 'public_interest', label: 'Public Interest' },
  { value: 'legitimate_interests', label: 'Legitimate Interests' },
];

const SENSITIVE_DATA_OPTIONS: { value: SensitiveDataCondition; label: string }[] = [
  { value: 'explicit_consent', label: 'Explicit Consent' },
  { value: 'employment_law', label: 'Employment Law' },
  { value: 'vital_interests_incapable', label: 'Vital Interests (Incapable)' },
  { value: 'nonprofit_legitimate', label: 'Nonprofit Legitimate Activities' },
  { value: 'publicly_available', label: 'Publicly Available Data' },
  { value: 'legal_claims', label: 'Legal Claims' },
  { value: 'substantial_public_interest', label: 'Substantial Public Interest' },
  { value: 'health_purposes', label: 'Health Purposes' },
  { value: 'public_health', label: 'Public Health' },
  { value: 'archiving_research', label: 'Archiving / Research' },
];

/**
 * Lawful basis tracker component. Implements NDPA Section 25 requirements for documenting
 * and tracking the lawful basis for each personal data processing activity.
 */
export const LawfulBasisTracker: React.FC<LawfulBasisTrackerProps> = ({
  activities,
  onAddActivity,
  onUpdateActivity,
  onArchiveActivity,
  title = 'Lawful Basis Tracker',
  description = 'Document and track the lawful basis for each processing activity as required by NDPA 2023 Section 25.',
  className = '',
  buttonClassName = '',
  showSummary = true,
  showComplianceGaps = true,
  classNames,
  unstyled,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [basisFilter, setBasisFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ProcessingActivity[]>(activities);

  // Filter activities when filters change
  useEffect(() => {
    let filtered = [...activities];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(a => a.status === statusFilter);
    }

    if (basisFilter !== 'all') {
      filtered = filtered.filter(a => a.lawfulBasis === basisFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        a =>
          a.name.toLowerCase().includes(term) ||
          a.description.toLowerCase().includes(term) ||
          a.purposes.some(p => p.toLowerCase().includes(term))
      );
    }

    filtered.sort((a, b) => b.updatedAt - a.updatedAt);

    setFilteredActivities(filtered);
  }, [activities, statusFilter, basisFilter, searchTerm]);

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
  };

  const summary: LawfulBasisSummary = generateLawfulBasisSummary(activities);
  const complianceGaps: LawfulBasisComplianceGap[] = assessComplianceGaps(activities);

  // Parse comma-separated string into array
  const parseList = (value: string): string[] => {
    return value
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  };

  // Open form for creating a new activity
  const handleNewActivity = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setFormErrors([]);
    setViewMode('form');
  };

  // Open form for editing an existing activity
  const handleEditActivity = (activity: ProcessingActivity) => {
    setFormData({
      name: activity.name,
      description: activity.description,
      lawfulBasis: activity.lawfulBasis,
      lawfulBasisJustification: activity.lawfulBasisJustification,
      dataCategories: activity.dataCategories.join(', '),
      involvesSensitiveData: activity.involvesSensitiveData,
      sensitiveDataCondition: activity.sensitiveDataCondition || '',
      dataSubjectCategories: activity.dataSubjectCategories.join(', '),
      purposes: activity.purposes.join(', '),
      retentionPeriod: activity.retentionPeriod,
      retentionJustification: activity.retentionJustification || '',
      recipients: (activity.recipients || []).join(', '),
      crossBorderTransfer: activity.crossBorderTransfer,
      reviewDate: activity.reviewDate
        ? new Date(activity.reviewDate).toISOString().split('T')[0]
        : '',
      liaPurposeTest: '',
      liaNecessityTest: '',
      liaBalancingTest: '',
      liaSafeguards: '',
      liaConclusion: '',
    });
    setEditingId(activity.id);
    setFormErrors([]);
    setViewMode('form');
  };

  // Handle form submission
  const handleSubmitForm = () => {
    const activityData: Omit<ProcessingActivity, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name,
      description: formData.description,
      lawfulBasis: formData.lawfulBasis,
      lawfulBasisJustification: formData.lawfulBasisJustification,
      dataCategories: parseList(formData.dataCategories),
      involvesSensitiveData: formData.involvesSensitiveData,
      sensitiveDataCondition: formData.sensitiveDataCondition || undefined,
      dataSubjectCategories: parseList(formData.dataSubjectCategories),
      purposes: parseList(formData.purposes),
      retentionPeriod: formData.retentionPeriod,
      retentionJustification: formData.retentionJustification || undefined,
      recipients: formData.recipients ? parseList(formData.recipients) : undefined,
      crossBorderTransfer: formData.crossBorderTransfer,
      reviewDate: formData.reviewDate ? new Date(formData.reviewDate).getTime() : undefined,
      status: 'active',
    };

    // Validate using our utility
    const tempActivity: ProcessingActivity = {
      ...activityData,
      id: editingId || 'temp',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const validation = validateProcessingActivity(tempActivity);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    if (editingId && onUpdateActivity) {
      onUpdateActivity(editingId, activityData);
    } else if (onAddActivity) {
      onAddActivity(activityData);
    }

    setFormData(EMPTY_FORM);
    setEditingId(null);
    setFormErrors([]);
    setViewMode('list');
  };

  // Handle archiving
  const handleArchiveActivity = (id: string) => {
    if (onArchiveActivity) {
      onArchiveActivity(id);
    }
  };

  // View activity detail
  const handleViewDetail = (id: string) => {
    setSelectedActivityId(id);
    setViewMode('detail');
  };

  const selectedActivity = selectedActivityId
    ? activities.find(a => a.id === selectedActivityId)
    : null;

  // Render status badge
  const renderStatusBadge = (status: ProcessingActivity['status']) => {
    const colorClasses: Record<ProcessingActivity['status'], string> = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      under_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      archived: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };

    const labels: Record<ProcessingActivity['status'], string> = {
      active: 'Active',
      inactive: 'Inactive',
      under_review: 'Under Review',
      archived: 'Archived',
    };

    return (
      <span className={resolveClass(`px-2 py-1 rounded text-xs font-medium ${colorClasses[status]}`, classNames?.statusBadge, unstyled)}>
        {labels[status]}
      </span>
    );
  };

  // Render lawful basis badge
  const renderBasisBadge = (basis: LawfulBasis) => {
    const colorClasses: Record<LawfulBasis, string> = {
      consent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      contract: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      legal_obligation: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      vital_interests: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      public_interest: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      legitimate_interests: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    };

    const labels: Record<LawfulBasis, string> = {
      consent: 'Consent',
      contract: 'Contract',
      legal_obligation: 'Legal Obligation',
      vital_interests: 'Vital Interests',
      public_interest: 'Public Interest',
      legitimate_interests: 'Legitimate Interests',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colorClasses[basis]}`}>
        {labels[basis]}
      </span>
    );
  };

  // Render DPO approval indicator
  const renderApprovalIndicator = (activity: ProcessingActivity) => {
    if (!activity.dpoApproval) {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
          No DPO Review
        </span>
      );
    }

    if (activity.dpoApproval.approved) {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Approved
        </span>
      );
    }

    return (
      <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
        Pending Approval
      </span>
    );
  };

  // Render compliance summary
  const renderSummary = () => {
    return (
      <div className={resolveClass('grid grid-cols-2 md:grid-cols-4 gap-4 mb-6', classNames?.summary, unstyled)}>
        <div className={resolveClass('bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg', classNames?.summaryCard, unstyled)}>
          <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
            {summary.totalActivities}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-300">Total Activities</p>
        </div>
        <div className={resolveClass('bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg', classNames?.summaryCard, unstyled)}>
          <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
            {summary.sensitiveDataActivities}
          </p>
          <p className="text-sm text-orange-600 dark:text-orange-300">Sensitive Data</p>
        </div>
        <div className={resolveClass('bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg', classNames?.summaryCard, unstyled)}>
          <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
            {summary.crossBorderActivities}
          </p>
          <p className="text-sm text-purple-600 dark:text-purple-300">Cross-Border Transfers</p>
        </div>
        <div className={resolveClass('bg-red-50 dark:bg-red-900/20 p-4 rounded-lg', classNames?.summaryCard, unstyled)}>
          <p className="text-2xl font-bold text-red-800 dark:text-red-200">
            {summary.activitiesWithoutApproval.length}
          </p>
          <p className="text-sm text-red-600 dark:text-red-300">Pending Approval</p>
        </div>
      </div>
    );
  };

  // Render compliance gaps
  const renderComplianceGaps = () => {
    if (complianceGaps.length === 0) {
      return (
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-6">
          <p className="text-sm text-green-800 dark:text-green-200 font-medium">
            No compliance gaps detected.
          </p>
          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
            All processing activities appear to be properly documented.
          </p>
        </div>
      );
    }

    const highSeverity = complianceGaps.filter(g => g.severity === 'high');
    const mediumSeverity = complianceGaps.filter(g => g.severity === 'medium');

    return (
      <div className="mb-6">
        {highSeverity.length > 0 && (
          <div className={resolveClass('bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-3', classNames?.gapAlert, unstyled)}>
            <p className="text-sm text-red-800 dark:text-red-200 font-medium mb-2">
              High Priority ({highSeverity.length})
            </p>
            <ul className="space-y-1">
              {highSeverity.map((gap, index) => (
                <li key={index} className="text-xs text-red-700 dark:text-red-300">
                  {gap.description}
                </li>
              ))}
            </ul>
          </div>
        )}
        {mediumSeverity.length > 0 && (
          <div className={resolveClass('bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg', classNames?.gapAlert, unstyled)}>
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-2">
              Medium Priority ({mediumSeverity.length})
            </p>
            <ul className="space-y-1">
              {mediumSeverity.map((gap, index) => (
                <li key={index} className="text-xs text-yellow-700 dark:text-yellow-300">
                  {gap.description}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Render form
  const renderForm = () => {
    return (
      <div className={resolveClass('', classNames?.form, unstyled)}>
        <div className={resolveClass('flex justify-between items-center mb-4', classNames?.header, unstyled)}>
          <h3 className="text-lg font-medium">
            {editingId ? 'Edit Processing Activity' : 'New Processing Activity'}
          </h3>
          <button
            onClick={() => {
              setViewMode('list');
              setFormErrors([]);
            }}
            className={`px-4 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${buttonClassName}`}
          >
            Cancel
          </button>
        </div>

        {formErrors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
            <p className="text-sm text-red-800 dark:text-red-200 font-medium mb-2">
              Please correct the following errors:
            </p>
            <ul className="list-disc list-inside space-y-1">
              {formErrors.map((error, index) => (
                <li key={index} className="text-xs text-red-700 dark:text-red-300">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="activityName" className="block text-sm font-medium mb-1">
              Activity Name *
            </label>
            <input
              type="text"
              id="activityName"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Customer Account Management"
              className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]', classNames?.input, unstyled)}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="activityDescription" className="block text-sm font-medium mb-1">
              Description *
            </label>
            <textarea
              id="activityDescription"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what processing is performed..."
              rows={3}
              className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]', classNames?.input, unstyled)}
            />
          </div>

          {/* Lawful Basis */}
          <div>
            <label htmlFor="lawfulBasis" className="block text-sm font-medium mb-1">
              Lawful Basis (NDPA Section 25) *
            </label>
            <select
              id="lawfulBasis"
              value={formData.lawfulBasis}
              onChange={e =>
                setFormData({ ...formData, lawfulBasis: e.target.value as LawfulBasis })
              }
              className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]', classNames?.select, unstyled)}
            >
              {LAWFUL_BASIS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              {getLawfulBasisDescription(formData.lawfulBasis)}
            </p>
          </div>

          {/* Justification */}
          <div>
            <label htmlFor="justification" className="block text-sm font-medium mb-1">
              Lawful Basis Justification *
            </label>
            <textarea
              id="justification"
              value={formData.lawfulBasisJustification}
              onChange={e =>
                setFormData({ ...formData, lawfulBasisJustification: e.target.value })
              }
              placeholder="Document why this lawful basis applies to this processing activity..."
              rows={3}
              className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]', classNames?.input, unstyled)}
            />
          </div>

          {/* Legitimate Interest Assessment (conditional) */}
          {formData.lawfulBasis === 'legitimate_interests' && (
            <div className="border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 bg-indigo-50 dark:bg-indigo-900/20">
              <h4 className="text-sm font-semibold text-indigo-800 dark:text-indigo-200 mb-3">
                Legitimate Interest Assessment (LIA)
              </h4>
              <p className="text-xs text-indigo-600 dark:text-indigo-300 mb-4">
                NDPA Section 25(1)(f) requires a balancing test when relying on legitimate interests.
              </p>

              <div className="space-y-3">
                <div>
                  <label htmlFor="liaPurpose" className="block text-sm font-medium mb-1">
                    Purpose Test
                  </label>
                  <textarea
                    id="liaPurpose"
                    value={formData.liaPurposeTest}
                    onChange={e =>
                      setFormData({ ...formData, liaPurposeTest: e.target.value })
                    }
                    placeholder="Describe the legitimate interest being pursued..."
                    rows={2}
                    className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]', classNames?.input, unstyled)}
                  />
                </div>

                <div>
                  <label htmlFor="liaNecessity" className="block text-sm font-medium mb-1">
                    Necessity Test
                  </label>
                  <textarea
                    id="liaNecessity"
                    value={formData.liaNecessityTest}
                    onChange={e =>
                      setFormData({ ...formData, liaNecessityTest: e.target.value })
                    }
                    placeholder="Explain why this processing is necessary for the stated purpose..."
                    rows={2}
                    className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]', classNames?.input, unstyled)}
                  />
                </div>

                <div>
                  <label htmlFor="liaBalancing" className="block text-sm font-medium mb-1">
                    Balancing Test
                  </label>
                  <textarea
                    id="liaBalancing"
                    value={formData.liaBalancingTest}
                    onChange={e =>
                      setFormData({ ...formData, liaBalancingTest: e.target.value })
                    }
                    placeholder="Assess the impact on data subjects' rights and interests..."
                    rows={2}
                    className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]', classNames?.input, unstyled)}
                  />
                </div>

                <div>
                  <label htmlFor="liaSafeguards" className="block text-sm font-medium mb-1">
                    Safeguards
                  </label>
                  <input
                    type="text"
                    id="liaSafeguards"
                    value={formData.liaSafeguards}
                    onChange={e =>
                      setFormData({ ...formData, liaSafeguards: e.target.value })
                    }
                    placeholder="List safeguards (comma-separated)..."
                    className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]', classNames?.input, unstyled)}
                  />
                </div>

                <div>
                  <label htmlFor="liaConclusion" className="block text-sm font-medium mb-1">
                    Conclusion
                  </label>
                  <textarea
                    id="liaConclusion"
                    value={formData.liaConclusion}
                    onChange={e =>
                      setFormData({ ...formData, liaConclusion: e.target.value })
                    }
                    placeholder="State your overall conclusion..."
                    rows={2}
                    className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]', classNames?.input, unstyled)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Data Categories */}
          <div>
            <label htmlFor="dataCategories" className="block text-sm font-medium mb-1">
              Data Categories *
            </label>
            <input
              type="text"
              id="dataCategories"
              value={formData.dataCategories}
              onChange={e => setFormData({ ...formData, dataCategories: e.target.value })}
              placeholder="e.g., Name, Email, Phone Number (comma-separated)"
              className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]', classNames?.input, unstyled)}
            />
          </div>

          {/* Sensitive Data */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.involvesSensitiveData}
                onChange={e =>
                  setFormData({
                    ...formData,
                    involvesSensitiveData: e.target.checked,
                    sensitiveDataCondition: e.target.checked
                      ? formData.sensitiveDataCondition
                      : '',
                  })
                }
                className="rounded border-gray-300 dark:border-gray-600 text-[rgb(var(--ndpr-primary))] focus:ring-[rgb(var(--ndpr-ring))]"
              />
              <span className="text-sm font-medium">
                Involves Sensitive Personal Data (NDPA Section 27)
              </span>
            </label>
          </div>

          {/* Sensitive Data Condition (conditional) */}
          {formData.involvesSensitiveData && (
            <div>
              <label htmlFor="sensitiveCondition" className="block text-sm font-medium mb-1">
                Sensitive Data Condition (NDPA Section 27) *
              </label>
              <select
                id="sensitiveCondition"
                value={formData.sensitiveDataCondition}
                onChange={e =>
                  setFormData({
                    ...formData,
                    sensitiveDataCondition: e.target.value as SensitiveDataCondition,
                  })
                }
                className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]', classNames?.select, unstyled)}
              >
                <option value="">Select a condition...</option>
                {SENSITIVE_DATA_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Data Subject Categories */}
          <div>
            <label htmlFor="dataSubjectCategories" className="block text-sm font-medium mb-1">
              Data Subject Categories *
            </label>
            <input
              type="text"
              id="dataSubjectCategories"
              value={formData.dataSubjectCategories}
              onChange={e =>
                setFormData({ ...formData, dataSubjectCategories: e.target.value })
              }
              placeholder="e.g., Customers, Employees, Vendors (comma-separated)"
              className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]', classNames?.input, unstyled)}
            />
          </div>

          {/* Purposes */}
          <div>
            <label htmlFor="purposes" className="block text-sm font-medium mb-1">
              Processing Purposes *
            </label>
            <input
              type="text"
              id="purposes"
              value={formData.purposes}
              onChange={e => setFormData({ ...formData, purposes: e.target.value })}
              placeholder="e.g., Account management, Service delivery (comma-separated)"
              className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]', classNames?.input, unstyled)}
            />
          </div>

          {/* Retention Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="retentionPeriod" className="block text-sm font-medium mb-1">
                Retention Period *
              </label>
              <input
                type="text"
                id="retentionPeriod"
                value={formData.retentionPeriod}
                onChange={e => setFormData({ ...formData, retentionPeriod: e.target.value })}
                placeholder="e.g., 3 years after account closure"
                className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]', classNames?.input, unstyled)}
              />
            </div>
            <div>
              <label htmlFor="retentionJustification" className="block text-sm font-medium mb-1">
                Retention Justification
              </label>
              <input
                type="text"
                id="retentionJustification"
                value={formData.retentionJustification}
                onChange={e =>
                  setFormData({ ...formData, retentionJustification: e.target.value })
                }
                placeholder="Reason for the retention period"
                className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]', classNames?.input, unstyled)}
              />
            </div>
          </div>

          {/* Recipients */}
          <div>
            <label htmlFor="recipients" className="block text-sm font-medium mb-1">
              Recipients
            </label>
            <input
              type="text"
              id="recipients"
              value={formData.recipients}
              onChange={e => setFormData({ ...formData, recipients: e.target.value })}
              placeholder="e.g., Payment processor, Cloud provider (comma-separated)"
              className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]', classNames?.input, unstyled)}
            />
          </div>

          {/* Cross-Border Transfer */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.crossBorderTransfer}
                onChange={e =>
                  setFormData({ ...formData, crossBorderTransfer: e.target.checked })
                }
                className="rounded border-gray-300 dark:border-gray-600 text-[rgb(var(--ndpr-primary))] focus:ring-[rgb(var(--ndpr-ring))]"
              />
              <span className="text-sm font-medium">
                Involves Cross-Border Transfer Outside Nigeria
              </span>
            </label>
          </div>

          {/* Review Date */}
          <div>
            <label htmlFor="reviewDate" className="block text-sm font-medium mb-1">
              Next Review Date
            </label>
            <input
              type="date"
              id="reviewDate"
              value={formData.reviewDate}
              onChange={e => setFormData({ ...formData, reviewDate: e.target.value })}
              className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]', classNames?.input, unstyled)}
            />
          </div>

          {/* Submit button */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => {
                setViewMode('list');
                setFormErrors([]);
              }}
              className={`px-4 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${buttonClassName}`}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitForm}
              className={resolveClass(`px-4 py-2 bg-[rgb(var(--ndpr-primary))] text-white rounded hover:bg-[rgb(var(--ndpr-primary-hover))] ${buttonClassName}`, classNames?.primaryButton || classNames?.submitButton, unstyled)}
            >
              {editingId ? 'Update Activity' : 'Create Activity'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render activity detail view
  const renderDetail = () => {
    if (!selectedActivity) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-700 rounded-md">
          <p className="text-gray-600 dark:text-gray-400">Activity not found.</p>
        </div>
      );
    }

    const validation = validateProcessingActivity(selectedActivity);

    return (
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <button
              onClick={() => setViewMode('list')}
              className="text-sm text-[rgb(var(--ndpr-primary))] dark:text-[rgb(var(--ndpr-primary))] hover:underline mb-2"
            >
              Back to list
            </button>
            <h3 className="text-lg font-medium">{selectedActivity.name}</h3>
          </div>
          <div className="flex space-x-2">
            {renderBasisBadge(selectedActivity.lawfulBasis)}
            {renderStatusBadge(selectedActivity.status)}
            {renderApprovalIndicator(selectedActivity)}
          </div>
        </div>

        {/* Validation warnings */}
        {validation.warnings.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md mb-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-1">
              Warnings
            </p>
            <ul className="list-disc list-inside space-y-1">
              {validation.warnings.map((warning, index) => (
                <li key={index} className="text-xs text-yellow-700 dark:text-yellow-300">
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Activity details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm">
              <span className="font-medium">Description:</span> {selectedActivity.description}
            </p>
            <p className="text-sm mt-2">
              <span className="font-medium">Lawful Basis:</span>{' '}
              {getLawfulBasisDescription(selectedActivity.lawfulBasis)}
            </p>
            <p className="text-sm mt-2">
              <span className="font-medium">Justification:</span>{' '}
              {selectedActivity.lawfulBasisJustification}
            </p>
          </div>
          <div>
            <p className="text-sm">
              <span className="font-medium">Data Categories:</span>{' '}
              {selectedActivity.dataCategories.join(', ')}
            </p>
            <p className="text-sm mt-2">
              <span className="font-medium">Data Subject Categories:</span>{' '}
              {selectedActivity.dataSubjectCategories.join(', ')}
            </p>
            <p className="text-sm mt-2">
              <span className="font-medium">Purposes:</span>{' '}
              {selectedActivity.purposes.join(', ')}
            </p>
            <p className="text-sm mt-2">
              <span className="font-medium">Retention Period:</span>{' '}
              {selectedActivity.retentionPeriod}
              {selectedActivity.retentionJustification && (
                <span className="text-gray-600 dark:text-gray-400">
                  {' '}
                  ({selectedActivity.retentionJustification})
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm">
              <span className="font-medium">Sensitive Data:</span>{' '}
              {selectedActivity.involvesSensitiveData ? 'Yes' : 'No'}
              {selectedActivity.sensitiveDataCondition && (
                <span>
                  {' '}
                  (Condition:{' '}
                  {SENSITIVE_DATA_OPTIONS.find(
                    o => o.value === selectedActivity.sensitiveDataCondition
                  )?.label || selectedActivity.sensitiveDataCondition}
                  )
                </span>
              )}
            </p>
            <p className="text-sm mt-2">
              <span className="font-medium">Cross-Border Transfer:</span>{' '}
              {selectedActivity.crossBorderTransfer ? 'Yes' : 'No'}
            </p>
            {selectedActivity.recipients && selectedActivity.recipients.length > 0 && (
              <p className="text-sm mt-2">
                <span className="font-medium">Recipients:</span>{' '}
                {selectedActivity.recipients.join(', ')}
              </p>
            )}
          </div>
          <div>
            <p className="text-sm">
              <span className="font-medium">Created:</span>{' '}
              {formatDate(selectedActivity.createdAt)}
            </p>
            <p className="text-sm mt-2">
              <span className="font-medium">Last Updated:</span>{' '}
              {formatDate(selectedActivity.updatedAt)}
            </p>
            {selectedActivity.reviewDate && (
              <p className="text-sm mt-2">
                <span className="font-medium">Next Review:</span>{' '}
                {formatDate(selectedActivity.reviewDate)}
                {selectedActivity.reviewDate < Date.now() && (
                  <span className="text-red-600 dark:text-red-400 font-medium"> (Overdue)</span>
                )}
              </p>
            )}
          </div>
        </div>

        {/* DPO Approval details */}
        {selectedActivity.dpoApproval && (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-6">
            <h4 className="text-sm font-semibold mb-2">DPO Approval</h4>
            <p className="text-sm">
              <span className="font-medium">Status:</span>{' '}
              {selectedActivity.dpoApproval.approved ? 'Approved' : 'Not Approved'}
            </p>
            <p className="text-sm mt-1">
              <span className="font-medium">Approved By:</span>{' '}
              {selectedActivity.dpoApproval.approvedBy}
            </p>
            <p className="text-sm mt-1">
              <span className="font-medium">Date:</span>{' '}
              {formatDate(selectedActivity.dpoApproval.approvedAt)}
            </p>
            {selectedActivity.dpoApproval.notes && (
              <p className="text-sm mt-1">
                <span className="font-medium">Notes:</span>{' '}
                {selectedActivity.dpoApproval.notes}
              </p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => handleEditActivity(selectedActivity)}
            className={`px-4 py-2 bg-[rgb(var(--ndpr-primary))] text-white rounded hover:bg-[rgb(var(--ndpr-primary-hover))] ${buttonClassName}`}
          >
            Edit
          </button>
          {selectedActivity.status !== 'archived' && (
            <button
              onClick={() => handleArchiveActivity(selectedActivity.id)}
              className={`px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 ${buttonClassName}`}
            >
              Archive
            </button>
          )}
        </div>
      </div>
    );
  };

  // Render activity list
  const renderList = () => {
    return (
      <div>
        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="basisFilter" className="block text-sm font-medium mb-1">
              Lawful Basis
            </label>
            <select
              id="basisFilter"
              value={basisFilter}
              onChange={e => setBasisFilter(e.target.value)}
              className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]', classNames?.select, unstyled)}
            >
              <option value="all">All Bases</option>
              {LAWFUL_BASIS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="statusFilterSelect" className="block text-sm font-medium mb-1">
              Status
            </label>
            <select
              id="statusFilterSelect"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]', classNames?.select, unstyled)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="under_review">Under Review</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label htmlFor="searchInput" className="block text-sm font-medium mb-1">
              Search
            </label>
            <input
              type="text"
              id="searchInput"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search activities..."
              className={resolveClass('w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]', classNames?.input, unstyled)}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleNewActivity}
              className={resolveClass(`w-full px-4 py-2 bg-[rgb(var(--ndpr-primary))] text-white rounded hover:bg-[rgb(var(--ndpr-primary-hover))] ${buttonClassName}`, classNames?.primaryButton || classNames?.submitButton, unstyled)}
            >
              Add Activity
            </button>
          </div>
        </div>

        {/* Activities table */}
        {filteredActivities.length === 0 ? (
          <div className="flex items-center justify-center h-32 bg-gray-50 dark:bg-gray-700 rounded-md">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              No processing activities found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={resolveClass('w-full text-sm text-left', classNames?.table, unstyled)}>
              <thead className={resolveClass('text-xs uppercase bg-gray-50 dark:bg-gray-700', classNames?.tableHeader, unstyled)}>
                <tr>
                  <th className="px-4 py-3">Activity</th>
                  <th className="px-4 py-3">Lawful Basis</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">DPO Approval</th>
                  <th className="px-4 py-3">Sensitive Data</th>
                  <th className="px-4 py-3">Last Updated</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map(activity => (
                  <tr
                    key={activity.id}
                    className={resolveClass('border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700', classNames?.tableRow, unstyled)}
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleViewDetail(activity.id)}
                        className="font-medium text-[rgb(var(--ndpr-primary))] dark:text-[rgb(var(--ndpr-primary))] hover:underline text-left"
                      >
                        {activity.name}
                      </button>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate max-w-xs">
                        {activity.description}
                      </p>
                    </td>
                    <td className="px-4 py-3">{renderBasisBadge(activity.lawfulBasis)}</td>
                    <td className="px-4 py-3">{renderStatusBadge(activity.status)}</td>
                    <td className="px-4 py-3">{renderApprovalIndicator(activity)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs ${
                          activity.involvesSensitiveData
                            ? 'text-orange-600 dark:text-orange-400 font-medium'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {activity.involvesSensitiveData ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                      {formatDate(activity.updatedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditActivity(activity)}
                          className="text-xs text-[rgb(var(--ndpr-primary))] dark:text-[rgb(var(--ndpr-primary))] hover:underline"
                        >
                          Edit
                        </button>
                        {activity.status !== 'archived' && (
                          <button
                            onClick={() => handleArchiveActivity(activity.id)}
                            className="text-xs text-gray-600 dark:text-gray-400 hover:underline"
                          >
                            Archive
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={resolveClass(`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md ${className}`, classNames?.root, unstyled)}>
      <h2 className={resolveClass('text-xl font-bold mb-2', classNames?.title, unstyled)}>{title}</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-300">{description}</p>

      {/* Compliance Summary */}
      {showSummary && viewMode === 'list' && renderSummary()}

      {/* Compliance Gaps */}
      {showComplianceGaps && viewMode === 'list' && renderComplianceGaps()}

      {/* Main content area */}
      {viewMode === 'list' && renderList()}
      {viewMode === 'form' && renderForm()}
      {viewMode === 'detail' && renderDetail()}
    </div>
  );
};
