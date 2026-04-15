import { DSRRequest } from '../types/dsr';

/**
 * Formats a DSR request for display or submission
 * @param request The DSR request to format
 * @returns Formatted request data
 */
export function formatDSRRequest(request: DSRRequest): {
  formattedRequest: Record<string, any>;
  isValid: boolean;
  validationErrors: string[];
} {
  const validationErrors: string[] = [];
  
  // Validate required fields
  if (!request.id) {
    validationErrors.push('Request ID is required');
  }
  
  if (!request.type) {
    validationErrors.push('Request type is required');
  }
  
  if (!request.status) {
    validationErrors.push('Request status is required');
  }
  
  if (!request.createdAt) {
    validationErrors.push('Creation timestamp is required');
  }
  
  if (!request.subject?.name) {
    validationErrors.push('Data subject name is required');
  }
  
  if (!request.subject?.email) {
    validationErrors.push('Data subject email is required');
  }
  
  // Format the request for display or submission
  const formattedRequest = {
    requestId: request.id,
    requestType: request.type,
    status: request.status,
    createdDate: new Date(request.createdAt).toISOString(),
    lastUpdated: request.updatedAt ? new Date(request.updatedAt).toISOString() : undefined,
    dueDate: request.dueDate 
      ? new Date(request.dueDate).toISOString() 
      : undefined,
    dataSubject: request.subject ? {
      name: request.subject.name,
      email: request.subject.email,
      phone: request.subject.phone || 'Not provided',
      identifier: {
        type: request.subject.identifierType || 'Not specified',
        value: request.subject.identifierValue || 'Not provided'
      }
    } : undefined,
    additionalInformation: request.additionalInfo || {},
    verificationStatus: request.verification 
      ? `${request.verification.verified ? 'Verified' : 'Not verified'}${request.verification.method ? ` via ${request.verification.method}` : ''}`
      : 'Pending verification',
    attachments: request.attachments 
      ? request.attachments.map(attachment => ({
          name: attachment.name,
          type: attachment.type,
          addedOn: new Date(attachment.addedAt).toISOString()
        }))
      : []
  };
  
  return {
    formattedRequest,
    isValid: validationErrors.length === 0,
    validationErrors
  };
}
