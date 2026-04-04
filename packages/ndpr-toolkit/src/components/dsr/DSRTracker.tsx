import React, { useState, useEffect } from 'react';
import { DSRRequest, DSRStatus, DSRType } from '../../types/dsr';

export interface DSRTrackerProps {
  /**
   * List of DSR requests to track
   */
  requests: DSRRequest[];
  
  /**
   * Callback function called when a request is selected
   */
  onSelectRequest?: (requestId: string) => void;
  
  /**
   * Title displayed on the tracker
   * @default "DSR Request Tracker"
   */
  title?: string;
  
  /**
   * Description text displayed on the tracker
   * @default "Track the status and progress of data subject requests."
   */
  description?: string;
  
  /**
   * Custom CSS class for the tracker
   */
  className?: string;
  
  /**
   * Custom CSS class for the buttons
   */
  buttonClassName?: string;
  
  /**
   * Whether to show the summary statistics
   * @default true
   */
  showSummaryStats?: boolean;
  
  /**
   * Whether to show the request type breakdown
   * @default true
   */
  showTypeBreakdown?: boolean;
  
  /**
   * Whether to show the status breakdown
   * @default true
   */
  showStatusBreakdown?: boolean;
  
  /**
   * Whether to show the timeline chart
   * @default true
   */
  showTimelineChart?: boolean;
  
  /**
   * Whether to show the overdue requests
   * @default true
   */
  showOverdueRequests?: boolean;
}

