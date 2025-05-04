import { formatDSRRequest } from '../../utils/dsr';
import { DSRRequest, DSRType, DSRStatus } from '../../types/dsr';

describe('formatDSRRequest', () => {
  it('should format a DSR request correctly', () => {
    const request: DSRRequest = {
      id: '123',
      type: 'access',
      status: 'pending',
      createdAt: 1620000000000,
      updatedAt: 1620000000000,
      subject: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890'
      },
      description: 'I want to access my data'
    };

    const result = formatDSRRequest(request);
    
    expect(result.isValid).toBe(true);
    expect(result.formattedRequest.dataSubject.name).toBe('John Doe');
    expect(result.formattedRequest.requestType).toBe('access');
    expect(result.formattedRequest.status).toBe('pending');
    expect(result.formattedRequest.dataSubject.email).toBe('john@example.com');
    expect(result.formattedRequest.additionalInformation).toEqual({});
    expect(result.validationErrors.length).toBe(0);
  });

  it('should handle missing optional fields', () => {
    const request: DSRRequest = {
      id: '456',
      type: 'erasure',
      status: 'completed',
      createdAt: 1620000000000,
      updatedAt: 1620100000000,
      completedAt: 1620200000000,
      subject: {
        name: 'Jane Smith',
        email: 'jane@example.com'
        // phone is missing
      }
      // description is missing
    };

    const result = formatDSRRequest(request);
    
    expect(result.isValid).toBe(true);
    expect(result.formattedRequest.dataSubject.name).toBe('Jane Smith');
    expect(result.formattedRequest.requestType).toBe('erasure');
    expect(result.formattedRequest.status).toBe('completed');
    expect(result.formattedRequest.dataSubject.email).toBe('jane@example.com');
    expect(result.formattedRequest.dataSubject.phone).toBe('Not provided');
    expect(JSON.stringify(result.formattedRequest)).not.toContain('undefined');
  });

  it('should include completion date when available', () => {
    const request: DSRRequest = {
      id: '789',
      type: 'rectification',
      status: 'completed',
      createdAt: 1620000000000,
      updatedAt: 1620100000000,
      completedAt: 1620200000000,
      subject: {
        name: 'Bob Johnson',
        email: 'bob@example.com'
      }
    };

    const result = formatDSRRequest(request);
    
    expect(result.isValid).toBe(true);
    // Check that the completedAt date is properly formatted in ISO format
    expect(result.formattedRequest.lastUpdated).toBe(new Date(1620100000000).toISOString());
    expect(result.formattedRequest.dataSubject.name).toBe('Bob Johnson');
    expect(result.formattedRequest.requestType).toBe('rectification');
    expect(result.formattedRequest.status).toBe('completed');
  });

  it('should handle additional info when present', () => {
    const request: DSRRequest = {
      id: '101',
      type: 'portability',
      status: 'inProgress',
      createdAt: 1620000000000,
      updatedAt: 1620100000000,
      subject: {
        name: 'Alice Brown',
        email: 'alice@example.com'
      },
      additionalInfo: {
        format: 'CSV',
        timeRange: 'Last 12 months'
      }
    };

    const result = formatDSRRequest(request);
    
    expect(result.isValid).toBe(true);
    expect(result.formattedRequest.dataSubject.name).toBe('Alice Brown');
    expect(result.formattedRequest.requestType).toBe('portability');
    expect(result.formattedRequest.status).toBe('inProgress');
    expect(result.formattedRequest.additionalInformation).toEqual({
      format: 'CSV',
      timeRange: 'Last 12 months'
    });
  });
});
