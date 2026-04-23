import { renderHook, act } from '@testing-library/react';
import { useDSR } from '../../hooks/useDSR';
import React from 'react';
import { DSRRequest, RequestType } from '../../types/dsr';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('useDSR (NDPA Data Subject Rights Hook)', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  const mockRequestTypes: RequestType[] = [
    {
      id: 'access',
      name: 'Access Request',
      description: 'Request to access your personal data',
      estimatedCompletionTime: 30,
      requiresAdditionalInfo: false
    },
    {
      id: 'erasure',
      name: 'Erasure Request',
      description: 'Request to delete your personal data',
      estimatedCompletionTime: 45,
      requiresAdditionalInfo: false
    },
    {
      id: 'rectification',
      name: 'Rectification Request',
      description: 'Request to correct your personal data',
      estimatedCompletionTime: 15,
      requiresAdditionalInfo: true
    }
  ];

  it('should initialize with empty requests array', () => {
    const { result } = renderHook(() => useDSR({
      requestTypes: mockRequestTypes,
      storageKey: 'test-dsr',
      useLocalStorage: true
    }));

    expect(result.current.requests).toEqual([]);
  });

  it('should submit a new DSR request per NDPA Part IV', () => {
    const { result } = renderHook(() => useDSR({
      requestTypes: mockRequestTypes,
      storageKey: 'test-dsr',
      useLocalStorage: true
    }));

    act(() => {
      result.current.submitRequest({
        type: 'access',
        subject: {
          name: 'John Doe',
          email: 'john@example.com',
        },
        createdAt: Date.now(),
        description: 'I want to access my data',
      });
    });

    expect(result.current.requests.length).toBe(1);
    expect(result.current.requests[0].type).toBe('access');
    expect(result.current.requests[0].status).toBe('pending');
    expect(result.current.requests[0].subject.name).toBe('John Doe');
    expect(result.current.requests[0].id).toBeDefined();
    expect(result.current.requests[0].createdAt).toBeDefined();
    expect(result.current.requests[0].updatedAt).toBeDefined();
  });

  it('should get a request by ID', () => {
    const { result } = renderHook(() => useDSR({
      requestTypes: mockRequestTypes,
      storageKey: 'test-dsr',
      useLocalStorage: true
    }));

    // Initialize requestId with a default value
    let requestId: string = '';

    act(() => {
      const request = result.current.submitRequest({
        type: 'access',
        subject: {
          name: 'John Doe',
          email: 'john@example.com',
        },
        createdAt: Date.now(),
      });
      requestId = request.id;
    });

    const retrievedRequest = result.current.getRequest(requestId);
    expect(retrievedRequest).toBeDefined();
    expect(retrievedRequest?.id).toBe(requestId);
  });

  it('should update a request', () => {
    const { result } = renderHook(() => useDSR({
      requestTypes: mockRequestTypes,
      storageKey: 'test-dsr',
      useLocalStorage: true
    }));

    let requestId = '';

    act(() => {
      const request = result.current.submitRequest({
        type: 'access',
        subject: {
          name: 'John Doe',
          email: 'john@example.com',
        },
        createdAt: Date.now(),
      });
      requestId = request.id;
    });

    act(() => {
      result.current.updateRequest(requestId!, {
        status: 'inProgress',
        internalNotes: [
          {
            timestamp: Date.now(),
            author: 'Admin',
            note: 'Working on this request',
          },
        ],
      });
    });

    const updatedRequest = result.current.getRequest(requestId!);
    expect(updatedRequest?.status).toBe('inProgress');
    expect(updatedRequest?.internalNotes?.length).toBe(1);
    expect(updatedRequest?.internalNotes?.[0].author).toBe('Admin');
  });

  it('should clear all requests', () => {
    const { result } = renderHook(() => useDSR({
      requestTypes: mockRequestTypes,
      storageKey: 'test-dsr',
      useLocalStorage: true
    }));

    act(() => {
      result.current.submitRequest({
        type: 'access',
        subject: {
          name: 'John Doe',
          email: 'john@example.com',
        },
        createdAt: Date.now(),
      });
    });

    expect(result.current.requests.length).toBe(1);

    act(() => {
      result.current.clearRequests();
    });

    expect(result.current.requests.length).toBe(0);
  });

  it('should filter requests by type', () => {
    const { result } = renderHook(() => useDSR({
      requestTypes: mockRequestTypes,
      storageKey: 'test-dsr',
      useLocalStorage: true
    }));

    act(() => {
      result.current.submitRequest({
        type: 'access',
        subject: {
          name: 'John Doe',
          email: 'john@example.com',
        },
        createdAt: Date.now(),
      });

      result.current.submitRequest({
        type: 'erasure',
        subject: {
          name: 'Jane Smith',
          email: 'jane@example.com',
        },
        createdAt: Date.now(),
      });

      result.current.submitRequest({
        type: 'access',
        subject: {
          name: 'Bob Johnson',
          email: 'bob@example.com',
        },
        createdAt: Date.now(),
      });
    });

    const accessRequests = result.current.getRequestsByType('access');
    expect(accessRequests.length).toBe(2);
    expect(accessRequests[0].subject.name).toBe('John Doe');
    expect(accessRequests[1].subject.name).toBe('Bob Johnson');

    const erasureRequests = result.current.getRequestsByType('erasure');
    expect(erasureRequests.length).toBe(1);
    expect(erasureRequests[0].subject.name).toBe('Jane Smith');
  });

  it('should filter requests by status', () => {
    const { result } = renderHook(() => useDSR({
      requestTypes: mockRequestTypes,
      storageKey: 'test-dsr',
      useLocalStorage: true
    }));

    let requestId: string = '';

    act(() => {
      result.current.submitRequest({
        type: 'access',
        subject: {
          name: 'John Doe',
          email: 'john@example.com',
        },
        createdAt: Date.now(),
      });

      const request = result.current.submitRequest({
        type: 'erasure',
        subject: {
          name: 'Jane Smith',
          email: 'jane@example.com',
        },
        createdAt: Date.now(),
      });
      requestId = request.id;

      result.current.submitRequest({
        type: 'rectification',
        subject: {
          name: 'Bob Johnson',
          email: 'bob@example.com',
        },
        createdAt: Date.now(),
      });
    });

    act(() => {
      result.current.updateRequest(requestId!, {
        status: 'completed',
      });
    });

    const pendingRequests = result.current.getRequestsByStatus('pending');
    expect(pendingRequests.length).toBe(2);

    const completedRequests = result.current.getRequestsByStatus('completed');
    expect(completedRequests.length).toBe(1);
    expect(completedRequests[0].subject.name).toBe('Jane Smith');
  });

  it('should format a request', () => {
    const { result } = renderHook(() => useDSR({
      requestTypes: mockRequestTypes,
      storageKey: 'test-dsr',
      useLocalStorage: true
    }));

    let request: DSRRequest | null = null;

    act(() => {
      request = result.current.submitRequest({
        type: 'access',
        subject: {
          name: 'John Doe',
          email: 'john@example.com',
        },
        createdAt: Date.now(),
      });
    });

    expect(request).not.toBeNull();
    
    if (request) {
      const formattedRequest = result.current.formatRequest(request);
      expect(formattedRequest).toBeDefined();
      expect(formattedRequest.requestType).toBe('access');
      expect((formattedRequest.dataSubject as { name: string }).name).toBe('John Doe');
    }
  });

  it('should get request type by ID', () => {
    const { result } = renderHook(() => useDSR({
      requestTypes: mockRequestTypes,
      storageKey: 'test-dsr',
      useLocalStorage: true
    }));

    const requestType = result.current.getRequestType('access');
    expect(requestType).toBeDefined();
    expect(requestType?.name).toBe('Access Request');
    expect(requestType?.estimatedCompletionTime).toBe(30);
  });
});
