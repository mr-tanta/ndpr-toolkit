'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function ManagingConsentGuide() {
  return (
    <DocLayout
      title="Managing Consent"
      description="Learn how to implement a complete consent management system with the NDPA 2023 Toolkit"
    >
      <div className="flex mb-6 space-x-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/ndpr-demos/consent">
            View Consent Demo
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/docs/components/consent-management">
            Consent Component Docs
          </Link>
        </Button>
      </div>
      
      <section id="introduction" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Introduction</h2>
        <p className="mb-4">
          Consent is a cornerstone of data protection under the Nigeria Data Protection Act (NDPA) 2023.
          Organizations must obtain valid consent before collecting, processing, or sharing personal data.
          This guide will help you implement a comprehensive consent management system using the NDPR Toolkit.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
          <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-2">NDPA 2023 Consent Requirements</h4>
          <p className="text-blue-700 dark:text-blue-300 text-sm mb-0">
            Under the NDPA 2023, valid consent must be:
          </p>
          <ul className="list-disc pl-6 mt-2 text-blue-700 dark:text-blue-300 text-sm">
            <li><strong>Freely given:</strong> Data subjects must have a genuine choice and control</li>
            <li><strong>Specific:</strong> Consent must be granular for different types of processing</li>
            <li><strong>Informed:</strong> Data subjects must understand what they&apos;re consenting to</li>
            <li><strong>Unambiguous:</strong> Consent must be given through a clear affirmative action</li>
            <li><strong>Withdrawable:</strong> Data subjects must be able to withdraw consent easily</li>
          </ul>
        </div>
      </section>

      <section id="consent-lifecycle" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">The Consent Lifecycle</h2>
        <p className="mb-4">
          A complete consent management system covers the entire lifecycle of consent, from collection to withdrawal. 
          The NDPR Toolkit provides components for each stage of this lifecycle:
        </p>
        
        <div className="relative border-l-2 border-blue-500 pl-8 pb-8 space-y-10">
          <div className="relative">
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">1</span>
            </div>
            <h3 className="text-xl font-bold">Consent Collection</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              The first step is collecting consent from data subjects. This typically happens when users first visit your website 
              or when they sign up for your service. The NDPR Toolkit&apos;s ConsentBanner component is designed for this purpose.
            </p>
            <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <h4 className="font-medium mb-2">Code Example</h4>
              <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
                <pre><code>{`import { ConsentBanner } from '@tantainnovative/ndpr-toolkit';

function App() {
  const consentOptions = [
    {
      id: 'necessary',
      label: 'Necessary Cookies',
      description: 'These cookies are essential for the website to function properly.',
      required: true
    },
    {
      id: 'analytics',
      label: 'Analytics Cookies',
      description: 'These cookies help us understand how visitors interact with our website.',
      required: false
    },
    {
      id: 'marketing',
      label: 'Marketing Cookies',
      description: 'These cookies are used to track visitors across websites to display relevant advertisements.',
      required: false
    }
  ];

  const handleSaveConsent = (consents) => {
    // Save consent preferences to your backend or local storage
    console.log('Consent preferences:', consents);
    
    // Example: Save to localStorage
    localStorage.setItem('userConsents', JSON.stringify(consents));
    
    // Example: Send to backend API
    fetch('/api/consents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(consents),
    });
  };

  return (
    <div>
      <ConsentBanner
        options={consentOptions}
        onSave={handleSaveConsent}
        privacyPolicyUrl="/privacy-policy"
        position="bottom"
        showCloseButton={false}
      />
      {/* Rest of your application */}
    </div>
  );
}`}</code></pre>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">2</span>
            </div>
            <h3 className="text-xl font-bold">Consent Storage</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Once collected, consent preferences must be securely stored and easily retrievable. The NDPR Toolkit provides 
              utilities for storing consent in various formats, including local storage, cookies, and server-side databases.
            </p>
            <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <h4 className="font-medium mb-2">Code Example</h4>
              <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
                <pre><code>{`import { ConsentStorage } from '@tantainnovative/ndpr-toolkit';

// Create a consent storage instance
const consentStorage = new ConsentStorage({
  storageType: 'localStorage', // or 'cookie', 'indexedDB', 'api'
  apiEndpoint: '/api/consents', // Only required for 'api' storage type
  cookieOptions: {             // Only required for 'cookie' storage type
    domain: 'example.com',
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 365 // 1 year in seconds
  }
});

// Save consent
function saveConsent(userId, consents) {
  return consentStorage.saveConsent(userId, consents);
}

// Retrieve consent
async function getConsent(userId) {
  return await consentStorage.getConsent(userId);
}

// Example usage
const userId = 'user123';
const consents = {
  necessary: true,
  analytics: true,
  marketing: false,
  timestamp: new Date().toISOString(),
  version: '1.0'
};

saveConsent(userId, consents);

// Later, retrieve the consent
getConsent(userId).then(savedConsents => {
  console.log('Retrieved consents:', savedConsents);
});`}</code></pre>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">3</span>
            </div>
            <h3 className="text-xl font-bold">Consent Verification</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Before processing personal data, you must verify that the user has given consent for the specific processing activity. 
              The NDPR Toolkit provides utilities for checking consent status.
            </p>
            <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <h4 className="font-medium mb-2">Code Example</h4>
              <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
                <pre><code>{`import { useConsent } from '@tantainnovative/ndpr-toolkit';

function AnalyticsComponent() {
  const { hasConsent, isLoading } = useConsent('analytics');
  
  useEffect(() => {
    if (!isLoading && hasConsent) {
      // Initialize analytics only if user has given consent
      initializeAnalytics();
    }
  }, [hasConsent, isLoading]);
  
  if (isLoading) {
    return <div>Loading consent preferences...</div>;
  }
  
  if (!hasConsent) {
    return (
      <div>
        <p>Analytics are disabled based on your consent preferences.</p>
        <button onClick={() => openConsentManager()}>
          Update Preferences
        </button>
      </div>
    );
  }
  
  return <div>Analytics are enabled and tracking your usage.</div>;
}

function MarketingComponent() {
  const { hasConsent, isLoading } = useConsent('marketing');
  
  // Similar implementation for marketing features
}`}</code></pre>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">4</span>
            </div>
            <h3 className="text-xl font-bold">Consent Management</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Data subjects must be able to view and update their consent preferences at any time. The NDPR Toolkit&apos;s 
              ConsentManager component provides a user interface for managing consent preferences.
            </p>
            <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <h4 className="font-medium mb-2">Code Example</h4>
              <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
                <pre><code>{`import { ConsentManager } from '@tantainnovative/ndpr-toolkit';

function PrivacySettingsPage() {
  const consentOptions = [
    {
      id: 'necessary',
      label: 'Necessary Cookies',
      description: 'These cookies are essential for the website to function properly.',
      required: true
    },
    {
      id: 'analytics',
      label: 'Analytics Cookies',
      description: 'These cookies help us understand how visitors interact with our website.',
      required: false
    },
    {
      id: 'marketing',
      label: 'Marketing Cookies',
      description: 'These cookies are used to track visitors across websites to display relevant advertisements.',
      required: false
    }
  ];

  const handleSaveConsent = (consents) => {
    // Save updated consent preferences
    console.log('Updated consent preferences:', consents);
    
    // Example: Save to localStorage
    localStorage.setItem('userConsents', JSON.stringify(consents));
    
    // Example: Send to backend API
    fetch('/api/consents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(consents),
    });
  };

  return (
    <div>
      <h1>Privacy Settings</h1>
      <p>
        Manage your consent preferences for how we use your data.
        You can change these settings at any time.
      </p>
      
      <ConsentManager
        options={consentOptions}
        onSave={handleSaveConsent}
        initialValues={JSON.parse(localStorage.getItem('userConsents') || '{}')}
      />
    </div>
  );
}`}</code></pre>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">5</span>
            </div>
            <h3 className="text-xl font-bold">Consent Records</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              For compliance purposes, you must maintain records of consent, including when and how consent was given or withdrawn. 
              The NDPR Toolkit provides utilities for maintaining detailed consent records.
            </p>
            <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <h4 className="font-medium mb-2">Code Example</h4>
              <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
                <pre><code>{`import { ConsentRecorder } from '@tantainnovative/ndpr-toolkit';

// Create a consent recorder instance
const consentRecorder = new ConsentRecorder({
  storageType: 'api',
  apiEndpoint: '/api/consent-records'
});

// Record a consent event
function recordConsentEvent(userId, event) {
  const consentEvent = {
    userId,
    eventType: event.type, // 'given', 'updated', 'withdrawn'
    consents: event.consents,
    timestamp: new Date().toISOString(),
    source: event.source, // 'banner', 'settings', 'account-deletion', etc.
    ipAddress: event.ipAddress,
    userAgent: event.userAgent,
    version: event.version
  };
  
  return consentRecorder.recordEvent(consentEvent);
}

// Example usage
const userId = 'user123';
const consentEvent = {
  type: 'given',
  consents: {
    necessary: true,
    analytics: true,
    marketing: false
  },
  source: 'banner',
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  version: '1.0'
};

recordConsentEvent(userId, consentEvent);

// Retrieve consent history for a user
consentRecorder.getEventHistory(userId).then(history => {
  console.log('Consent history:', history);
});`}</code></pre>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">6</span>
            </div>
            <h3 className="text-xl font-bold">Consent Withdrawal</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Data subjects must be able to withdraw their consent as easily as they gave it. The NDPR Toolkit provides 
              components and utilities for handling consent withdrawal.
            </p>
            <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <h4 className="font-medium mb-2">Implementation Tip</h4>
              <p className="text-sm">
                When a user withdraws consent, you must stop processing their data for the purposes they&apos;ve withdrawn consent for. 
                This may include deleting data or disabling certain features. Make sure your application architecture supports 
                this granular control.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="complete-implementation" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Complete Implementation Example</h2>
        <p className="mb-4">
          Here&apos;s a complete example of how to implement a consent management system using the NDPR Toolkit:
        </p>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`import { useState, useEffect } from 'react';
import { 
  ConsentBanner, 
  ConsentManager,
  ConsentStorage,
  ConsentRecorder,
  ConsentContext,
  useConsent
} from '@tantainnovative/ndpr-toolkit';

// Define consent options
const consentOptions = [
  {
    id: 'necessary',
    label: 'Necessary Cookies',
    description: 'These cookies are essential for the website to function properly.',
    required: true
  },
  {
    id: 'analytics',
    label: 'Analytics Cookies',
    description: 'These cookies help us understand how visitors interact with our website.',
    required: false
  },
  {
    id: 'marketing',
    label: 'Marketing Cookies',
    description: 'These cookies are used to track visitors across websites to display relevant advertisements.',
    required: false
  },
  {
    id: 'personalization',
    label: 'Personalization',
    description: 'These cookies allow us to provide personalized content and recommendations.',
    required: false
  }
];

// Create storage and recorder instances
const consentStorage = new ConsentStorage({ storageType: 'localStorage' });
const consentRecorder = new ConsentRecorder({ storageType: 'api', apiEndpoint: '/api/consent-records' });

// Main application with consent management
function App() {
  const [userId, setUserId] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [consents, setConsents] = useState(null);
  
  useEffect(() => {
    // Generate or retrieve user ID
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const newUserId = \`user_\${Date.now()}\`;
      localStorage.setItem('userId', newUserId);
      setUserId(newUserId);
    }
  }, []);
  
  useEffect(() => {
    if (userId) {
      // Check if user has already given consent
      consentStorage.getConsent(userId).then(storedConsents => {
        if (storedConsents) {
          setConsents(storedConsents);
        } else {
          // No stored consents, show the banner
          setShowBanner(true);
        }
      });
    }
  }, [userId]);
  
  const handleSaveConsent = (newConsents) => {
    // Save the consent preferences
    setConsents(newConsents);
    consentStorage.saveConsent(userId, newConsents);
    
    // Record the consent event
    const eventType = consents ? 'updated' : 'given';
    consentRecorder.recordEvent({
      userId,
      eventType,
      consents: newConsents,
      timestamp: new Date().toISOString(),
      source: eventType === 'given' ? 'banner' : 'settings',
      userAgent: navigator.userAgent,
      version: '1.0'
    });
    
    // Hide the banner ifit&apos;s showing
    setShowBanner(false);
  };
  
  const openConsentManager = () => {
    // Open a modal with the consent manager
    setShowConsentManager(true);
  };
  
  const [showConsentManager, setShowConsentManager] = useState(false);
  
  return (
    <ConsentContext.Provider value={{ consents, openConsentManager }}>
      <div className="app">
        <header>
          <h1>My NDPA-Compliant Website</h1>
          <nav>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/about">About</a></li>
              <li><a href="/contact">Contact</a></li>
              <li>
                <button onClick={openConsentManager}>
                  Privacy Settings
                </button>
              </li>
            </ul>
          </nav>
        </header>
        
        <main>
          {/* Main content of your application */}
          <HomePage />
        </main>
        
        <footer>
          <p>© 2023 My Company</p>
          <button onClick={openConsentManager}>
            Manage Cookie Preferences
          </button>
        </footer>
        
        {/* Consent banner */}
        {showBanner && (
          <ConsentBanner
            options={consentOptions}
            onSave={handleSaveConsent}
            privacyPolicyUrl="/privacy-policy"
            position="bottom"
            showCloseButton={false}
          />
        )}
        
        {/* Consent manager modal */}
        {showConsentManager && (
          <div className="modal">
            <div className="modal-content">
              <h2>Privacy Settings</h2>
              <ConsentManager
                options={consentOptions}
                onSave={(newConsents) => {
                  handleSaveConsent(newConsents);
                  setShowConsentManager(false);
                }}
                initialValues={consents || {}}
                onCancel={() => setShowConsentManager(false)}
              />
            </div>
          </div>
        )}
      </div>
    </ConsentContext.Provider>
  );
}

// Example component that uses consent
function HomePage() {
  const { hasConsent: hasAnalyticsConsent } = useConsent('analytics');
  const { hasConsent: hasMarketingConsent } = useConsent('marketing');
  const { hasConsent: hasPersonalizationConsent } = useConsent('personalization');
  const { openConsentManager } = useConsent();
  
  useEffect(() => {
    if (hasAnalyticsConsent) {
      // Initialize analytics
      console.log('Initializing analytics...');
    }
  }, [hasAnalyticsConsent]);
  
  useEffect(() => {
    if (hasMarketingConsent) {
      // Initialize marketing tools
      console.log('Initializing marketing tools...');
    }
  }, [hasMarketingConsent]);
  
  return (
    <div>
      <h2>Welcome to our website</h2>
      
      {hasPersonalizationConsent ? (
        <div>
          <h3>Personalized Content</h3>
          <p>Here&apos;s some content tailored just for you!</p>
        </div>
      ) : (
        <div>
          <h3>Standard Content</h3>
          <p>
            Enable personalization to see content tailored to your interests.
            <button onClick={openConsentManager}>
              Update Privacy Settings
            </button>
          </p>
        </div>
      )}
      
      {/* More content... */}
    </div>
  );
}`}</code></pre>
        </div>
      </section>

      <section id="best-practices" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2">No Pre-checked Boxes</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Never use pre-checked boxes for optional consent options. The NDPA 2023 requires that consent be given through
                a clear affirmative action, and pre-checked boxes do not meet this requirement.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2">Clear Language</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Use clear, plain language to explain what data you&apos;re collecting, why you&apos;re collecting it, and how it will be used. 
                Avoid legal jargon that may confuse users.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2">Granular Consent</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Provide granular consent options for different types of processing. don&apos;t bundle multiple purposes into a single 
                consent option. This allows users to consent to some types of processing but not others.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2">Easy Withdrawal</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Make it as easy to withdraw consent as it is to give it. Provide a clear, accessible way for users to 
                update their consent preferences at any time.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2">Record Keeping</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Maintain detailed records of consent, including when and how consent was given or withdrawn. This is essential 
                for demonstrating compliance with the NDPA 2023.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2">Regular Review</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Regularly review and update your consent mechanisms to ensure they remain compliant with the NDPA 2023 and
                effective for your users. Consider conducting user testing to ensure your consent mechanisms are clear and usable.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="common-pitfalls" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Common Pitfalls to Avoid</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Cookie Walls:</strong> Blocking access to your website unless users accept all cookies is generally not 
            considered valid consent under the NDPA 2023, as it doesn&apos;t give users a genuine choice.
          </li>
          <li>
            <strong>Bundling Consent:</strong> Requiring users to consent to multiple unrelated purposes as a package deal 
            is not compliant with the NDPA 2023&apos;s requirement for specific consent.
          </li>
          <li>
            <strong>Ignoring Consent:</strong> Loading tracking scripts or cookies before obtaining consent is a common 
            mistake that violates the NDPA 2023&apos;s requirement for valid consent.
          </li>
          <li>
            <strong>Unclear Language:</strong> Using vague or technical language that users may not understand undermines 
            the &apos;informed&apos; aspect of valid consent.
          </li>
          <li>
            <strong>Difficult Withdrawal:</strong> Making it difficult for users to withdraw consent, such as by hiding 
            the option in a complex settings menu, is not compliant with the NDPA 2023&apos;s requirement for withdrawable consent.
          </li>
          <li>
            <strong>Inadequate Records:</strong> Failing to maintain adequate records of consent can make it difficult to 
            demonstrate compliance with the NDPA 2023&apos;s requirement for record-keeping.
          </li>
        </ul>
      </section>

      <section id="resources" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Additional Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">NDPA 2023 Official Text</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                Official text of the Nigeria Data Protection Act 2023, including consent requirements.
              </p>
              <Button asChild variant="outline" size="sm">
                <a href="https://ndpc.gov.ng/" target="_blank" rel="noopener noreferrer">
                  View Act
                </a>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Consent Component Documentation</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                Technical documentation for the Consent Management components.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/docs/components/consent-management">
                  View Documentation
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </DocLayout>
  );
}
