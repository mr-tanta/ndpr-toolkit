// Test TypeScript types for version 1.0.6
import { 
  ConsentOption, 
  DSRRequest, 
  BreachReport
} from '@tantainnovative/ndpr-toolkit';

// Test type definitions
const testConsent: ConsentOption = {
  id: 'analytics',
  label: 'Analytics Cookies',
  description: 'Help us understand usage',
  required: false,
  defaultValue: false
};

const testDSR: Partial<DSRRequest> = {
  id: '123',
  type: 'access',
  status: 'pending',
  subject: {
    name: 'John Doe',
    email: 'john@example.com'
  }
};

const testBreach: Partial<BreachReport> = {
  id: '456',
  title: 'Test Breach',
  affectedDataSubjects: 10,
  category: 'unauthorized-access'
};

console.log('✅ TypeScript types compile successfully');
console.log('Test objects created:', {
  consent: testConsent.id,
  dsr: testDSR.type,
  breach: testBreach.title
});