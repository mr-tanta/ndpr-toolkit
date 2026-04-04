import { DSRRequest, RequestStatus, RequestType } from '../types/dsr';
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
export declare function useDSR({ initialRequests, requestTypes, storageKey, useLocalStorage, onSubmit, onUpdate }: UseDSROptions): UseDSRReturn;
export {};
