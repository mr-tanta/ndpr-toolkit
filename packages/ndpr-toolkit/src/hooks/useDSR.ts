import { useState, useEffect } from 'react';
import { DSRRequest, RequestStatus, RequestType } from '../types/dsr';
import { formatDSRRequest } from '../utils/dsr';

interface UseDSROptions {
  /**
   * Initial requests to load
   */
  initialRequests?: DSRRequest[];
  
  /**
   * Available request types
   */
  requestTypes: RequestType[];
  
  /**
   * Storage key for requests
   * @default "ndpr_dsr_requests"
   */
  storageKey?: string;
  
  /**
   * Whether to use local storage to persist requests
   * @default true
   */
  useLocalStorage?: boolean;
  
  /**
   * Callback function called when a request is submitted
   */
  onSubmit?: (request: DSRRequest) => void;
  
  /**
   * Callback function called when a request is updated
   */
  onUpdate?: (request: DSRRequest) => void;
}

interface UseDSRReturn {
  /**
   * All requests
   */
  requests: DSRRequest[];
  
  /**
   * Submit a new request
   */
  submitRequest: (requestData: Omit<DSRRequest, 'id' | 'status' | 'submittedAt' | 'updatedAt' | 'estimatedCompletionDate'>) => DSRRequest;
  
  /**
   * Update an existing request
   */
  updateRequest: (id: string, updates: Partial<DSRRequest>) => DSRRequest | null;
  
  /**
   * Get a request by ID
   */
  getRequest: (id: string) => DSRRequest | null;
  
  /**
   * Get requests by status
   */
  getRequestsByStatus: (status: RequestStatus) => DSRRequest[];
  
  /**
   * Get requests by type
   */
  getRequestsByType: (type: string) => DSRRequest[];
  
  /**
   * Get the request type definition by ID
   */
  getRequestType: (typeId: string) => RequestType | undefined;
  
  /**
   * Format a request for display or submission
   */
  formatRequest: (request: DSRRequest) => Record<string, any>;
  
  /**
   * Clear all requests
   */
  clearRequests: () => void;
}

/**
 * Hook for managing Data Subject Requests in compliance with the NDPA
 */
export function useDSR({
  initialRequests = [],
  requestTypes,
  storageKey = "ndpr_dsr_requests",
  useLocalStorage = true,
  onSubmit,
  onUpdate
}: UseDSROptions): UseDSRReturn {
  const [requests, setRequests] = useState<DSRRequest[]>(initialRequests);
  
  // Load requests from storage on mount
  useEffect(() => {
    if (useLocalStorage && typeof window !== 'undefined') {
      try {
        const savedRequests = localStorage.getItem(storageKey);
        if (savedRequests) {
          setRequests(JSON.parse(savedRequests));
        }
      } catch (error) {
        console.error('Error loading DSR requests:', error);
      }
    }
  }, [storageKey, useLocalStorage]);
  
  // Save requests to storage when they change
  useEffect(() => {
    if (useLocalStorage && typeof window !== 'undefined' && requests.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(requests));
      } catch (error) {
        console.error('Error saving DSR requests:', error);
      }
    }
  }, [requests, storageKey, useLocalStorage]);
  
  // Generate a unique ID
  const generateId = (): string => {
    return 'dsr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };
  
  // Submit a new request
  const submitRequest = (requestData: Omit<DSRRequest, 'id' | 'status' | 'submittedAt' | 'updatedAt' | 'estimatedCompletionDate'>): DSRRequest => {
    // Find the request type to get the estimated completion time
    const requestType = requestTypes.find(type => type.id === requestData.type);
    const estimatedCompletionDays = requestType?.estimatedCompletionTime || 30; // Default to 30 days
    
    const now = Date.now();
    const estimatedCompletionDate = now + (estimatedCompletionDays * 24 * 60 * 60 * 1000);
    
    // Extract any properties we want to override from requestData
    const { createdAt, ...restRequestData } = requestData as any;
    
    const newRequest: DSRRequest = {
      id: generateId(),
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      dueDate: estimatedCompletionDate,
      ...restRequestData
    };
    
    setRequests(prevRequests => [...prevRequests, newRequest]);
    
    if (onSubmit) {
      onSubmit(newRequest);
    }
    
    return newRequest;
  };
  
  // Update an existing request
  const updateRequest = (id: string, updates: Partial<DSRRequest>): DSRRequest | null => {
    let updatedRequest: DSRRequest | null = null;
    
    setRequests(prevRequests => {
      const index = prevRequests.findIndex(request => request.id === id);
      
      if (index === -1) {
        return prevRequests;
      }
      
      const request = prevRequests[index];
      updatedRequest = {
        ...request,
        ...updates,
        updatedAt: Date.now()
      };
      
      const newRequests = [...prevRequests];
      newRequests[index] = updatedRequest as DSRRequest;
      
      return newRequests;
    });
    
    if (updatedRequest && onUpdate) {
      onUpdate(updatedRequest);
    }
    
    return updatedRequest;
  };
  
  // Get a request by ID
  const getRequest = (id: string): DSRRequest | null => {
    return requests.find(request => request.id === id) || null;
  };
  
  // Get requests by status
  const getRequestsByStatus = (status: RequestStatus): DSRRequest[] => {
    return requests.filter(request => request.status === status);
  };
  
  // Get requests by type
  const getRequestsByType = (type: string): DSRRequest[] => {
    return requests.filter(request => request.type === type);
  };
  
  // Get the request type definition by ID
  const getRequestType = (typeId: string): RequestType | undefined => {
    return requestTypes.find(type => type.id === typeId);
  };
  
  // Format a request for display or submission
  const formatRequest = (request: DSRRequest): Record<string, any> => {
    const { formattedRequest } = formatDSRRequest(request);
    return formattedRequest;
  };
  
  // Clear all requests
  const clearRequests = () => {
    setRequests([]);
    
    if (useLocalStorage && typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
  };
  
  return {
    requests,
    submitRequest,
    updateRequest,
    getRequest,
    getRequestsByStatus,
    getRequestsByType,
    getRequestType,
    formatRequest,
    clearRequests
  };
}
