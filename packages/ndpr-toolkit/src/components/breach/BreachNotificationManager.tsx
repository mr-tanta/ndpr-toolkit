import React, { useState, useEffect } from 'react';
import { BreachReport, RiskAssessment, RegulatoryNotification, NotificationRequirement } from '../../types/breach';
import { calculateBreachSeverity } from '../../utils/breach';
import { resolveClass } from '../../utils/styling';

export interface BreachNotificationManagerClassNames {
  root?: string;
  header?: string;
  title?: string;
  breachList?: string;
  breachItem?: string;
  statusBadge?: string;
  timeline?: string;
  timelineStep?: string;
  detailPanel?: string;
}

export interface BreachNotificationManagerProps {
  /**
   * List of breach reports to manage
   */
  breachReports: BreachReport[];
  
  /**
   * List of risk assessments
   */
  riskAssessments: RiskAssessment[];
  
  /**
   * List of regulatory notifications
   */
  regulatoryNotifications: RegulatoryNotification[];
  
  /**
   * Callback function called when a breach is selected
   */
  onSelectBreach?: (breachId: string) => void;
  
  /**
   * Callback function called when a risk assessment is requested
   */
  onRequestAssessment?: (breachId: string) => void;
  
  /**
   * Callback function called when a notification is requested
   */
  onRequestNotification?: (breachId: string) => void;
  
  /**
   * Title displayed on the manager
   * @default "Breach Notification Manager"
   */
  title?: string;
  
  /**
   * Description text displayed on the manager
   * @default "Manage data breach notifications and track compliance with NDPA Section 40 requirements."
   */
  description?: string;
  
  /**
   * Custom CSS class for the manager
   */
  className?: string;

  /**
   * Custom CSS class for the buttons
   */
  buttonClassName?: string;

  /**
   * Override class names for individual elements
   */
  classNames?: BreachNotificationManagerClassNames;

  /**
   * Remove all default styles, only applying classNames overrides
   */
  unstyled?: boolean;
  
  /**
   * Whether to show the breach details
   * @default true
   */
  showBreachDetails?: boolean;
  
  /**
   * Whether to show the notification timeline
   * @default true
   */
  showNotificationTimeline?: boolean;
  
  /**
   * Whether to show the deadline alerts
   * @default true
   */
  showDeadlineAlerts?: boolean;
}

/**
 * Breach notification management component. Implements NDPA Section 40 requirements for
 * managing breach notifications, tracking 72-hour NDPC reporting deadlines, and coordinating
 * data subject notifications.
 */
