import { useState, useEffect, useCallback, useRef } from 'react';
import { DSRRequest, RequestStatus, RequestType } from '../types/dsr';
import { formatDSRRequest } from '../utils/dsr';
import type { StorageAdapter } from '../adapters/types';
import { localStorageAdapter } from '../adapters/local-storage';

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
   * Pluggable storage adapter. When provided, takes precedence over storageKey/useLocalStorage.
   */
  adapter?: StorageAdapter<DSRRequest[]>;

  /**
   * Storage key for requests
   * @default "ndpr_dsr_requests"
   * @deprecated Use adapter instead
   */
  storageKey?: string;

  /**
   * Whether to use local storage to persist requests
   * @default true
   * @deprecated Use adapter instead
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

export interface UseDSRReturn {
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
  formatRequest: (request: DSRRequest) => Record<string, unknown>;

  /**
   * Clear all requests
   */
  clearRequests: () => void;

  /**
   * Whether the adapter is still loading data (relevant for async adapters)
   */
  isLoading: boolean;
}

function resolveAdapter(storageKey: string, useLocalStorage: boolean): StorageAdapter<DSRRequest[]> {
  if (!useLocalStorage) {
    return { load: () => null, save: () => {}, remove: () => {} };
  }
  return localStorageAdapter<DSRRequest[]>(storageKey);
}

/**
 * Hook for managing Data Subject Requests in compliance with the NDPA
 */
export function useDSR({
  initialRequests = [],
  requestTypes,
  adapter,
  storageKey = 'ndpr_dsr_requests',
  useLocalStorage = true,
  onSubmit,
  onUpdate,
}: UseDSROptions): UseDSRReturn {
  const resolvedAdapter = adapter ?? resolveAdapter(storageKey, useLocalStorage);
  const adapterRef = useRef(resolvedAdapter);
  adapterRef.current = resolvedAdapter;

  const [requests, setRequests] = useState<DSRRequest[]>(initialRequests);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load requests from storage on mount
  useEffect(() => {
    let cancelled = false;

    try {
      const result = adapterRef.current.load();

      if (result instanceof Promise) {
        result.then(
          (loaded) => {
            if (cancelled) return;
            if (loaded) setRequests(loaded);
            setIsLoading(false);
          },
          () => {
            if (!cancelled) setIsLoading(false);
          }
        );
      } else {
        if (result) setRequests(result);
        setIsLoading(false);
      }
    } catch {
      if (!cancelled) setIsLoading(false);
    }

    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist requests whenever they change (fire-and-forget)
  const persistRequests = useCallback((updated: DSRRequest[]) => {
    Promise.resolve(adapterRef.current.save(updated)).catch((err) => {
      console.warn('[ndpr-toolkit] Failed to save DSR requests:', err);
    });
  }, []);

  // Generate a unique ID
  const generateId = (): string => {
    return 'dsr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  // Submit a new request
  const submitRequest = useCallback((requestData: Omit<DSRRequest, 'id' | 'status' | 'submittedAt' | 'updatedAt' | 'estimatedCompletionDate'>): DSRRequest => {
    // Find the request type to get the estimated completion time
    const requestType = requestTypes.find(type => type.id === requestData.type);
    const estimatedCompletionDays = requestType?.estimatedCompletionTime || 30; // Default to 30 days

    const now = Date.now();
    const estimatedCompletionDate = now + (estimatedCompletionDays * 24 * 60 * 60 * 1000);

    // Extract any properties we want to override from requestData
    const { createdAt, ...restRequestData } = requestData as Omit<DSRRequest, 'id' | 'status' | 'submittedAt' | 'updatedAt' | 'estimatedCompletionDate'> & { createdAt?: number };

    const newRequest: DSRRequest = {
      id: generateId(),
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      dueDate: estimatedCompletionDate,
      ...restRequestData,
    };

    setRequests(prevRequests => {
      const updated = [...prevRequests, newRequest];
      persistRequests(updated);
      return updated;
    });

    if (onSubmit) {
      onSubmit(newRequest);
    }

    return newRequest;
  }, [requestTypes, persistRequests, onSubmit]);

  // Update an existing request
  const updateRequest = useCallback((id: string, updates: Partial<DSRRequest>): DSRRequest | null => {
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
        updatedAt: Date.now(),
      };

      const newRequests = [...prevRequests];
      newRequests[index] = updatedRequest as DSRRequest;
      persistRequests(newRequests);
      return newRequests;
    });

    if (updatedRequest && onUpdate) {
      onUpdate(updatedRequest);
    }

    return updatedRequest;
  }, [persistRequests, onUpdate]);

  // Get a request by ID
  const getRequest = useCallback((id: string): DSRRequest | null => {
    return requests.find(request => request.id === id) || null;
  }, [requests]);

  // Get requests by status
  const getRequestsByStatus = useCallback((status: RequestStatus): DSRRequest[] => {
    return requests.filter(request => request.status === status);
  }, [requests]);

  // Get requests by type
  const getRequestsByType = useCallback((type: string): DSRRequest[] => {
    return requests.filter(request => request.type === type);
  }, [requests]);

  // Get the request type definition by ID
  const getRequestType = useCallback((typeId: string): RequestType | undefined => {
    return requestTypes.find(type => type.id === typeId);
  }, [requestTypes]);

  // Format a request for display or submission
  const formatRequest = useCallback((request: DSRRequest): Record<string, unknown> => {
    const { formattedRequest } = formatDSRRequest(request);
    return formattedRequest;
  }, []);

  // Clear all requests
  const clearRequests = useCallback(() => {
    setRequests([]);
    Promise.resolve(adapterRef.current.remove()).catch((err) => {
      console.warn('[ndpr-toolkit] Failed to remove DSR requests:', err);
    });
  }, [adapterRef]);

  return {
    requests,
    submitRequest,
    updateRequest,
    getRequest,
    getRequestsByStatus,
    getRequestsByType,
    getRequestType,
    formatRequest,
    clearRequests,
    isLoading,
  };
}
