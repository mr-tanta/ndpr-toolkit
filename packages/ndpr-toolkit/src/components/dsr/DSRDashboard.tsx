import React, { useState, useEffect } from 'react';
import { DSRRequest, DSRStatus, DSRType } from '../../types/dsr';
import { formatDSRRequest } from '../../utils/dsr';

export interface DSRDashboardProps {
  /**
   * List of DSR requests to display
   */
  requests: DSRRequest[];
  
  /**
   * Callback function called when a request is selected
   */
  onSelectRequest?: (requestId: string) => void;
  
  /**
   * Callback function called when a request status is updated
   */
  onUpdateStatus?: (requestId: string, status: DSRStatus) => void;
  
  /**
   * Callback function called when a request is assigned
   */
  onAssignRequest?: (requestId: string, assignee: string) => void;
  
  /**
   * Title displayed on the dashboard
   * @default "Data Subject Request Dashboard"
   */
  title?: string;
  
  /**
   * Description text displayed on the dashboard
   * @default "Track and manage data subject requests in compliance with NDPR requirements."
   */
  description?: string;
  
  /**
   * Custom CSS class for the dashboard
   */
  className?: string;
  
  /**
   * Custom CSS class for the buttons
   */
  buttonClassName?: string;
  
  /**
   * Whether to show the request details
   * @default true
   */
  showRequestDetails?: boolean;
  
  /**
   * Whether to show the request timeline
   * @default true
   */
  showRequestTimeline?: boolean;
  
  /**
   * Whether to show the deadline alerts
   * @default true
   */
  showDeadlineAlerts?: boolean;
  
  /**
   * List of possible assignees
   */
  assignees?: string[];
}

