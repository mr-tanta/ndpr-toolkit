'use client';

import { DataSubjectRequest, RequestStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { storage } from './storage';

const REQUEST_STORAGE_KEY = 'ndpr_requests';

const getStoredRequests = (): DataSubjectRequest[] => {
  return storage.getItem<DataSubjectRequest[]>(REQUEST_STORAGE_KEY, []) || [];
};

export const requestService = {
  createRequest: (
    requestType: DataSubjectRequest['requestType'],
    requesterName: string,
    requesterEmail: string,
    details: string,
    consent: boolean
  ): DataSubjectRequest => {
    const request: DataSubjectRequest = {
      id: uuidv4(),
      requestType,
      requesterId: uuidv4(),
      requesterEmail,
      requesterName,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      hasConsent: consent,
      notes: details,
    };

    const requests = getStoredRequests();
    requests.push(request);
    const saved = storage.setItem(REQUEST_STORAGE_KEY, requests);
    
    if (!saved) {
      throw new Error('Failed to save request. Storage may be full or unavailable.');
    }

    return request;
  },

  updateStatus: (id: string, status: RequestStatus): DataSubjectRequest | null => {
    const requests = getStoredRequests();
    const idx = requests.findIndex(r => r.id === id);
    if (idx === -1) return null;
    
    requests[idx].status = status;
    requests[idx].updatedAt = new Date().toISOString();
    
    const saved = storage.setItem(REQUEST_STORAGE_KEY, requests);
    if (!saved) {
      throw new Error('Failed to update request status.');
    }
    
    return requests[idx];
  },

  getRequest: (id: string): DataSubjectRequest | null => {
    const requests = getStoredRequests();
    return requests.find(r => r.id === id) || null;
  },

  getAllRequests: (): DataSubjectRequest[] => {
    return getStoredRequests();
  },

  clear: (): boolean => {
    return storage.removeItem(REQUEST_STORAGE_KEY);
  },
};

export default requestService;
