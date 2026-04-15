import { formatDSRRequest } from '../../utils/dsr';
import { DSRRequest, DSRType, DSRStatus } from '../../types/dsr';

describe('formatDSRRequest (NDPA Part IV - Data Subject Rights)', () => {
  it('should format a DSR access request correctly per NDPA Section 30', () => {
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

  it('should handle NDPA Section 29 information request type', () => {
    const request: DSRRequest = {
      id: '201',
      type: 'information',
      status: 'pending',
      createdAt: 1620000000000,
      updatedAt: 1620000000000,
      subject: {
        name: 'Grace Obi',
        email: 'grace@example.com'
      },
      description: 'I want to know what data you hold about me'
    };

    const result = formatDSRRequest(request);

    expect(result.isValid).toBe(true);
    expect(result.formattedRequest.requestType).toBe('information');
    expect(result.formattedRequest.dataSubject.name).toBe('Grace Obi');
  });

  it('should handle NDPA Section 36 automated decision-making request type', () => {
    const request: DSRRequest = {
      id: '202',
      type: 'automated_decision_making',
      status: 'pending',
      createdAt: 1620000000000,
      updatedAt: 1620000000000,
      subject: {
        name: 'Emeka Nwankwo',
        email: 'emeka@example.com'
      },
      description: 'I want to understand decisions made about me by automated systems'
    };

    const result = formatDSRRequest(request);

    expect(result.isValid).toBe(true);
    expect(result.formattedRequest.requestType).toBe('automated_decision_making');
    expect(result.formattedRequest.dataSubject.name).toBe('Emeka Nwankwo');
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

  describe('null-pointer safety for request.subject', () => {
    it('should not throw when request.subject is undefined', () => {
      const request = {
        id: '301',
        type: 'access',
        status: 'pending',
        createdAt: 1620000000000,
        updatedAt: 1620000000000,
        subject: undefined
      } as unknown as DSRRequest;

      expect(() => formatDSRRequest(request)).not.toThrow();

      const result = formatDSRRequest(request);
      expect(result.isValid).toBe(false);
      expect(result.validationErrors).toContain('Data subject name is required');
      expect(result.validationErrors).toContain('Data subject email is required');
    });

    it('should not throw when request.subject is null', () => {
      const request = {
        id: '302',
        type: 'erasure',
        status: 'pending',
        createdAt: 1620000000000,
        updatedAt: 1620000000000,
        subject: null
      } as unknown as DSRRequest;

      expect(() => formatDSRRequest(request)).not.toThrow();

      const result = formatDSRRequest(request);
      expect(result.isValid).toBe(false);
      expect(result.validationErrors).toContain('Data subject name is required');
      expect(result.validationErrors).toContain('Data subject email is required');
    });

    it('should return validation errors when subject has empty fields', () => {
      const request: DSRRequest = {
        id: '303',
        type: 'rectification',
        status: 'pending',
        createdAt: 1620000000000,
        updatedAt: 1620000000000,
        subject: {
          name: '',
          email: ''
        }
      };

      expect(() => formatDSRRequest(request)).not.toThrow();

      const result = formatDSRRequest(request);
      expect(result.isValid).toBe(false);
      expect(result.validationErrors).toContain('Data subject name is required');
      expect(result.validationErrors).toContain('Data subject email is required');
    });

    it('should include all subject fields in formatted result when fully populated', () => {
      const request: DSRRequest = {
        id: '304',
        type: 'access',
        status: 'pending',
        createdAt: 1620000000000,
        updatedAt: 1620000000000,
        subject: {
          name: 'Adaeze Okoro',
          email: 'adaeze@example.com',
          phone: '+2348012345678',
          identifierType: 'NIN',
          identifierValue: '12345678901'
        }
      };

      const result = formatDSRRequest(request);
      expect(result.isValid).toBe(true);
      expect(result.validationErrors).toHaveLength(0);
      expect(result.formattedRequest.dataSubject).toEqual({
        name: 'Adaeze Okoro',
        email: 'adaeze@example.com',
        phone: '+2348012345678',
        identifier: {
          type: 'NIN',
          value: '12345678901'
        }
      });
    });

    it('should set dataSubject to undefined when request.subject is missing', () => {
      const request = {
        id: '305',
        type: 'portability',
        status: 'pending',
        createdAt: 1620000000000,
        updatedAt: 1620000000000,
        subject: undefined
      } as unknown as DSRRequest;

      const result = formatDSRRequest(request);
      expect(result.formattedRequest.dataSubject).toBeUndefined();
    });
  });
});
