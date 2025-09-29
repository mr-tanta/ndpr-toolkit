'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ConsentBanner, ConsentManager, consentStorage } from '@tantainnovative/ndpr-toolkit';
import type { ConsentOption } from '@/types';

// Define ConsentSettings type locally since it's used in the demo
interface ConsentSettings {
  consents: Record<string, boolean>;
  timestamp: number;
  version: string;
  method: string;
  hasInteracted: boolean;
}
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ConsentDemoPage() {
  const [activeTab, setActiveTab] = useState('banner');
  const [isClient, setIsClient] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [consentSettings, setConsentSettings] = useState<ConsentSettings | null>(null);
  
  // Define consent options
  const consentOptions: ConsentOption[] = [
    {
      id: 'necessary',
      label: 'Necessary',
      description: 'Essential cookies required for the website to function properly',
      required: true
    },
    {
      id: 'analytics',
      label: 'Analytics',
      description: 'Cookies that help us analyze how you use our website to improve your experience',
      required: false
    },
    {
      id: 'marketing',
      label: 'Marketing',
      description: 'Cookies used to deliver personalized advertisements based on your interests',
      required: false
    },
    {
      id: 'preferences',
      label: 'Preferences',
      description: 'Cookies that remember your preferences and settings on our website',
      required: false
    }
  ];

  // This effect runs only on the client side after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSaveConsent = (settings: ConsentSettings) => {
    setConsentSettings(settings);
    setShowBanner(false);
    console.log('Consent settings saved:', settings);
  };

  const handleResetConsent = () => {
    setConsentSettings(null);
    setShowBanner(true);
  };

  const handleLoadConsent = (settings: ConsentSettings | null) => {
    if (settings) {
      setConsentSettings(settings);
      setShowBanner(!settings.hasInteracted);
    } else {
      // If no settings are found, show the banner
      setShowBanner(true);
    }
  };

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link href="/ndpr-demos" className="text-blue-600 hover:underline">
          ← Back to NDPR Demos
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-8">Consent Management Demo</h1>
      
      <div className="mb-6 flex items-center space-x-4">
        <Switch
          id="show-banner"
          checked={showBanner}
          onCheckedChange={setShowBanner}
        />
        <Label htmlFor="show-banner">Show Consent Banner</Label>
        
        <Button 
          variant="outline" 
          className="ml-4"
          onClick={handleResetConsent}
        >
          Reset Consent
        </Button>
      </div>
      
      {showBanner && (
        <ConsentBanner
          position="bottom"
          theme={{}}
          className=""
          children={null}
          renderBanner={(props: any) => (
            <div className="bg-white rounded-lg shadow-lg p-6 mx-4 mb-4">
              <h3 className="text-lg font-semibold mb-2">We Value Your Privacy</h3>
              <p className="text-gray-600 mb-4">
                We use cookies and similar technologies to improve your experience on our website. 
                By clicking 'Accept All', you consent to the use of all cookies. 
                You can customize your preferences by clicking 'Customize'.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Button 
                  onClick={() => {
                    props.onAcceptAll();
                    const allConsents = {} as Record<string, boolean>;
                    consentOptions.forEach(option => {
                      allConsents[option.id] = true;
                    });
                    handleSaveConsent({
                      consents: allConsents,
                      timestamp: Date.now(),
                      version: '1.0',
                      method: 'banner',
                      hasInteracted: true
                    });
                  }}
                >
                  Accept All
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    props.onRejectAll();
                    const rejectConsents = {} as Record<string, boolean>;
                    consentOptions.forEach(option => {
                      rejectConsents[option.id] = option.required || false;
                    });
                    handleSaveConsent({
                      consents: rejectConsents,
                      timestamp: Date.now(),
                      version: '1.0',
                      method: 'banner',
                      hasInteracted: true
                    });
                  }}
                >
                  Reject All
                </Button>
                <Button 
                  variant="ghost"
                  onClick={props.onOpenSettings}
                >
                  Customize
                </Button>
              </div>
            </div>
          )}
        />
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="banner">Consent Banner</TabsTrigger>
          <TabsTrigger value="manager">Consent Manager</TabsTrigger>
          <TabsTrigger value="storage">Consent Storage</TabsTrigger>
        </TabsList>
        
        <TabsContent value="banner" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Consent Banner</CardTitle>
              <CardDescription>
                The ConsentBanner component displays a banner to collect user consent for cookies and data processing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-md">
                <h3 className="text-lg font-semibold mb-4">Banner Preview</h3>
                <ConsentBanner
                  position="bottom"
                  theme={{}}
                  className=""
                  children={null}
                  renderBanner={(props: any) => (
                    <div className="bg-white border rounded-lg shadow-sm p-6">
                      <h3 className="text-lg font-semibold mb-2">We Value Your Privacy</h3>
                      <p className="text-gray-600 mb-4">
                        We use cookies and similar technologies to improve your experience on our website. 
                        By clicking 'Accept All', you consent to the use of all cookies. 
                        You can customize your preferences by clicking 'Customize'.
                      </p>
                      <div className="flex gap-3 flex-wrap">
                        <Button onClick={props.onAcceptAll}>Accept All</Button>
                        <Button variant="outline" onClick={props.onRejectAll}>Reject All</Button>
                        <Button variant="ghost" onClick={props.onOpenSettings}>Customize</Button>
                      </div>
                    </div>
                  )}
                />
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Usage</h3>
                <p>
                  The ConsentBanner component is typically displayed when a user first visits your website 
                  or when they need to update their consent preferences. It provides options to accept all, 
                  reject all, or customize consent settings.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="manager" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Consent Manager</CardTitle>
              <CardDescription>
                The ConsentManager component allows users to customize their consent preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    // Accept all cookies
                    const allConsents = {} as Record<string, boolean>;
                    [
                      { id: 'necessary', required: true },
                      { id: 'analytics', required: false },
                      { id: 'marketing', required: false },
                      { id: 'preferences', required: false },
                    ].forEach(option => {
                      allConsents[option.id] = true;
                    });
                    
                    const newSettings: ConsentSettings = {
                      consents: allConsents,
                      timestamp: Date.now(),
                      version: '1.0',
                      method: 'accept-all',
                      hasInteracted: true
                    };
                    
                    handleSaveConsent(newSettings);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Accept All
                </button>
                <button
                  onClick={() => {
                    // Reject non-essential cookies
                    const rejectNonEssential = {} as Record<string, boolean>;
                    [
                      { id: 'necessary', required: true },
                      { id: 'analytics', required: false },
                      { id: 'marketing', required: false },
                      { id: 'preferences', required: false },
                    ].forEach(option => {
                      // Only necessary cookies are enabled
                      rejectNonEssential[option.id] = option.required;
                    });
                    
                    const newSettings: ConsentSettings = {
                      consents: rejectNonEssential,
                      timestamp: Date.now(),
                      version: '1.0',
                      method: 'reject-non-essential',
                      hasInteracted: true
                    };
                    
                    handleSaveConsent(newSettings);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Reject Non-Essential
                </button>
              </div>
              
              <ConsentManager
                options={consentOptions}
                settings={consentSettings || {
                  consents: consentOptions.reduce((acc, option) => {
                    acc[option.id] = option.required || false;
                    return acc;
                  }, {} as Record<string, boolean>),
                  timestamp: Date.now(),
                  version: '1.0',
                  method: 'default',
                  hasInteracted: false
                }}
                onSave={handleSaveConsent}
                title="Manage Consent Preferences"
                description="Customize your consent preferences below. Required cookies are necessary for the website to function and cannot be disabled."
                saveButtonText="Save Preferences"
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="storage" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Consent Storage</CardTitle>
              <CardDescription>
                The ConsentStorage component handles the storage and retrieval of consent settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-md">
                <h3 className="text-lg font-semibold mb-4">Storage Demo</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-100 rounded-md">
                    <h4 className="font-medium mb-2">Current Consent Settings</h4>
                    <pre className="text-xs bg-gray-200 p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(consentSettings, null, 2) || 'No settings saved'}
                    </pre>
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        if (consentSettings) {
                          consentStorage.save('ndpr_demo_consent', consentSettings);
                        }
                      }}
                      disabled={!consentSettings}
                    >
                      Save to Storage
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        const loadedSettings = consentStorage.load('ndpr_demo_consent') as ConsentSettings | null;
                        if (loadedSettings) {
                          setConsentSettings(loadedSettings);
                        }
                      }}
                    >
                      Load from Storage
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        consentStorage.remove('ndpr_demo_consent');
                        setConsentSettings(null);
                      }}
                    >
                      Clear Storage
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Usage</h3>
                <p>
                  The ConsentStorage component is used to persist consent settings across user sessions. 
                  It supports different storage mechanisms including localStorage, sessionStorage, and cookies.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-10 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Implementation Notes</h2>
        <p className="mb-4">
          This demo showcases the consent management components from the NDPR Toolkit:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><code>ConsentBanner</code>: For displaying a consent notice to users</li>
          <li><code>ConsentManager</code>: For allowing users to customize their consent preferences</li>
          <li><code>ConsentStorage</code>: For persisting consent settings</li>
        </ul>
        <p className="mt-4">
          For detailed documentation, see the{' '}
          <Link href="/docs/components/consent-management" className="text-blue-600 hover:underline">
            Consent Management documentation
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