export const DSRTracker: React.FC<DSRTrackerProps> = ({
  requests,
  onSelectRequest,
  title = "DSR Request Tracker",
  description = "Track the status and progress of data subject requests.",
  className = "",
  buttonClassName = "",
  showSummaryStats = true,
  showTypeBreakdown = true,
  showStatusBreakdown = true,
  showTimelineChart = true,
  showOverdueRequests = true
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7days' | '30days' | '90days' | 'all'>('30days');
  const [filteredRequests, setFilteredRequests] = useState<DSRRequest[]>(requests);
  const [overdueRequests, setOverdueRequests] = useState<DSRRequest[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<DSRRequest[]>([]);
  
  // Filter requests based on selected timeframe
  useEffect(() => {
    const now = Date.now();
    let filtered: DSRRequest[];
    
    switch (selectedTimeframe) {
      case '7days':
        filtered = requests.filter(request => (now - request.createdAt) <= 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        filtered = requests.filter(request => (now - request.createdAt) <= 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        filtered = requests.filter(request => (now - request.createdAt) <= 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        filtered = [...requests];
    }
    
    setFilteredRequests(filtered);
    
    // Find overdue requests
    const overdue = filtered.filter(request => 
      request.dueDate && 
      now > request.dueDate && 
      request.status !== 'completed' && 
      request.status !== 'rejected'
    );
    setOverdueRequests(overdue);
    
    // Find upcoming deadlines (due in the next 7 days)
    const upcoming = filtered.filter(request => 
      request.dueDate && 
      now < request.dueDate && 
      (request.dueDate - now) <= 7 * 24 * 60 * 60 * 1000 &&
      request.status !== 'completed' && 
      request.status !== 'rejected'
    );
    setUpcomingDeadlines(upcoming);
  }, [requests, selectedTimeframe]);
  
  // Handle request selection
  const handleSelectRequest = (requestId: string) => {
    if (onSelectRequest) {
      onSelectRequest(requestId);
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
  
  // Calculate average response time in days
  const calculateAverageResponseTime = (): number | null => {
    const completedRequests = filteredRequests.filter(request => 
      request.status === 'completed' && request.completedAt && request.createdAt
    );
    
    if (completedRequests.length === 0) {
      return null;
    }
    
    const totalDays = completedRequests.reduce((sum, request) => {
      const responseTime = ((request.completedAt || 0) - request.createdAt) / (24 * 60 * 60 * 1000);
      return sum + responseTime;
    }, 0);
    
    return Number((totalDays / completedRequests.length).toFixed(1));
  };
  
  // Calculate compliance rate (percentage of requests completed within deadline)
  const calculateComplianceRate = (): number | null => {
    const completedRequests = filteredRequests.filter(request => 
      (request.status === 'completed' || request.status === 'rejected') && 
      request.completedAt && 
      request.dueDate
    );
    
    if (completedRequests.length === 0) {
      return null;
    }
    
    const compliantRequests = completedRequests.filter(request => 
      (request.completedAt || 0) <= (request.dueDate || 0)
    );
    
    return Math.round((compliantRequests.length / completedRequests.length) * 100);
  };
  
  // Count requests by type
  const countRequestsByType = (): Record<DSRType, number> => {
    const counts: Partial<Record<DSRType, number>> = {};
    
    filteredRequests.forEach(request => {
      counts[request.type] = (counts[request.type] || 0) + 1;
    });
    
    return {
      information: counts.information || 0,
      access: counts.access || 0,
      rectification: counts.rectification || 0,
      erasure: counts.erasure || 0,
      restriction: counts.restriction || 0,
      portability: counts.portability || 0,
      objection: counts.objection || 0,
      automated_decision_making: counts.automated_decision_making || 0
    };
  };
  
  // Count requests by status
  const countRequestsByStatus = (): Record<DSRStatus, number> => {
    const counts: Partial<Record<DSRStatus, number>> = {};
    
    filteredRequests.forEach(request => {
      counts[request.status] = (counts[request.status] || 0) + 1;
    });
    
    return {
      pending: counts.pending || 0,
      awaitingVerification: counts.awaitingVerification || 0,
      inProgress: counts.inProgress || 0,
      completed: counts.completed || 0,
      rejected: counts.rejected || 0
    };
  };
  
  // Render type badge
  const renderTypeBadge = (type: DSRType) => {
    const colorClasses: Record<DSRType, string> = {
      information: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      access: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      rectification: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      erasure: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      restriction: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      portability: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      objection: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      automated_decision_making: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
    };

    const typeLabels: Record<DSRType, string> = {
      information: 'Information',
      access: 'Access',
      rectification: 'Rectification',
      erasure: 'Erasure',
      restriction: 'Restriction',
      portability: 'Portability',
      objection: 'Objection',
      automated_decision_making: 'Automated Decision-Making'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colorClasses[type]}`}>
        {typeLabels[type]}
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
  
  // Render the summary statistics
  const renderSummaryStats = () => {
    const totalRequests = filteredRequests.length;
    const pendingRequests = filteredRequests.filter(request => 
      request.status !== 'completed' && request.status !== 'rejected'
    ).length;
    const completedRequests = filteredRequests.filter(request => 
      request.status === 'completed' || request.status === 'rejected'
    ).length;
    const averageResponseTime = calculateAverageResponseTime();
    const complianceRate = calculateComplianceRate();
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Requests</h4>
          <p className="text-2xl font-bold">{totalRequests}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Pending Requests</h4>
          <p className="text-2xl font-bold">{pendingRequests}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Avg. Response Time</h4>
          <p className="text-2xl font-bold">{averageResponseTime !== null ? `${averageResponseTime} days` : 'N/A'}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Compliance Rate</h4>
          <p className="text-2xl font-bold">{complianceRate !== null ? `${complianceRate}%` : 'N/A'}</p>
        </div>
      </div>
    );
  };
  
  // Render the type breakdown
  const renderTypeBreakdown = () => {
    const typeCounts = countRequestsByType();
    const totalRequests = filteredRequests.length;
    
    // Sort types by count (descending)
    const sortedTypes = Object.entries(typeCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .map(([type]) => type as DSRType);
    
    return (
      <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium mb-4">Request Types</h3>
        
        {totalRequests === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No data available for the selected timeframe.
          </p>
        ) : (
          <div className="space-y-4">
            {sortedTypes.map(type => {
              const count = typeCounts[type];
              const percentage = Math.round((count / totalRequests) * 100);
              
              return (
                <div key={type}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      {renderTypeBadge(type)}
                      <span className="ml-2 text-sm">{count} requests</span>
                    </div>
                    <span className="text-sm font-medium">{percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };
  
  // Render the status breakdown
  const renderStatusBreakdown = () => {
    const statusCounts = countRequestsByStatus();
    const totalRequests = filteredRequests.length;
    
    // Define the order of statuses
    const statusOrder: DSRStatus[] = ['pending', 'awaitingVerification', 'inProgress', 'completed', 'rejected'];
    
    // Define colors for each status
    const statusColors: Record<DSRStatus, string> = {
      pending: 'bg-yellow-500',
      awaitingVerification: 'bg-purple-500',
      inProgress: 'bg-blue-500',
      completed: 'bg-green-500',
      rejected: 'bg-red-500'
    };
    
    return (
      <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium mb-4">Request Status</h3>
        
        {totalRequests === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No data available for the selected timeframe.
          </p>
        ) : (
          <div>
            <div className="flex h-4 mb-2">
              {statusOrder.map(status => {
                const count = statusCounts[status];
                const percentage = (count / totalRequests) * 100;
                
                return percentage > 0 ? (
                  <div 
                    key={status}
                    className={`${statusColors[status]} first:rounded-l-full last:rounded-r-full`}
                    style={{ width: `${percentage}%` }}
                    title={`${status}: ${count} (${Math.round(percentage)}%)`}
                  ></div>
                ) : null;
              })}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4">
              {statusOrder.map(status => {
                const count = statusCounts[status];
                const percentage = Math.round((count / totalRequests) * 100);
                
                return (
                  <div key={status} className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${statusColors[status]} mr-2`}></div>
                    <div>
                      <p className="text-xs font-medium">
                        {status === 'inProgress' ? 'In Progress' : 
                         status === 'awaitingVerification' ? 'Awaiting Verification' : 
                         status.charAt(0).toUpperCase() + status.slice(1)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{count} ({percentage}%)</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Render the timeline chart (simplified version)
  const renderTimelineChart = () => {
    // Group requests by month
    const requestsByMonth: Record<string, number> = {};
    
    filteredRequests.forEach(request => {
      const date = new Date(request.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      requestsByMonth[monthKey] = (requestsByMonth[monthKey] || 0) + 1;
    });
    
    // Sort months chronologically
    const sortedMonths = Object.keys(requestsByMonth).sort();
    
    // Get the last 6 months (or all if less than 6)
    const displayMonths = sortedMonths.slice(-6);
    
    // Find the maximum count for scaling
    const maxCount = Math.max(...Object.values(requestsByMonth).filter(count => count > 0), 1);
    
    // Format month for display
    const formatMonth = (monthKey: string): string => {
      const [year, month] = monthKey.split('-');
      return `${month}/${year.slice(2)}`;
    };
    
    return (
      <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium mb-4">Request Timeline</h3>
        
        {displayMonths.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No data available for the selected timeframe.
          </p>
        ) : (
          <div className="h-40">
            <div className="flex h-32 items-end justify-between space-x-2">
              {displayMonths.map(month => {
                const count = requestsByMonth[month];
                const height = `${(count / maxCount) * 100}%`;
                
                return (
                  <div key={month} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height }}
                      title={`${formatMonth(month)}: ${count} requests`}
                    ></div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-between mt-2">
              {displayMonths.map(month => (
                <div key={month} className="text-xs text-center">
                  {formatMonth(month)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Render overdue requests
  const renderOverdueRequests = () => {
    return (
      <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium mb-4">Overdue Requests</h3>
        
        {overdueRequests.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No overdue requests.
          </p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {overdueRequests.map(request => (
              <div 
                key={request.id}
                className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30"
                onClick={() => handleSelectRequest(request.id)}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-sm">{request.subject.name}</h4>
                  {renderTypeBadge(request.type)}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {request.subject.email}
                </p>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Due: {formatDate(request.dueDate || 0)}
                  </p>
                  <p className="text-xs font-bold text-red-600 dark:text-red-400">
                    Overdue by {Math.abs(calculateDaysRemaining(request.dueDate || 0))} days
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Render upcoming deadlines
  const renderUpcomingDeadlines = () => {
    return (
      <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium mb-4">Upcoming Deadlines</h3>
        
        {upcomingDeadlines.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No upcoming deadlines in the next 7 days.
          </p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {upcomingDeadlines.map(request => {
              const daysRemaining = calculateDaysRemaining(request.dueDate || 0);
              
              return (
                <div 
                  key={request.id}
                  className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                  onClick={() => handleSelectRequest(request.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-sm">{request.subject.name}</h4>
                    {renderTypeBadge(request.type)}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {request.subject.email}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Due: {formatDate(request.dueDate || 0)}
                    </p>
                    <p className={`text-xs font-bold ${
                      daysRemaining <= 3 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      Due in {daysRemaining} days
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md ${className}`}>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div>
          <h2 className="text-xl font-bold mb-2">{title}</h2>
          <p className="text-gray-600 dark:text-gray-300">{description}</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <label htmlFor="timeframe" className="block text-sm font-medium mb-1">
            Timeframe
          </label>
          <select
            id="timeframe"
            value={selectedTimeframe}
            onChange={e => setSelectedTimeframe(e.target.value as '7days' | '30days' | '90days' | 'all')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>
      
      {/* Summary Statistics */}
      {showSummaryStats && renderSummaryStats()}
      
      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div>
          {/* Type Breakdown */}
          {showTypeBreakdown && renderTypeBreakdown()}
          
          {/* Status Breakdown */}
          {showStatusBreakdown && renderStatusBreakdown()}
        </div>
        
        {/* Right Column */}
        <div>
          {/* Timeline Chart */}
          {showTimelineChart && renderTimelineChart()}
          
          {/* Overdue Requests */}
          {showOverdueRequests && renderOverdueRequests()}
          
          {/* Upcoming Deadlines */}
          {showOverdueRequests && renderUpcomingDeadlines()}
        </div>
      </div>
    </div>
  );
};
