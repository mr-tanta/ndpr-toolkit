'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ConsentOption {
  id: string;
  label: string;
  description: string;
  required: boolean;
}

interface ConsentSettings {
  consents: Record<string, boolean>;
  timestamp: number;
  version: string;
  method: string;
  hasInteracted: boolean;
}

interface ConsentEvent {
  action: string;
  timestamp: number;
  detail?: string;
}

type BannerPosition = 'top' | 'bottom';
type BannerTheme = 'light' | 'dark';
type StorageType = 'localStorage' | 'sessionStorage' | 'cookies';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_CONSENT_OPTIONS: ConsentOption[] = [
  {
    id: 'necessary',
    label: 'Necessary',
    description: 'Essential cookies required for the website to function properly',
    required: true,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'Help us understand how visitors interact with our website',
    required: false,
  },
  {
    id: 'marketing',
    label: 'Marketing',
    description: 'Used to deliver personalized advertisements',
    required: false,
  },
  {
    id: 'preferences',
    label: 'Preferences',
    description: 'Remember your settings and preferences across visits',
    required: false,
  },
];

// ---------------------------------------------------------------------------
// Mock Website Component
// ---------------------------------------------------------------------------

function MockWebsite({
  bannerPosition,
  bannerTheme,
  consentOptions,
  consentSettings,
  draftConsents,
  showCustomize,
  onAcceptAll,
  onDeclineAll,
  onToggleCustomize,
  onToggleOption,
  onSavePreferences,
}: {
  bannerPosition: BannerPosition;
  bannerTheme: BannerTheme;
  consentOptions: ConsentOption[];
  consentSettings: ConsentSettings | null;
  draftConsents: Record<string, boolean>;
  showCustomize: boolean;
  onAcceptAll: () => void;
  onDeclineAll: () => void;
  onToggleCustomize: () => void;
  onToggleOption: (id: string) => void;
  onSavePreferences: () => void;
}) {
  const hasInteracted = consentSettings?.hasInteracted ?? false;

  const bannerDark = bannerTheme === 'dark';

  const bannerBg = bannerDark
    ? 'bg-gray-900 text-gray-100 border-gray-700'
    : 'bg-white text-gray-900 border-gray-200';

  const bannerAcceptBtn = bannerDark
    ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
    : 'bg-emerald-600 hover:bg-emerald-700 text-white';

  const bannerDeclineBtn = bannerDark
    ? 'border-gray-500 text-gray-300 hover:bg-gray-800'
    : 'border-gray-300 text-gray-700 hover:bg-gray-50';

  const bannerCustomizeBtn = bannerDark
    ? 'text-gray-400 hover:text-gray-200 underline-offset-2 hover:underline'
    : 'text-gray-500 hover:text-gray-800 underline-offset-2 hover:underline';

  const bannerEl = !hasInteracted ? (
    <div
      className={`absolute left-0 right-0 ${bannerPosition === 'top' ? 'top-0' : 'bottom-0'} border ${bannerBg} z-10 shadow-lg`}
    >
      <div className="px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3">
          <div>
            <p className="font-semibold text-sm">We value your privacy</p>
            <p className={`text-xs mt-1 ${bannerDark ? 'text-gray-400' : 'text-gray-500'}`}>
              We use cookies and similar technologies to enhance your browsing experience, serve
              personalized content, and analyze our traffic. Under the Nigeria Data Protection Act
              (NDPA), we need your consent before processing your personal data.
            </p>
          </div>

          {showCustomize && (
            <div className={`border rounded-md p-3 space-y-2 ${bannerDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
              {consentOptions.map((opt) => {
                const checked = draftConsents[opt.id] ?? opt.required;
                return (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-2 text-xs ${opt.required ? 'opacity-70' : 'cursor-pointer'}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={opt.required}
                      onChange={() => onToggleOption(opt.id)}
                      className="mt-0.5 accent-emerald-600"
                    />
                    <span>
                      <span className="font-medium">{opt.label}</span>
                      {opt.required && (
                        <span className={`ml-1 text-[10px] ${bannerDark ? 'text-gray-500' : 'text-gray-400'}`}>(required)</span>
                      )}
                      <span className={`block ${bannerDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {opt.description}
                      </span>
                    </span>
                  </label>
                );
              })}
              <div className="pt-1">
                <button
                  onClick={onSavePreferences}
                  className={`text-xs font-medium px-4 py-2 min-h-[44px] rounded ${bannerAcceptBtn}`}
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onAcceptAll}
              className={`text-xs font-medium px-4 py-2 rounded-md transition-colors ${bannerAcceptBtn}`}
            >
              Accept All
            </button>
            <button
              onClick={onDeclineAll}
              className={`text-xs font-medium px-4 py-2 rounded-md border transition-colors ${bannerDeclineBtn}`}
            >
              Decline All
            </button>
            {!showCustomize && (
              <button
                onClick={onToggleCustomize}
                className={`text-xs transition-colors ${bannerCustomizeBtn}`}
              >
                Customize
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="relative border rounded-xl overflow-hidden bg-white dark:bg-gray-950 shadow-sm min-h-[420px] flex flex-col">
      {/* Mock browser chrome */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-white dark:bg-gray-700 rounded-md text-xs text-gray-500 dark:text-gray-400 px-3 py-1 w-60 text-center truncate border border-gray-200 dark:border-gray-600">
            https://your-app.com
          </div>
        </div>
      </div>

      {/* Mock website content */}
      <div className="relative flex-1">
        {/* Page content */}
        <div className={`px-6 py-5 space-y-4 ${!hasInteracted ? 'opacity-40 pointer-events-none select-none' : ''}`}>
          {/* Fake nav */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-emerald-600" />
              <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">YourApp</span>
            </div>
            <div className="flex gap-4">
              <span className="text-xs text-gray-400">Products</span>
              <span className="text-xs text-gray-400">Pricing</span>
              <span className="text-xs text-gray-400">About</span>
            </div>
          </div>

          {/* Fake hero */}
          <div className="pt-4 space-y-2">
            <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded" />
            <div className="h-3 w-5/6 bg-gray-100 dark:bg-gray-800 rounded" />
          </div>

          {/* Fake cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-3 space-y-2 border-gray-200 dark:border-gray-700">
                <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded" />
                <div className="h-2 w-4/5 bg-gray-100 dark:bg-gray-800 rounded" />
              </div>
            ))}
          </div>

          {/* Fake content rows */}
          <div className="space-y-2 pt-2">
            <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded" />
            <div className="h-2 w-11/12 bg-gray-100 dark:bg-gray-800 rounded" />
            <div className="h-2 w-4/5 bg-gray-100 dark:bg-gray-800 rounded" />
          </div>
        </div>

        {/* Accepted overlay */}
        {hasInteracted && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg px-6 py-4 text-center pointer-events-auto shadow-sm">
              <p className="text-emerald-700 dark:text-emerald-400 font-medium text-sm">
                Consent {consentSettings?.method === 'decline' ? 'declined' : 'recorded'} successfully
              </p>
              <p className="text-emerald-600/70 dark:text-emerald-500/70 text-xs mt-1">
                User preferences have been saved
              </p>
            </div>
          </div>
        )}

        {/* The consent banner */}
        {bannerEl}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// State Inspector
// ---------------------------------------------------------------------------

function StateInspector({
  consentSettings,
  draftConsents,
  events,
  storageType,
}: {
  consentSettings: ConsentSettings | null;
  draftConsents: Record<string, boolean>;
  events: ConsentEvent[];
  storageType: StorageType;
}) {
  return (
    <div className="space-y-4">
      {/* Current state */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Consent State
        </h4>
        <div className="bg-gray-900 rounded-lg p-4 text-xs font-mono text-green-400 overflow-auto max-h-52">
          <pre>{consentSettings
            ? JSON.stringify(consentSettings, null, 2)
            : JSON.stringify({ status: 'pending', draft: draftConsents }, null, 2)
          }</pre>
        </div>
      </div>

      {/* Storage type */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Storage
        </h4>
        <div className="flex gap-1.5">
          <Badge variant={storageType === 'localStorage' ? 'primary' : 'outline'} className="text-[10px]">
            localStorage
          </Badge>
          <Badge variant={storageType === 'sessionStorage' ? 'primary' : 'outline'} className="text-[10px]">
            sessionStorage
          </Badge>
          <Badge variant={storageType === 'cookies' ? 'primary' : 'outline'} className="text-[10px]">
            cookies
          </Badge>
        </div>
      </div>

      {/* Event log */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Event Log
        </h4>
        <div className="bg-gray-900 rounded-lg p-3 text-xs font-mono overflow-auto max-h-36 space-y-1">
          {events.length === 0 && (
            <span className="text-gray-500">// Interact with the banner to see events</span>
          )}
          {events.map((e, i) => (
            <div key={i} className="text-gray-300">
              <span className="text-gray-600">[{new Date(e.timestamp).toLocaleTimeString()}]</span>{' '}
              <span className="text-amber-400">{e.action}</span>
              {e.detail && <span className="text-gray-500"> &mdash; {e.detail}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function ConsentDemoPage() {
  const [isClient, setIsClient] = useState(false);

  // Demo configuration
  const [bannerPosition, setBannerPosition] = useState<BannerPosition>('bottom');
  const [bannerTheme, setBannerTheme] = useState<BannerTheme>('light');
  const [storageType, setStorageType] = useState<StorageType>('localStorage');
  const [consentOptions] = useState<ConsentOption[]>(DEFAULT_CONSENT_OPTIONS);

  // Consent state
  const [consentSettings, setConsentSettings] = useState<ConsentSettings | null>(null);
  const [showCustomize, setShowCustomize] = useState(false);
  const [events, setEvents] = useState<ConsentEvent[]>([]);
  const [draftConsents, setDraftConsents] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    DEFAULT_CONSENT_OPTIONS.forEach((opt) => {
      initial[opt.id] = opt.required;
    });
    return initial;
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // ------- Helpers -------

  const addEvent = useCallback((action: string, detail?: string) => {
    setEvents((prev) => [...prev, { action, timestamp: Date.now(), detail }]);
  }, []);

  const handleAcceptAll = useCallback(() => {
    const allConsents: Record<string, boolean> = {};
    consentOptions.forEach((opt) => {
      allConsents[opt.id] = true;
    });
    const settings: ConsentSettings = {
      consents: allConsents,
      timestamp: Date.now(),
      version: '1.0',
      method: 'accept-all',
      hasInteracted: true,
    };
    setConsentSettings(settings);
    setShowCustomize(false);
    addEvent('consent.accept_all', 'All categories accepted');
    addEvent('consent.save', `Stored via ${storageType}`);
  }, [consentOptions, addEvent, storageType]);

  const handleDeclineAll = useCallback(() => {
    const declineConsents: Record<string, boolean> = {};
    consentOptions.forEach((opt) => {
      declineConsents[opt.id] = opt.required;
    });
    const settings: ConsentSettings = {
      consents: declineConsents,
      timestamp: Date.now(),
      version: '1.0',
      method: 'decline',
      hasInteracted: true,
    };
    setConsentSettings(settings);
    setShowCustomize(false);
    addEvent('consent.decline_all', 'Only required categories kept');
    addEvent('consent.save', `Stored via ${storageType}`);
  }, [consentOptions, addEvent, storageType]);

  const handleToggleOption = useCallback(
    (id: string) => {
      const opt = consentOptions.find((o) => o.id === id);
      if (opt?.required) return;
      setDraftConsents((prev) => {
        const next = { ...prev, [id]: !prev[id] };
        return next;
      });
      addEvent('consent.toggle', `${id}: ${!draftConsents[id] ? 'enabled' : 'disabled'}`);
    },
    [consentOptions, addEvent, draftConsents],
  );

  const handleSavePreferences = useCallback(() => {
    const settings: ConsentSettings = {
      consents: { ...draftConsents },
      timestamp: Date.now(),
      version: '1.0',
      method: 'custom',
      hasInteracted: true,
    };
    setConsentSettings(settings);
    setShowCustomize(false);
    const accepted = Object.entries(draftConsents)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join(', ');
    addEvent('consent.save_preferences', `Accepted: ${accepted}`);
    addEvent('consent.save', `Stored via ${storageType}`);
  }, [draftConsents, addEvent, storageType]);

  const handleReset = useCallback(() => {
    setConsentSettings(null);
    setShowCustomize(false);
    const initial: Record<string, boolean> = {};
    consentOptions.forEach((opt) => {
      initial[opt.id] = opt.required;
    });
    setDraftConsents(initial);
    addEvent('consent.reset', 'Consent state cleared');
  }, [consentOptions, addEvent]);

  if (!isClient) {
    return (
      <div className="container mx-auto py-10">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-4" />
        <div className="h-4 w-96 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      {/* ================================================================ */}
      {/* Hero Section                                                      */}
      {/* ================================================================ */}
      <section className="mb-12">
        <Link
          href="/ndpr-demos"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to NDPR Demos
        </Link>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Consent Management</h1>
            <Badge variant="info">NDPA Sections 25-26</Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
            Collect, store, and manage user consent for personal data processing. This module provides
            a complete consent lifecycle &mdash; from banner display to preference management &mdash;
            fully aligned with the Nigeria Data Protection Act requirements for lawful consent.
          </p>
        </div>
      </section>

      {/* ================================================================ */}
      {/* Live Demo                                                         */}
      {/* ================================================================ */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Demo
        </h2>

        {/* Controls bar */}
        <Card className="mb-4">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              {/* Position */}
              <div className="flex items-center gap-3">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  Position
                </Label>
                <div className="flex rounded-md overflow-hidden border border-border">
                  {(['top', 'bottom'] as BannerPosition[]).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setBannerPosition(pos)}
                      className={`text-xs px-3 py-1.5 font-medium transition-colors ${
                        bannerPosition === pos
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      {pos.charAt(0).toUpperCase() + pos.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <div className="flex items-center gap-3">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  Theme
                </Label>
                <div className="flex rounded-md overflow-hidden border border-border">
                  {(['light', 'dark'] as BannerTheme[]).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setBannerTheme(theme)}
                      className={`text-xs px-3 py-1.5 font-medium transition-colors ${
                        bannerTheme === theme
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Storage */}
              <div className="flex items-center gap-3">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  Storage
                </Label>
                <div className="flex rounded-md overflow-hidden border border-border">
                  {(['localStorage', 'sessionStorage', 'cookies'] as StorageType[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStorageType(st)}
                      className={`text-xs px-3 py-1.5 font-medium transition-colors ${
                        storageType === st
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      {st === 'localStorage' ? 'Local' : st === 'sessionStorage' ? 'Session' : 'Cookies'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset */}
              <Button variant="outline" size="sm" onClick={handleReset}>
                Reset Demo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Split pane: Mock website + Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Mock Website — takes 3/5 on desktop */}
          <div className="lg:col-span-3">
            <MockWebsite
              bannerPosition={bannerPosition}
              bannerTheme={bannerTheme}
              consentOptions={consentOptions}
              consentSettings={consentSettings}
              draftConsents={draftConsents}
              showCustomize={showCustomize}
              onAcceptAll={handleAcceptAll}
              onDeclineAll={handleDeclineAll}
              onToggleCustomize={() => {
                setShowCustomize(true);
                addEvent('consent.open_preferences', 'User opened customize panel');
              }}
              onToggleOption={handleToggleOption}
              onSavePreferences={handleSavePreferences}
            />
          </div>

          {/* State Inspector — takes 2/5 on desktop */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  </svg>
                  State Inspector
                </CardTitle>
                <CardDescription>Real-time consent state and event log</CardDescription>
              </CardHeader>
              <CardContent>
                <StateInspector
                  consentSettings={consentSettings}
                  draftConsents={draftConsents}
                  events={events}
                  storageType={storageType}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* Code Section                                                      */}
      {/* ================================================================ */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-6">Implementation</h2>

        <Tabs defaultValue="banner">
          <TabsList className="mb-4">
            <TabsTrigger value="banner">Consent Banner</TabsTrigger>
            <TabsTrigger value="manager">Consent Manager</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
          </TabsList>

          <TabsContent value="banner">
            <Card>
              <CardHeader>
                <CardTitle>Consent Banner</CardTitle>
                <CardDescription>
                  Display a consent banner to visitors. Supports custom positioning, theming, and
                  callbacks for accept, decline, and customize actions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 rounded-lg p-4 overflow-auto">
                  <pre className="text-xs sm:text-sm font-mono text-gray-300 leading-relaxed"><code>{`import { ConsentBanner } from '@tantainnovative/ndpr-toolkit/consent';

<ConsentBanner
  position="${bannerPosition}"
  options={[
    { id: 'necessary', label: 'Necessary', required: true },
    { id: 'analytics', label: 'Analytics', required: false },
    { id: 'marketing', label: 'Marketing', required: false },
    { id: 'preferences', label: 'Preferences', required: false },
  ]}
  onAcceptAll={() => {
    // All categories accepted
    saveConsent({ method: 'accept-all', /* ... */ });
  }}
  onDeclineAll={() => {
    // Only required categories kept
    saveConsent({ method: 'decline', /* ... */ });
  }}
  onSavePreferences={(consents) => {
    // Custom selection saved
    saveConsent({ method: 'custom', consents });
  }}
/>`}</code></pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manager">
            <Card>
              <CardHeader>
                <CardTitle>Consent Manager</CardTitle>
                <CardDescription>
                  Provide users a granular interface to review and update their consent preferences at
                  any time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 rounded-lg p-4 overflow-auto">
                  <pre className="text-xs sm:text-sm font-mono text-gray-300 leading-relaxed"><code>{`import { ConsentManager } from '@tantainnovative/ndpr-toolkit/consent';

<ConsentManager
  initialConsent={{
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  }}
  onConsentChange={(consents) => {
    // Fires when any toggle changes
    console.log('Updated consents:', consents);
  }}
  options={[
    {
      id: 'necessary',
      label: 'Necessary',
      description: 'Essential cookies',
      required: true,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      description: 'Usage tracking',
      required: false,
    },
    // ...
  ]}
/>`}</code></pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="storage">
            <Card>
              <CardHeader>
                <CardTitle>Consent Storage</CardTitle>
                <CardDescription>
                  Persist consent settings across sessions with built-in support for localStorage,
                  sessionStorage, and cookies.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 rounded-lg p-4 overflow-auto">
                  <pre className="text-xs sm:text-sm font-mono text-gray-300 leading-relaxed"><code>{`import { ConsentStorage, validateConsent } from '@tantainnovative/ndpr-toolkit/consent';
import type { ConsentSettings } from '@tantainnovative/ndpr-toolkit/core';

function App() {
  const [consent, setConsent] = useState<ConsentSettings>(initialConsent);

  return (
    <ConsentStorage
      settings={consent}
      storageOptions={{
        storageKey: 'user_consent',
        storageType: 'localStorage', // or 'sessionStorage' | 'cookie'
      }}
      onLoad={(loaded) => {
        if (loaded) setConsent(loaded);
      }}
      onSave={(saved) => {
        console.log('Consent persisted:', saved);
      }}
    >
      {({ clearSettings }) => (
        <button onClick={clearSettings}>Reset Consent</button>
      )}
    </ConsentStorage>
  );
}

// Validate consent meets NDPA requirements
const { valid, errors } = validateConsent(consent);`}</code></pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* ================================================================ */}
      {/* Features Grid                                                     */}
      {/* ================================================================ */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-6">Features</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center mb-2">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                </svg>
              </div>
              <CardTitle className="text-sm">Storage Options</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Flexible persistence via localStorage, sessionStorage, or cookies. Choose the
                strategy that fits your application and regulatory requirements.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <CardTitle className="text-sm">Consent Validation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Built-in validation ensures consent is freely given, specific, informed, and
                unambiguous &mdash; the four pillars required by NDPA Section 26.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </div>
              <CardTitle className="text-sm">Event System</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Subscribe to consent lifecycle events &mdash; accept, decline, toggle, save, and
                refresh &mdash; to trigger side effects and keep analytics in sync.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.183" />
                </svg>
              </div>
              <CardTitle className="text-sm">13-Month Auto-Refresh</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Consent automatically expires and prompts re-confirmation after 13 months, ensuring
                ongoing compliance with NDPA requirements.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ================================================================ */}
      {/* NDPA Compliance Callout                                           */}
      {/* ================================================================ */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-6">NDPA Compliance Reference</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
            <CardHeader>
              <Badge variant="info" className="w-fit mb-1">Section 25</Badge>
              <CardTitle className="text-base">Lawful Basis for Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-500 shrink-0" />
                  Processing must be based on at least one lawful basis, including consent
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-500 shrink-0" />
                  The controller must be able to demonstrate that consent was obtained
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-500 shrink-0" />
                  Consent must be obtained before processing begins
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-500 shrink-0" />
                  Records of consent must be maintained by the data controller
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
            <CardHeader>
              <Badge variant="success" className="w-fit mb-1">Section 26</Badge>
              <CardTitle className="text-base">Conditions for Valid Consent</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-500 shrink-0" />
                  <span><strong className="text-foreground">Freely given</strong> &mdash; no coercion or undue pressure on the data subject</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-500 shrink-0" />
                  <span><strong className="text-foreground">Specific</strong> &mdash; consent is tied to a clearly defined processing purpose</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-500 shrink-0" />
                  <span><strong className="text-foreground">Informed</strong> &mdash; the data subject understands what they are consenting to</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-500 shrink-0" />
                  <span><strong className="text-foreground">Unambiguous</strong> &mdash; a clear affirmative action indicates agreement</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 p-4 rounded-lg border border-border bg-muted/30">
          <p className="text-sm text-muted-foreground">
            The consent management module in this toolkit is designed in accordance with the{' '}
            <strong className="text-foreground">Nigeria Data Protection Act (NDPA)</strong>, Sections 25&ndash;26. The{' '}
            <strong className="text-foreground">Nigeria Data Protection Commission (NDPC)</strong> is the supervisory
            authority responsible for enforcing these provisions. For detailed documentation, see the{' '}
            <Link href="/docs/components/consent-management" className="text-primary hover:underline font-medium">
              Consent Management documentation
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
