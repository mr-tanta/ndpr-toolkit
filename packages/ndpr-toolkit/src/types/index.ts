// Re-export all types from individual files
export * from './consent';
export * from './dsr';
export * from './dpia';
export * from './breach';
export * from './privacy';

// Additional shared types
export interface NDPRConfig {
  organizationName: string;
  organizationContact: string;
  defaultLanguage?: string;
  enableAnalytics?: boolean;
  consentOptions?: {
    position?: 'top' | 'bottom' | 'center';
    theme?: 'light' | 'dark' | 'auto';
  };
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export type EventHandler<T = void> = (data: T) => void | Promise<void>;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}