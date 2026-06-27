import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

import { ConsentBanner } from './ConsentBanner';
import { ConsentManager } from './ConsentManager';
import { Consent } from './compound';
import type { ConsentOption, ConsentSettings } from '../../types/consent';

const consentOptions: ConsentOption[] = [
  {
    id: 'necessary',
    label: 'Necessary',
    description: 'Required for security, fraud prevention, and core site functionality.',
    required: true,
    purpose: 'Provide the requested digital service and keep the session secure.',
    defaultValue: true,
    dataCategories: ['Session identifiers', 'Security logs'],
  },
  {
    id: 'functional',
    label: 'Functional',
    description: 'Remembers language, region, and accessibility preferences.',
    required: false,
    purpose: 'Personalise the product experience without using advertising profiles.',
    defaultValue: true,
    dataCategories: ['Preference settings'],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'Measures feature usage and reliability so we can improve the service.',
    required: false,
    purpose: 'Produce aggregate product analytics and performance reports.',
    defaultValue: false,
    dataCategories: ['Device data', 'Usage events'],
  },
  {
    id: 'marketing',
    label: 'Marketing',
    description: 'Supports campaign attribution and relevant product updates.',
    required: false,
    purpose: 'Measure campaigns and tailor communications where consent is granted.',
    defaultValue: false,
    dataCategories: ['Campaign source', 'Email engagement'],
  },
];

const savedSettings: ConsentSettings = {
  consents: {
    necessary: true,
    functional: true,
    analytics: true,
    marketing: false,
  },
  timestamp: Date.now(),
  version: '2026.06',
  method: 'storybook-fixture',
  hasInteracted: true,
  lawfulBasis: 'consent',
};

const logConsent = (label: string) => (settings: ConsentSettings) => {
  console.info(`[storybook:${label}]`, settings);
};

const Surface = ({
  children,
  theme = 'light',
}: {
  children: React.ReactNode;
  theme?: 'light' | 'dark';
}) => (
  <div
    data-theme={theme}
    style={{
      minWidth: 720,
      maxWidth: 920,
      padding: 24,
      background: theme === 'dark' ? '#111827' : '#f8fafc',
      borderRadius: 12,
    }}
  >
    {children}
  </div>
);

const meta = {
  title: 'Consent/Management Components',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const BannerDefault: Story = {
  name: 'ConsentBanner default',
  render: () => (
    <Surface>
      <ConsentBanner
        options={consentOptions}
        onSave={logConsent('banner-default')}
        show
        position="inline"
        variant="bar"
        manageStorage={false}
      />
    </Surface>
  ),
};

export const BannerWithPrefilledCategories: Story = {
  name: 'ConsentBanner with category choices',
  render: () => (
    <Surface>
      <ConsentBanner
        options={consentOptions}
        onSave={logConsent('banner-prefilled')}
        show
        position="inline"
        variant="card"
        version="2026.06"
        manageStorage={false}
        title="Manage NDPA consent"
        description="Choose how this service may process functional, analytics, and marketing data. Necessary processing remains enabled."
        showCookieScan
        declaredCookies={[
          {
            name: 'ndpr_consent',
            category: 'necessary',
            purpose: 'Stores the current consent record.',
          },
          {
            name: '_ga',
            category: 'analytics',
            purpose: 'Measures aggregate product usage.',
          },
        ]}
        cookieScanOptions={{
          cookieString: 'ndpr_consent=accepted; _ga=GA1.2.123456789.1234567890; campaign_id=q2',
        }}
      />
    </Surface>
  ),
};

export const BannerDarkMode: Story = {
  name: 'ConsentBanner dark mode',
  render: () => (
    <Surface theme="dark">
      <ConsentBanner
        options={consentOptions}
        onSave={logConsent('banner-dark')}
        show
        position="inline"
        variant="modal"
        manageStorage={false}
        title="Privacy choices"
        description="Dark theme inherits the toolkit CSS variables through the data-theme attribute."
      />
    </Surface>
  ),
};

export const ManagerWithSavedSettings: Story = {
  name: 'ConsentManager with saved settings',
  render: () => (
    <Surface>
      <ConsentManager
        options={consentOptions}
        settings={savedSettings}
        onSave={logConsent('manager-saved')}
        version="2026.06"
      />
    </Surface>
  ),
};

export const CompoundConsentApi: Story = {
  name: 'Compound consent API',
  render: () => (
    <Surface>
      <div className="ndpr-consent-banner ndpr-consent-banner--card">
        <div className="ndpr-consent-banner__container">
          <h2 className="ndpr-consent-banner__title">Compound consent controls</h2>
          <p className="ndpr-consent-banner__description">
            Compose the provider, option list, and actions when a product needs a custom consent layout.
          </p>
          <Consent.Provider options={consentOptions} onChange={logConsent('compound')}>
            <Consent.OptionList />
            <div className="ndpr-consent-banner__buttons">
              <Consent.RejectButton>Reject optional</Consent.RejectButton>
              <Consent.SaveButton
                consents={{
                  necessary: true,
                  functional: true,
                  analytics: false,
                  marketing: false,
                }}
              >
                Save selected
              </Consent.SaveButton>
              <Consent.AcceptButton>Accept all</Consent.AcceptButton>
            </div>
          </Consent.Provider>
        </div>
      </div>
    </Surface>
  ),
};
