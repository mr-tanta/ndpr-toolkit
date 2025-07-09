// Test TypeScript imports and types
import type { ConsentOption, DSRRequest, BreachReport } from '@tantainnovative/ndpr-toolkit/packages/ndpr-toolkit/dist';

// Test that types are properly defined
const testConsent: ConsentOption = {
  id: 'analytics',
  label: 'Analytics Cookies',
  description: 'Help us understand how you use our website',
  required: false
};

console.log('✅ TypeScript types are working correctly');
console.log('Test consent option:', testConsent);