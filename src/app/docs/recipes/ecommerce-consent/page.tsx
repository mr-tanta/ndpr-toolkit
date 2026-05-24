'use client';

import Link from 'next/link';
import { DocLayout } from '../../components/DocLayout';

export default function EcommerceConsentRecipe() {
  return (
    <DocLayout
      title="Ecommerce Consent"
      description="NDPA-compliant cookie consent for online stores — checkout, cart abandonment, marketing pixels, payment processors."
    >
      <p className="mb-6 text-base text-muted-foreground">
        Ecommerce sites usually need <strong>four categories</strong> of cookies: necessary (cart + checkout), analytics (Google Analytics), marketing (Facebook / TikTok pixels for retargeting), and functional (recently-viewed, recommendations). NDPA Section 26 requires explicit affirmative consent for everything except &quot;necessary&quot; — which the toolkit enforces by default.
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-4">Drop-in component</h2>
      <pre className="bg-card border border-border rounded-lg p-4 overflow-x-auto"><code className="text-sm">{`'use client';
import { NDPRConsent } from '@tantainnovative/ndpr-toolkit/presets/consent';
import { apiAdapter } from '@tantainnovative/ndpr-toolkit/adapters';
import type { ConsentSettings } from '@tantainnovative/ndpr-toolkit/core';

const adapter = apiAdapter<ConsentSettings>('/api/consent', {
  credentials: 'same-origin',
  // CSRF token from a server-rendered meta tag, common in Rails/Laravel/Django:
  headers: () => ({
    'X-CSRF-Token':
      document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
  }),
});

export default function EcommerceConsentBanner() {
  return (
    <NDPRConsent
      adapter={adapter}
      copy={{
        title: 'Cookie preferences',
        description:
          'We use cookies to keep your cart, measure how the store is used, and show ' +
          'you relevant offers. Your choices apply across this domain and you can ' +
          'change them anytime from the footer.',
        acceptAll: 'Allow all',
        rejectAll: 'Only necessary',
        customize: 'Manage categories',
        save: 'Save preferences',
      }}
      extraOptions={[
        {
          id: 'recommendations',
          label: 'Product Recommendations',
          description: 'Show recently viewed and recommended products based on browsing history.',
          required: false,
          purpose: 'Personalisation',
        },
      ]}
    />
  );
}`}</code></pre>

      <h2 className="text-2xl font-bold mt-10 mb-4">Pair with the ecommerce policy template</h2>
      <p className="mb-4">
        The matching org template ships sensible defaults for the privacy policy — financial data flag on, cross-border on (most payment processors are offshore), automated-decisions on (fraud detection):
      </p>
      <pre className="bg-card border border-border rounded-lg p-4 overflow-x-auto"><code className="text-sm">{`import { NDPRPrivacyPolicy } from '@tantainnovative/ndpr-toolkit/presets/policy';

<NDPRPrivacyPolicy
  template="ecommerce"
  templateOverrides={{
    orgName: 'Acme Store NG',
    dpoEmail: 'privacy@acmestore.ng',
  }}
/>;`}</code></pre>

      <h2 className="text-2xl font-bold mt-10 mb-4">Gating analytics + marketing scripts</h2>
      <p className="mb-4">
        Use the <code>useConsent</code> hook to defer third-party tags until consent is given:
      </p>
      <pre className="bg-card border border-border rounded-lg p-4 overflow-x-auto"><code className="text-sm">{`'use client';
import Script from 'next/script';
import { useConsent } from '@tantainnovative/ndpr-toolkit/hooks';

export function MarketingScripts() {
  const { hasConsent } = useConsent();
  return (
    <>
      {hasConsent('analytics') && (
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX" strategy="afterInteractive" />
      )}
      {hasConsent('marketing') && (
        <Script src="https://connect.facebook.net/en_US/fbevents.js" strategy="afterInteractive" />
      )}
    </>
  );
}`}</code></pre>

      <h2 className="text-2xl font-bold mt-10 mb-4">Related</h2>
      <ul className="space-y-2">
        <li><Link href="/docs/components/consent-management" className="text-primary hover:underline">Consent Management — full API reference</Link></li>
        <li><Link href="/docs/components/privacy-policy-generator" className="text-primary hover:underline">Privacy Policy Generator — ecommerce template</Link></li>
        <li><Link href="/ndpr-demos/consent" className="text-primary hover:underline">Live consent banner demo</Link></li>
        <li><Link href="/nigeria-cookie-consent" className="text-primary hover:underline">Nigeria Cookie Consent landing page</Link></li>
      </ul>
    </DocLayout>
  );
}