export const DSRDashboard: React.FC<DSRDashboardProps> = ({
  requests,
  onSelectRequest,
  onUpdateStatus,
  onAssignRequest,
  title = "Data Subject Request Dashboard",
  description = "Track and manage data subject requests in compliance with NDPR requirements.",
  className = "",
  buttonClassName = "",
  showRequestDetails = true,
  showRequestTimeline = true,
  showDeadlineAlerts = true,
  assignees = []
}) => {
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [filteredRequests, setFilteredRequests] = useState<DSRRequest[]>(requests);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [assignee, setAssignee] = useState<string>('');
  
  // Update filtered requests when filters change
  useEffect(() => {
    let filtered = [...requests];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(request => request.type === typeFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(request => 
        request.subject.name.toLowerCase().includes(term) ||
        request.subject.email.toLowerCase().includes(term) ||
        (request.description && request.description.toLowerCase().includes(term))
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'createdAt':
          comparison = a.createdAt - b.createdAt;
          break;
        case 'dueDate':
          comparison = (a.dueDate || 0) - (b.dueDate || 0);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = a.createdAt - b.createdAt;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredRequests(filtered);
  }, [requests, statusFilter, typeFilter, searchTerm, sortBy, sortDirection]);
  
  // Select the first request if none is selected
  useEffect(() => {
    if (filteredRequests.length > 0 && !selectedRequestId) {
      setSelectedRequestId(filteredRequests[0].id);
    }
  }, [filteredRequests, selectedRequestId]);
  
  // Handle request selection
  const handleSelectRequest = (requestId: string) => {
    setSelectedRequestId(requestId);
    if (onSelectRequest) {
      onSelectRequest(requestId);
    }
  };
  
  // Handle status update
  const handleUpdateStatus = (status: DSRStatus) => {
    if (selectedRequestId && onUpdateStatus) {
      onUpdateStatus(selectedRequestId, status);
    }
  };
  
  // Handle request assignment
  const handleAssignRequest = () => {
    if (selectedRequestId && assignee && onAssignRequest) {
      onAssignRequest(selectedRequestId, assignee);
      setAssignee('');
    }
  };
  
  // Format a date from timestamp
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
  };
  
  // Calculate days remaining until deadline
  const calculateDaysRemaining = (dueDate: number): number => {
    const now = Date.now();
    const remaining = (dueDate - now) / (24 * 60 * 60 * 1000);
    return Math.ceil(remaining);
  };
  
  // Get the selected request
  const selectedRequest = selectedRequestId 
    ? requests.find(request => request.id === selectedRequestId) 
    : null;
  
  // Render type badge
  const renderTypeBadge = (type: DSRType) => {
    const colorClasses = {
      access: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      rectification: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      erasure: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      restriction: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      portability: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      objection: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    };
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colorClasses[type]}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };
  
  // Render status badge
  const renderStatusBadge = (status: DSRStatus) => {
    const colorClasses = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      inProgress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      awaitingVerification: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colorClasses[status]}`}>
        {status === 'inProgress' ? 'In Progress' : 
         status === 'awaitingVerification' ? 'Awaiting Verification' : 
         status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  // Render deadline alert
  const renderDeadlineAlert = (request: DSRRequest) => {
    if (!request.dueDate) return null;
    
    const daysRemaining = calculateDaysRemaining(request.dueDate);
    
    if (daysRemaining <= 0) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
          <p className="text-sm text-red-800 dark:text-red-200 font-medium">
            Deadline Passed
          </p>
          <p className="text-xs text-red-700 dark:text-red-300 mt-1">
            The response deadline has passed. Immediate action is required.
          </p>
        </div>
      );
    }
    
    if (daysRemaining <= 3) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
          <p className="text-sm text-red-800 dark:text-red-200 font-medium">
            Urgent: Deadline Approaching
          </p>
          <p className="text-xs text-red-700 dark:text-red-300 mt-1">
            Only {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining until the response deadline.
          </p>
        </div>
      );
    }
    
    if (daysRemaining <= 7) {
      return (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
            Deadline Approaching
          </p>
          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
            {daysRemaining} days remaining until the response deadline.
          </p>
        </div>
      );
    }
    
    return (
      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
        <p className="text-sm text-green-800 dark:text-green-200 font-medium">
          Deadline Tracking
        </p>
        <p className="text-xs text-green-700 dark:text-green-300 mt-1">
          {daysRemaining} days remaining until the response deadline.
        </p>
      </div>
    );
  };
  
  // Render request timeline
  const renderRequestTimeline = (request: DSRRequest) => {
    const timeline = [
      {
        title: 'Request Received',
        date: request.createdAt,
        completed: true,
        description: `Request was received on ${formatDate(request.createdAt)}.`
      }
    ];
    
    if (request.verifiedAt) {
      timeline.push({
        title: 'Identity Verified',
        date: request.verifiedAt,
        completed: true,
        description: `Data subject's identity was verified on ${formatDate(request.verifiedAt)}.`
      });
    } else if (request.status === 'awaitingVerification') {
      timeline.push({
        title: 'Identity Verification',
        date: Date.now(),
        completed: false,
        description: 'Awaiting verification of data subject\'s identity.'
      });
    }
    
    if (request.status === 'inProgress' || request.status === 'completed' || request.status === 'rejected') {
      timeline.push({
        title: 'Processing Started',
        date: request.updatedAt,
        completed: true,
        description: `Request processing started on ${formatDate(request.updatedAt)}.`
      });
    }
    
    if (request.status === 'completed') {
      timeline.push({
        title: 'Request Completed',
        date: request.completedAt || Date.now(),
        completed: true,
        description: `Request was completed on ${formatDate(request.completedAt || Date.now())}.`
      });
    } else if (request.status === 'rejected') {
      timeline.push({
        title: 'Request Rejected',
        date: request.completedAt || Date.now(),
        completed: true,
        description: `Request was rejected on ${formatDate(request.completedAt || Date.now())}.${request.rejectionReason ? ` Reason: ${request.rejectionReason}` : ''}`
      });
    }
    
    if (request.dueDate) {
      timeline.push({
        title: 'Response Deadline',
        date: request.dueDate,
        completed: Date.now() > request.dueDate,
        description: `Response is due by ${formatDate(request.dueDate)}.`
      });
    }
    
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Request Timeline</h3>
        <ol className="relative border-l border-gray-200 dark:border-gray-700">
          {timeline.map((item, index) => (
            <li key={index} className="mb-6 ml-4">
              <div className={`absolute w-3 h-3 rounded-full mt-1.5 -left-1.5 border ${
                item.completed 
                  ? 'bg-green-500 border-green-500 dark:border-green-500' 
                  : 'bg-gray-200 border-gray-200 dark:bg-gray-700 dark:border-gray-700'
              }`}></div>
              <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                {item.date ? formatDate(item.date) : 'Pending'}
              </time>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                {item.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {item.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    );
  };
  
  // Render the type filter options
  const renderTypeOptions = () => {
    const options = [
      { value: 'all', label: 'All Types' },
      { value: 'access', label: 'Access' },
      { value: 'rectification', label: 'Rectification' },
      { value: 'erasure', label: 'Erasure' },
      { value: 'restriction', label: 'Restriction' },
      { value: 'portability', label: 'Portability' },
      { value: 'objection', label: 'Objection' }
    ];
    
    return options.map(option => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ));
  };
  
  // Render the status filter options
  const renderStatusOptions = () => {
    const options = [
      { value: 'all', label: 'All Statuses' },
      { value: 'pending', label: 'Pending' },
      { value: 'awaitingVerification', label: 'Awaiting Verification' },
      { value: 'inProgress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' },
      { value: 'rejected', label: 'Rejected' }
    ];
    
    return options.map(option => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ));
  };
  
  // Render the status update options
  const renderStatusUpdateOptions = () => {
    const options = [
      { value: 'pending', label: 'Pending' },
      { value: 'awaitingVerification', label: 'Awaiting Verification' },
      { value: 'inProgress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' },
      { value: 'rejected', label: 'Rejected' }
    ];
    
    return options.map(option => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ));
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md ${className}`}>
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-300">{description}</p>
      
      {/* Filters and Search */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="statusFilter" className="block text-sm font-medium mb-1">
            Status Filter
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {renderStatusOptions()}
          </select>
        </div>
        
        <div>
          <label htmlFor="typeFilter" className="block text-sm font-medium mb-1">
            Request Type Filter
          </label>
          <select
            id="typeFilter"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {renderTypeOptions()}
          </select>
        </div>
        
        <div>
          <label htmlFor="sortBy" className="block text-sm font-medium mb-1">
            Sort By
          </label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt">Date Received</option>
            <option value="dueDate">Due Date</option>
            <option value="type">Request Type</option>
            <option value="status">Status</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="searchTerm" className="block text-sm font-medium mb-1">
            Search
          </label>
          <input
            type="text"
            id="searchTerm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search requests..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      {/* Request List and Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Request List */}
        <div className="md:col-span-1">
          <h3 className="text-lg font-medium mb-3">DSR Requests</h3>
          
          {filteredRequests.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No data subject requests found.
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {filteredRequests.map(request => {
                // Calculate days remaining for the list item
                const daysRemaining = request.dueDate ? calculateDaysRemaining(request.dueDate) : null;
                
                // Determine deadline status for the list item
                let deadlineStatus = null;
                if (daysRemaining !== null) {
                  if (daysRemaining <= 0) {
                    deadlineStatus = (
                      <span className="text-xs text-red-600 dark:text-red-400 font-bold">
                        Overdue
                      </span>
                    );
                  } else if (daysRemaining <= 3) {
                    deadlineStatus = (
                      <span className="text-xs text-red-600 dark:text-red-400">
                        Urgent
                      </span>
                    );
                  } else if (daysRemaining <= 7) {
                    deadlineStatus = (
                      <span className="text-xs text-yellow-600 dark:text-yellow-400">
                        Soon
                      </span>
                    );
                  }
                }
                
                return (
                  <div
                    key={request.id}
                    className={`p-3 rounded-md cursor-pointer ${
                      selectedRequestId === request.id 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => handleSelectRequest(request.id)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-sm">{request.subject.name}</h4>
                      {renderTypeBadge(request.type)}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {request.subject.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Received: {formatDate(request.createdAt)}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <div>
                        {renderStatusBadge(request.status)}
                      </div>
                      <div>
                        {deadlineStatus}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Request Details */}
        <div className="md:col-span-2">
          {selectedRequest ? (
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium">{selectedRequest.subject.name}</h3>
                <div className="flex space-x-2">
                  {renderTypeBadge(selectedRequest.type)}
                  {renderStatusBadge(selectedRequest.status)}
                </div>
              </div>
              
              {/* Deadline Alert */}
              {showDeadlineAlerts && selectedRequest.dueDate && (
                <div className="mb-4">
                  {renderDeadlineAlert(selectedRequest)}
                </div>
              )}
              
              {/* Request Details */}
              {showRequestDetails && (
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm"><span className="font-medium">Email:</span> {selectedRequest.subject.email}</p>
                      {selectedRequest.subject.phone && (
                        <p className="text-sm"><span className="font-medium">Phone:</span> {selectedRequest.subject.phone}</p>
                      )}
                      <p className="text-sm"><span className="font-medium">Received:</span> {formatDate(selectedRequest.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">Request Type:</span> {selectedRequest.type.charAt(0).toUpperCase() + selectedRequest.type.slice(1)}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Status:</span> {
                          selectedRequest.status === 'inProgress' ? 'In Progress' : 
                          selectedRequest.status === 'awaitingVerification' ? 'Awaiting Verification' : 
                          selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)
                        }
                      </p>
                      {selectedRequest.dueDate && (
                        <p className="text-sm">
                          <span className="font-medium">Due Date:</span> {formatDate(selectedRequest.dueDate)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {selectedRequest.description && (
                    <div className="mb-4">
                      <p className="text-sm font-medium">Request Details:</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded-md mt-1">
                        {selectedRequest.description}
                      </p>
                    </div>
                  )}
                  
                  {selectedRequest.additionalInfo && (
                    <div>
                      <p className="text-sm font-medium">Additional Information:</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded-md mt-1">
                        {typeof selectedRequest.additionalInfo === 'object' ? 
                          JSON.stringify(selectedRequest.additionalInfo, null, 2) : 
                          String(selectedRequest.additionalInfo || 'No additional information provided')}
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Request Management */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Update */}
                <div>
                  <h3 className="text-md font-medium mb-2">Update Status</h3>
                  <div className="flex space-x-2">
                    <select
                      value={selectedRequest.status}
                      onChange={e => handleUpdateStatus(e.target.value as DSRStatus)}
                      className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {renderStatusUpdateOptions()}
                    </select>
                    <button
                      onClick={() => handleUpdateStatus(selectedRequest.status)}
                      className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${buttonClassName}`}
                    >
                      Update
                    </button>
                  </div>
                </div>
                
                {/* Assign Request */}
                {assignees.length > 0 && (
                  <div>
                    <h3 className="text-md font-medium mb-2">Assign Request</h3>
                    <div className="flex space-x-2">
                      <select
                        value={assignee}
                        onChange={e => setAssignee(e.target.value)}
                        className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Assignee</option>
                        {assignees.map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                      <button
                        onClick={handleAssignRequest}
                        disabled={!assignee}
                        className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 ${buttonClassName}`}
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Request Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Request Summary</h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                  <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800 dark:text-gray-200">
                    <pre>
                      {JSON.stringify(formatDSRRequest(selectedRequest), null, 2)}
                    </pre>
                  </pre>
                </div>
              </div>
              
              {/* Request Timeline */}
              {showRequestTimeline && renderRequestTimeline(selectedRequest)}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-700 rounded-md">
              <p className="text-gray-500 dark:text-gray-400">
                Select a request to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
