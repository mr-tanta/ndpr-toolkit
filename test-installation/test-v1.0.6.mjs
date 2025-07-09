// Test ESM imports for version 1.0.6
import { 
  ConsentBanner, 
  ConsentManager,
  DSRRequestForm,
  PolicyGenerator,
  useConsent 
} from '@tantainnovative/ndpr-toolkit';

console.log('Testing ESM imports for @tantainnovative/ndpr-toolkit v1.0.6...\n');

console.log('✅ ESM imports successful');
console.log('   ConsentBanner:', typeof ConsentBanner);
console.log('   ConsentManager:', typeof ConsentManager);
console.log('   DSRRequestForm:', typeof DSRRequestForm);
console.log('   PolicyGenerator:', typeof PolicyGenerator);
console.log('   useConsent:', typeof useConsent);

console.log('\n📦 ESM test complete!');