export const BreachNotificationManager: React.FC<BreachNotificationManagerProps> = ({
  breachReports,
  riskAssessments,
  regulatoryNotifications,
  onSelectBreach,
  onRequestAssessment,
  onRequestNotification,
  title = "Breach Notification Manager",
  description = "Manage data breach notifications and track compliance with NDPA Section 40 requirements.",
  className = "",
  buttonClassName = "",
  classNames: cn = {},
  unstyled = false,
  showBreachDetails = true,
  showNotificationTimeline = true,
  showDeadlineAlerts = true
}) => {
  const [selectedBreachId, setSelectedBreachId] = useState<string | null>(null);
  const [filteredBreaches, setFilteredBreaches] = useState<BreachReport[]>(breachReports);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('discoveredAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Update filtered breaches when filters change
  useEffect(() => {
    let filtered = [...breachReports];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(breach => breach.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(breach => 
        breach.title.toLowerCase().includes(term) ||
        breach.description.toLowerCase().includes(term) ||
        breach.affectedSystems.some(system => system.toLowerCase().includes(term)) ||
        breach.dataTypes.some(type => type.toLowerCase().includes(term))
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'discoveredAt':
          comparison = a.discoveredAt - b.discoveredAt;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'riskLevel':
          const assessmentA = riskAssessments.find(assessment => assessment.breachId === a.id);
          const assessmentB = riskAssessments.find(assessment => assessment.breachId === b.id);
          const riskLevelA = assessmentA?.riskLevel || 'unknown';
          const riskLevelB = assessmentB?.riskLevel || 'unknown';
          comparison = riskLevelA.localeCompare(riskLevelB);
          break;
        default:
          comparison = a.discoveredAt - b.discoveredAt;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredBreaches(filtered);
  }, [breachReports, statusFilter, searchTerm, sortBy, sortDirection, riskAssessments]);
  
  // Select the first breach if none is selected or current selection is no longer visible
  useEffect(() => {
    if (filteredBreaches.length > 0) {
      const currentStillVisible = selectedBreachId && filteredBreaches.some(r => r.id === selectedBreachId);
      if (!currentStillVisible) {
        setSelectedBreachId(filteredBreaches[0].id);
      }
    }
  }, [filteredBreaches, selectedBreachId]);
  
  // Handle breach selection
  const handleSelectBreach = (breachId: string) => {
    setSelectedBreachId(breachId);
    if (onSelectBreach) {
      onSelectBreach(breachId);
    }
  };
  
  // Handle requesting a risk assessment
  const handleRequestAssessment = () => {
    if (selectedBreachId && onRequestAssessment) {
      onRequestAssessment(selectedBreachId);
    }
  };
  
  // Handle requesting a notification
  const handleRequestNotification = () => {
    if (selectedBreachId && onRequestNotification) {
      onRequestNotification(selectedBreachId);
    }
  };
  
  // Format a date from timestamp
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Get the selected breach
  const selectedBreach = selectedBreachId 
    ? breachReports.find(breach => breach.id === selectedBreachId) 
    : null;
  
  // Get the risk assessment for the selected breach
  const selectedAssessment = selectedBreachId 
    ? riskAssessments.find(assessment => assessment.breachId === selectedBreachId) 
    : null;
  
  // Get the notification for the selected breach
  const selectedNotification = selectedBreachId 
    ? regulatoryNotifications.find(notification => notification.breachId === selectedBreachId) 
    : null;
  
  // Calculate notification requirements for the selected breach
  const notificationRequirements = selectedBreach 
    ? calculateNotificationRequirements(selectedBreach, selectedAssessment) 
    : null;
  
  // Calculate notification requirements
  function calculateNotificationRequirements(
    breach: BreachReport,
    assessment?: RiskAssessment | null
  ): NotificationRequirement | null {
    const result = calculateBreachSeverity(breach, assessment || undefined);
    
    // Calculate the deadline (72 hours from discovery under NDPA Section 40)
    const deadline = breach.discoveredAt + (result.timeframeHours * 60 * 60 * 1000);

    return {
      ndpcNotificationRequired: result.notificationRequired,
      ndpcNotificationDeadline: deadline,
      dataSubjectNotificationRequired: assessment?.highRisksToRightsAndFreedoms || false,
      justification: result.justification
    };
  }
  
  // Calculate hours remaining until deadline
  function calculateHoursRemaining(deadline: number): number {
    const now = Date.now();
    const remaining = (deadline - now) / (60 * 60 * 1000);
    return Number(remaining.toFixed(1));
  }
  
  // Render risk level badge
  const renderRiskLevelBadge = (level?: 'low' | 'medium' | 'high' | 'critical') => {
    if (!level) return null;
    
    const colorClasses = {
      low: 'ndpr-badge ndpr-badge--success',
      medium: 'ndpr-badge ndpr-badge--warning',
      high: 'ndpr-badge ndpr-badge--warning',
      critical: 'ndpr-badge ndpr-badge--destructive'
    };
    
    return (
      <span className={resolveClass(`px-2 py-1 rounded text-xs font-medium ${colorClasses[level]}`, cn.statusBadge, unstyled)}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </span>
    );
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    const colorClasses = {
      ongoing: 'ndpr-badge ndpr-badge--destructive',
      contained: 'ndpr-badge ndpr-badge--warning',
      resolved: 'ndpr-badge ndpr-badge--success'
    };

    return (
      <span className={resolveClass(`px-2 py-1 rounded text-xs font-medium ${colorClasses[status as keyof typeof colorClasses] || 'ndpr-badge ndpr-badge--neutral'}`, cn.statusBadge, unstyled)}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  // Render notification status
  const renderNotificationStatus = () => {
    if (!selectedBreach || !notificationRequirements) return null;
    
    if (!notificationRequirements.ndpcNotificationRequired) {
      return (
        <div data-ndpr-component="breach-notification-manager" className='ndpr-alert ndpr-alert--success'>
          <p className="text-sm ndpr-text-success font-medium">
            Notification Not Required
          </p>
          <p className="text-xs ndpr-text-success mt-1">
            Based on the risk assessment, NDPC notification is not required for this breach.
          </p>
        </div>
      );
    }

    if (selectedNotification) {
      return (
        <div className='ndpr-alert ndpr-alert--success'>
          <p className="text-sm ndpr-text-success font-medium">
            Notification Sent
          </p>
          <p className="text-xs ndpr-text-success mt-1">
            Notification was sent to the NDPC on {formatDate(selectedNotification.sentAt)}.
          </p>
        </div>
      );
    }

    const hoursRemaining = calculateHoursRemaining(notificationRequirements.ndpcNotificationDeadline);

    if (hoursRemaining <= 0) {
      return (
        <div className='ndpr-alert ndpr-alert--destructive'>
          <p className="text-sm ndpr-text-destructive font-medium">
            Notification Deadline Passed
          </p>
          <p className="text-xs ndpr-text-destructive mt-1">
            The 72-hour deadline for NDPC notification has passed. Notification should be sent immediately.
          </p>
        </div>
      );
    }

    if (hoursRemaining <= 24) {
      return (
        <div className='ndpr-alert ndpr-alert--destructive'>
          <p className="text-sm ndpr-text-destructive font-medium">
            Urgent: Notification Due Soon
          </p>
          <p className="text-xs ndpr-text-destructive mt-1">
            Only {hoursRemaining} hours remaining until the NDPC notification deadline.
          </p>
        </div>
      );
    }

    return (
      <div className='ndpr-alert ndpr-alert--warning'>
        <p className="text-sm ndpr-text-warning font-medium">
          Notification Required
        </p>
        <p className="text-xs ndpr-text-warning mt-1">
          NDPC notification is required by {formatDate(notificationRequirements.ndpcNotificationDeadline)} ({hoursRemaining} hours remaining).
        </p>
      </div>
    );
  };
  
  // Render notification timeline
  const renderNotificationTimeline = () => {
    if (!selectedBreach) return null;
    
    const timeline = [
      {
        title: 'Breach Discovered',
        date: selectedBreach.discoveredAt,
        completed: true,
        description: `Breach was discovered on ${formatDate(selectedBreach.discoveredAt)}.`
      },
      {
        title: 'Risk Assessment',
        date: selectedAssessment?.assessedAt,
        completed: !!selectedAssessment,
        description: selectedAssessment 
          ? `Risk assessment completed on ${formatDate(selectedAssessment.assessedAt)}.` 
          : 'Risk assessment has not been completed yet.'
      }
    ];
    
    if (notificationRequirements?.ndpcNotificationRequired) {
      timeline.push({
        title: 'NDPC Notification',
        date: selectedNotification?.sentAt,
        completed: !!selectedNotification,
        description: selectedNotification
          ? `Notification sent to the NDPC on ${formatDate(selectedNotification.sentAt)}.`
          : `Notification must be sent to the NDPC by ${formatDate(notificationRequirements.ndpcNotificationDeadline)}.`
      });
    }
    
    if (notificationRequirements?.dataSubjectNotificationRequired) {
      timeline.push({
        title: 'Data Subject Notification',
        date: undefined,
        completed: false,
        description: 'Notification to affected data subjects is required but has not been sent yet.'
      });
    }
    
    return (
      <div className={resolveClass("mt-6", cn.timeline, unstyled)}>
        <h3 className="text-lg font-medium mb-4">Notification Timeline</h3>
        <ol className="relative border-l border-gray-200 dark:border-gray-700">
          {timeline.map((item, index) => (
            <li key={index} className={resolveClass("mb-6 ml-4", cn.timelineStep, unstyled)}>
              <div className={`absolute w-3 h-3 rounded-full mt-1.5 -left-1.5 border ${
                item.completed 
                  ? 'bg-green-500 border-green-500 dark:border-green-500' 
                  : 'bg-gray-200 border-gray-200 dark:bg-gray-700 dark:border-gray-700'
              }`}></div>
              <time className="mb-1 text-sm font-normal leading-none ndpr-text-muted">
                {item.date ? formatDate(item.date) : 'Pending'}
              </time>
              <h4 className='ndpr-section-heading'>
                {item.title}
              </h4>
              <p className='ndpr-form-field__hint'>
                {item.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    );
  };
  
  return (
    <div className={resolveClass(`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md ${className}`, cn.root, unstyled)}>
      <div className={resolveClass("", cn.header, unstyled)}>
        <h2 className={resolveClass('ndpr-section-heading', cn.title, unstyled)}>{title}</h2>
        <p className='ndpr-card__subtitle'>{description}</p>
      </div>
      
      {/* Filters and Search */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="statusFilter" className='ndpr-form-field__label'>
            Status Filter
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className='ndpr-form-field__input'
          >
            <option value="all">All Statuses</option>
            <option value="ongoing">Ongoing</option>
            <option value="contained">Contained</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="sortBy" className='ndpr-form-field__label'>
            Sort By
          </label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className='ndpr-form-field__input'
          >
            <option value="discoveredAt">Discovery Date</option>
            <option value="title">Title</option>
            <option value="status">Status</option>
            <option value="riskLevel">Risk Level</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="searchTerm" className='ndpr-form-field__label'>
            Search
          </label>
          <input
            type="text"
            id="searchTerm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search breaches..."
            className='ndpr-form-field__input'
          />
        </div>
      </div>
      
      {/* Breach List and Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Breach List */}
        <div className="md:col-span-1">
          <h3 className="text-lg font-medium mb-3">Breach Reports</h3>
          
          {filteredBreaches.length === 0 ? (
            <p className='ndpr-card__subtitle'>
              No breach reports found.
            </p>
          ) : (
            <div className={resolveClass("space-y-2 max-h-96 overflow-y-auto pr-2", cn.breachList, unstyled)}>
              {filteredBreaches.map(breach => {
                const assessment = riskAssessments.find(a => a.breachId === breach.id);
                const notification = regulatoryNotifications.find(n => n.breachId === breach.id);
                const requirements = calculateNotificationRequirements(breach, assessment);
                
                // Calculate notification status for the list item
                let notificationStatus = null;
                if (requirements?.ndpcNotificationRequired) {
                  if (notification) {
                    notificationStatus = (
                      <span className="text-xs ndpr-text-success">
                        Notified
                      </span>
                    );
                  } else {
                    const hoursRemaining = calculateHoursRemaining(requirements.ndpcNotificationDeadline);
                    if (hoursRemaining <= 0) {
                      notificationStatus = (
                        <span className="text-xs ndpr-text-destructive font-bold">
                          Overdue
                        </span>
                      );
                    } else if (hoursRemaining <= 24) {
                      notificationStatus = (
                        <span className="text-xs ndpr-text-destructive">
                          Urgent
                        </span>
                      );
                    } else {
                      notificationStatus = (
                        <span className="text-xs ndpr-text-warning">
                          Required
                        </span>
                      );
                    }
                  }
                } else {
                  notificationStatus = (
                    <span className="text-xs ndpr-text-success">
                      Not Required
                    </span>
                  );
                }
                
                return (
                  <div
                    key={breach.id}
                    className={resolveClass(`p-3 rounded-md cursor-pointer ${
                      selectedBreachId === breach.id
                        ? 'ndpr-alert ndpr-alert--info'
                        : 'ndpr-panel'
                    }`, cn.breachItem, unstyled)}
                    onClick={() => handleSelectBreach(breach.id)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-sm">{breach.title}</h4>
                      {renderStatusBadge(breach.status)}
                    </div>
                    <p className="text-xs ndpr-text-muted mb-1">
                      Discovered: {new Date(breach.discoveredAt).toLocaleDateString()}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <div>
                        {assessment && renderRiskLevelBadge(assessment.riskLevel)}
                      </div>
                      <div>
                        {notificationStatus}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Breach Details */}
        <div className={resolveClass("md:col-span-2", cn.detailPanel, unstyled)}>
          {selectedBreach ? (
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className='ndpr-section-heading'>{selectedBreach.title}</h3>
                {renderStatusBadge(selectedBreach.status)}
              </div>
              
              {/* Notification Status Alert */}
              {showDeadlineAlerts && (
                <div className='ndpr-form-field'>
                  {renderNotificationStatus()}
                </div>
              )}
              
              {/* Breach Details */}
              {showBreachDetails && (
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className='ndpr-text-sm'><span className="font-medium">Discovered:</span> {formatDate(selectedBreach.discoveredAt)}</p>
                      {selectedBreach.occurredAt && (
                        <p className='ndpr-text-sm'><span className="font-medium">Occurred:</span> {formatDate(selectedBreach.occurredAt)}</p>
                      )}
                      <p className='ndpr-text-sm'><span className="font-medium">Reporter:</span> {selectedBreach.reporter.name}</p>
                    </div>
                    <div>
                      <p className='ndpr-text-sm'><span className="font-medium">Affected Systems:</span> {selectedBreach.affectedSystems.join(', ')}</p>
                      <p className='ndpr-text-sm'><span className="font-medium">Data Types:</span> {selectedBreach.dataTypes.join(', ')}</p>
                      <p className='ndpr-text-sm'>
                        <span className="font-medium">Affected Subjects:</span> {selectedBreach.estimatedAffectedSubjects || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  
                  <div className='ndpr-form-field'>
                    <p className='ndpr-text-sm ndpr-font-medium'>Description:</p>
                    <p className='ndpr-panel'>
                      {selectedBreach.description}
                    </p>
                  </div>
                  
                  {selectedBreach.initialActions && (
                    <div>
                      <p className='ndpr-text-sm ndpr-font-medium'>Initial Actions Taken:</p>
                      <p className='ndpr-panel'>
                        {selectedBreach.initialActions}
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Risk Assessment Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Risk Assessment</h3>
                
                {selectedAssessment ? (
                  <div className='ndpr-panel'>
                    <div className="flex justify-between items-center mb-2">
                      <p className='ndpr-text-sm ndpr-font-medium'>Risk Level:</p>
                      {renderRiskLevelBadge(selectedAssessment.riskLevel)}
                    </div>
                    <p className="text-sm mb-2">
                      <span className="font-medium">Risk Score:</span> {selectedAssessment.overallRiskScore} / 5
                    </p>
                    <p className="text-sm mb-2">
                      <span className="font-medium">Risks to Rights and Freedoms:</span> {selectedAssessment.risksToRightsAndFreedoms ? 'Yes' : 'No'}
                    </p>
                    <p className="text-sm mb-2">
                      <span className="font-medium">High Risks to Rights and Freedoms:</span> {selectedAssessment.highRisksToRightsAndFreedoms ? 'Yes' : 'No'}
                    </p>
                    <p className="text-sm mb-1">
                      <span className="font-medium">Justification:</span>
                    </p>
                    <p className="text-xs ndpr-text-muted bg-white dark:bg-gray-800 p-2 rounded-md">
                      {selectedAssessment.justification}
                    </p>
                  </div>
                ) : (
                  <div className='ndpr-alert ndpr-alert--warning'>
                    <p className="text-sm ndpr-text-warning">
                      Risk assessment has not been conducted yet.
                    </p>
                    <button
                      onClick={handleRequestAssessment}
                      className={`mt-2 px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 ${buttonClassName}`}
                    >
                      Conduct Risk Assessment
                    </button>
                  </div>
                )}
              </div>
              
              {/* Notification Status */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Notification Status</h3>
                
                {selectedNotification ? (
                  <div className='ndpr-panel'>
                    <p className="text-sm mb-2">
                      <span className="font-medium">Notification Sent:</span> {formatDate(selectedNotification.sentAt)}
                    </p>
                    <p className="text-sm mb-2">
                      <span className="font-medium">Method:</span> {selectedNotification.method.charAt(0).toUpperCase() + selectedNotification.method.slice(1)}
                    </p>
                    {selectedNotification.referenceNumber && (
                      <p className="text-sm mb-2">
                        <span className="font-medium">Reference Number:</span> {selectedNotification.referenceNumber}
                      </p>
                    )}
                    {(selectedNotification.ndpcContact || selectedNotification.nitdaContact) && (
                      <p className="text-sm mb-2">
                        <span className="font-medium">NDPC Contact:</span> {(selectedNotification.ndpcContact || selectedNotification.nitdaContact)?.name}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    {notificationRequirements?.ndpcNotificationRequired ? (
                      <div className='ndpr-alert ndpr-alert--warning'>
                        <p className="text-sm ndpr-text-warning">
                          NDPC notification is required but has not been sent yet.
                        </p>
                        <button
                          onClick={handleRequestNotification}
                          className={`mt-2 px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 ${buttonClassName}`}
                        >
                          Generate Notification
                        </button>
                      </div>
                    ) : (
                      <div className='ndpr-alert ndpr-alert--success'>
                        <p className="text-sm ndpr-text-success">
                          NDPC notification is not required for this breach.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Notification Timeline */}
              {showNotificationTimeline && renderNotificationTimeline()}
            </div>
          ) : (
            <div className='ndpr-empty-state'>
              <p className='ndpr-card__subtitle'>
                Select a breach to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
