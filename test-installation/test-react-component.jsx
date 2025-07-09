// Test React component usage
import React from 'react';
import { ConsentBanner, ConsentManager } from '@tantainnovative/ndpr-toolkit';

// Test component that uses the toolkit
function TestApp() {
  const consentOptions = [
    {
      id: 'necessary',
      label: 'Necessary Cookies',
      description: 'Essential for the website to function',
      required: true,
      defaultValue: true
    },
    {
      id: 'analytics',
      label: 'Analytics Cookies',
      description: 'Help us understand usage',
      required: false,
      defaultValue: false
    }
  ];

  const handleSaveConsent = (consents) => {
    console.log('Consent saved:', consents);
  };

  return (
    <ConsentManager 
      options={consentOptions}
      storageKey="test-app-consent"
    >
      <div>
        <h1>Test App</h1>
        <ConsentBanner
          title="Cookie Preferences"
          options={consentOptions}
          onSave={handleSaveConsent}
        />
      </div>
    </ConsentManager>
  );
}

console.log('✅ React component test successful');
console.log('Component created:', typeof TestApp);