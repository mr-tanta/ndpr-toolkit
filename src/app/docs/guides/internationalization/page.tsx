'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function InternationalizationGuide() {
  return (
    <DocLayout
      title="Internationalization"
      description="Customize every text string in the toolkit — from consent banners to DSR forms — using the locale prop and the useNDPRLocale hook"
    >
      <section id="overview" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Overview</h2>
        <p className="mb-4 text-foreground">
          Every user-facing string rendered by the toolkit — button labels, form headings, placeholder text,
          success messages — is sourced from a single locale object. By passing a{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">locale</code> prop to{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRProvider</code>,
          you can translate the entire toolkit into any language or replace individual strings with
          organisation-specific copy.
        </p>
        <p className="mb-4 text-foreground">
          Locale support was added in <strong>v3.1.0</strong>. The system is designed for partial
          overrides — you only need to supply the strings you want to change. Everything else falls
          back to the built-in English defaults automatically, so you never have to copy the full
          locale object to make a small tweak.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl mb-4">
          <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-2">What locale covers</h4>
          <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1 list-disc pl-4">
            <li>Consent banner — title, description, button labels, cookie notice</li>
            <li>DSR form — field labels, request types, success message, privacy notice</li>
            <li>Breach notification — form labels, submit button, category labels</li>
            <li>DPIA questionnaire — navigation labels, progress indicator</li>
            <li>Privacy policy generator — section headings, action buttons</li>
            <li>Compliance score — rating labels, recommendation copy</li>
            <li>Shared strings — loading, error, save, cancel, and other common actions</li>
          </ul>
        </div>
      </section>

      <section id="ndpr-locale-type" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">The NDPRLocale Type</h2>
        <p className="mb-4 text-foreground">
          The locale is structured as a nested object with one namespace per toolkit feature area.
          Every field is optional — the type is fully partial, so TypeScript will not complain if
          you only supply a handful of keys.
        </p>

        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <pre className="text-foreground"><code>{`import type { NDPRLocale } from '@tantainnovative/ndpr-toolkit/core';

// Full type shape — every field is optional
const locale: NDPRLocale = {
  consent: {
    title?: string;            // "We Value Your Privacy"
    description?: string;      // banner body text
    acceptAll?: string;        // "Accept All"
    rejectAll?: string;        // "Reject All"
    customize?: string;        // "Customize"
    savePreferences?: string;  // "Save Preferences"
    selectAll?: string;        // "Select All"
    deselectAll?: string;      // "Deselect All"
    required?: string;         // "Required"
    cookieNotice?: string;     // small print beneath buttons
  };
  dsr?: {
    title?: string;
    description?: string;
    submitRequest?: string;
    reset?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    requestType?: string;
    additionalInfo?: string;
    identityVerification?: string;
    identifierType?: string;
    identifierValue?: string;
    privacyNotice?: string;
    successMessage?: string;
  };
  breach?: {
    title?: string;
    description?: string;
    submitReport?: string;
    breachTitle?: string;
    category?: string;
    discoveredAt?: string;
    detailedDescription?: string;
  };
  dpia?: {
    title?: string;
    next?: string;
    previous?: string;
    complete?: string;
    progress?: string;
  };
  policy?: {
    title?: string;
    generate?: string;
    preview?: string;
    export?: string;
    sections?: string;
    variables?: string;
  };
  compliance?: {
    score?: string;
    excellent?: string;
    good?: string;
    needsWork?: string;
    critical?: string;
    recommendations?: string;
    passed?: string;
    gaps?: string;
  };
  common?: {
    loading?: string;
    error?: string;
    save?: string;
    cancel?: string;
    delete?: string;
    edit?: string;
    add?: string;
    back?: string;
    next?: string;
    search?: string;
    noResults?: string;
  };
};`}</code></pre>
        </div>
      </section>

      <section id="with-provider" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Using with NDPRProvider</h2>
        <p className="mb-4 text-foreground">
          Pass the locale object to <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRProvider</code>{' '}
          at the root of your app. All toolkit components in the tree will pick up the locale
          automatically — no extra prop drilling required.
        </p>

        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <pre className="text-foreground"><code>{`// src/app/layout.tsx
import { NDPRProvider } from '@tantainnovative/ndpr-toolkit';
import type { NDPRLocale } from '@tantainnovative/ndpr-toolkit/core';

const locale: NDPRLocale = {
  consent: {
    title: 'Nous respectons votre vie privée',
    acceptAll: 'Tout accepter',
    rejectAll: 'Tout refuser',
    customize: 'Personnaliser',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <NDPRProvider
          organizationName="Acme Corp"
          dpoEmail="dpo@acme.ng"
          locale={locale}
        >
          {children}
        </NDPRProvider>
      </body>
    </html>
  );
}`}</code></pre>
        </div>

        <p className="text-sm text-muted-foreground">
          The <code className="bg-card border border-border px-1 rounded text-xs">locale</code> prop
          is one of several config options on{' '}
          <code className="bg-card border border-border px-1 rounded text-xs">NDPRProvider</code>.
          See the{' '}
          <Link href="/docs/guides/presets" className="text-blue-600 dark:text-blue-400 hover:underline">
            Presets guide
          </Link>{' '}
          for the full provider API.
        </p>
      </section>

      <section id="partial-overrides" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Partial Overrides</h2>
        <p className="mb-4 text-foreground">
          You do not need a complete translation to use locale support. Supply only the strings you
          want to change and the toolkit fills in the rest from the English defaults. This is useful
          when you just need to adjust a button label or replace legal copy with organisation-specific
          wording.
        </p>

        <h3 className="text-xl font-bold text-foreground mb-3">Override a single button label</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <pre className="text-foreground"><code>{`// Only the consent.acceptAll string is overridden.
// All other strings remain English.
const locale: NDPRLocale = {
  consent: {
    acceptAll: 'I Agree',
    rejectAll: 'No Thanks',
  },
};`}</code></pre>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-3">Override one namespace, keep the rest</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <pre className="text-foreground"><code>{`const locale: NDPRLocale = {
  // Full DSR namespace override, everything else stays in English
  dsr: {
    title: 'Exercez vos droits',
    description: 'Utilisez ce formulaire pour exercer vos droits en vertu de la NDPA.',
    submitRequest: 'Envoyer la demande',
    reset: 'Réinitialiser',
    fullName: 'Nom complet',
    email: 'Adresse e-mail',
    phone: 'Numéro de téléphone (facultatif)',
    requestType: 'Type de demande',
    additionalInfo: 'Informations supplémentaires',
    identityVerification: 'Vérification d\'identité',
    identifierType: 'Type d\'identifiant',
    identifierValue: 'Valeur de l\'identifiant',
    privacyNotice: 'Vos données seront utilisées uniquement pour traiter votre demande.',
    successMessage: 'Votre demande a été soumise avec succès.',
  },
};`}</code></pre>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl mb-4">
          <h4 className="text-amber-800 dark:text-amber-200 font-medium mb-1">How fallback works</h4>
          <p className="text-amber-700 dark:text-amber-300 text-sm">
            Internally the toolkit calls <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded text-xs">mergeLocale(partial)</code>,
            which deep-merges your partial object with the full English default. Missing namespace objects
            are taken wholesale from English; missing keys within a namespace are also filled from English.
            You can never end up with an <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded text-xs">undefined</code> string at runtime.
          </p>
        </div>
      </section>

      <section id="full-translation" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Creating a Full Translation</h2>
        <p className="mb-4 text-foreground">
          For a complete locale, define all seven namespaces and export the object from a dedicated
          file. Below is a starter template in Yoruba (Èdè Yorùbá).
        </p>

        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <pre className="text-foreground"><code>{`// src/locales/yo.ts
import type { NDPRLocale } from '@tantainnovative/ndpr-toolkit/core';

export const yorubaLocale: NDPRLocale = {
  consent: {
    title: 'A ń bọ̀wọ̀ fún asiri rẹ',
    description: 'A lo kuki àti imọ̀-ẹ̀rọ míràn láti pèsè iṣẹ́ wa gẹ́gẹ́ bí NDPA àwọn abala 25-26.',
    acceptAll: 'Gba Gbogbo',
    rejectAll: 'Kọ Gbogbo',
    customize: 'Ṣatunkọ',
    savePreferences: 'Fipamọ́ Àṣàyàn',
    selectAll: 'Yan Gbogbo',
    deselectAll: 'Yọ Gbogbo Kúrò',
    required: 'Dandan',
    cookieNotice: 'Nígbà tí o bá tẹ "Gba Gbogbo", o gba lilo gbogbo kuki.',
  },
  dsr: {
    title: 'Fi ìbéèrè Ẹ̀tọ́ Àwọn Dátà Rẹ Sílẹ̀',
    description: 'Lo fọ́ọ̀mù yìí láti lo ẹ̀tọ́ rẹ lábẹ́ NDPA apá IV, àwọn abala 29-36.',
    submitRequest: 'Firanṣẹ Ìbéèrè',
    reset: 'Tún Bẹ̀rẹ̀',
    fullName: 'Orúkọ Ni Kikun',
    email: 'Àdírẹ́sì Ímeèlì',
    phone: 'Nọ́mbà Fóònù (Àṣàyàn)',
    requestType: 'Irú Ìbéèrè',
    additionalInfo: 'Àlàyé Àfikún',
    identityVerification: 'Ìjẹ́rìísí Ìdánimọ̀',
    identifierType: 'Irú Idánimọ̀',
    identifierValue: 'Iye Idánimọ̀',
    privacyNotice: 'Àwọn ìsọfúnni tí o pèsè yóò ṣe àmúlò fún ìbéèrè rẹ nìkan.',
    successMessage: 'Ìbéèrè rẹ ti fi sílẹ̀ pẹ̀lú àṣeyọrí.',
  },
  breach: {
    title: 'Jábọ̀ Ìrúfin Dátà',
    description: 'Lo fọ́ọ̀mù yìí láti jábọ̀ ìrúfin dátà gẹ́gẹ́ bí NDPA abala 40.',
    submitReport: 'Firanṣẹ Ìjábọ̀',
    breachTitle: 'Àkọlé/Àkójọpọ̀ Ìrúfin',
    category: 'Ẹ̀ka',
    discoveredAt: 'Ọjọ́ Tí A Ṣàwárí',
    detailedDescription: 'Àpèjúwe Líle',
  },
  dpia: {
    title: 'Ìdínwò Ipa Ìdáàbòbò Dátà',
    next: 'Tókàn',
    previous: 'Ẹ̀yìn',
    complete: 'Parí Ìdínwò',
    progress: 'Ìlọsíwájú',
  },
  policy: {
    title: 'Olùmúṣe Ìlànà Asiri',
    generate: 'Ṣẹ̀dá Ìlànà',
    preview: 'Wo Àkọ́kọ́',
    export: 'Gbé Jáde',
    sections: 'Àwọn Abala',
    variables: 'Àwọn Ìyípadà',
  },
  compliance: {
    score: 'Àmì Ìbámu',
    excellent: 'Dára Gidigidi',
    good: 'Dára',
    needsWork: 'Nílò Iṣẹ́',
    critical: 'Pàtàkì',
    recommendations: 'Àwọn Ìmọ̀ràn',
    passed: 'Kọjá',
    gaps: 'Àwọn Àáfin',
  },
  common: {
    loading: 'Ń gbé...',
    error: 'Àṣìṣe kan ṣẹlẹ̀',
    save: 'Fipamọ́',
    cancel: 'Fagilé',
    delete: 'Paarẹ',
    edit: 'Ṣatunkọ',
    add: 'Fikún',
    back: 'Padà',
    next: 'Tókàn',
    search: 'Wá',
    noResults: 'Kò sí àbájáde',
  },
};`}</code></pre>
        </div>

        <p className="mb-4 text-foreground">
          Then pass it to the provider:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { yorubaLocale } from '@/locales/yo';

<NDPRProvider locale={yorubaLocale}>
  {children}
</NDPRProvider>`}</code></pre>
        </div>
      </section>

      <section id="hook" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">useNDPRLocale() in Custom Components</h2>
        <p className="mb-4 text-foreground">
          If you are building custom components that should honour the active locale, use the{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useNDPRLocale()</code>{' '}
          hook. It returns the fully resolved locale object — every key is always present and
          non-nullable, merged from the nearest{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRProvider</code>.
        </p>

        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <pre className="text-foreground"><code>{`'use client';

import { useNDPRLocale } from '@tantainnovative/ndpr-toolkit/core';

export function CustomConsentBanner() {
  // Returns fully resolved locale — all keys present, no undefined
  const locale = useNDPRLocale();

  return (
    <div>
      <h2>{locale.consent.title}</h2>
      <p>{locale.consent.description}</p>
      <div>
        <button>{locale.consent.rejectAll}</button>
        <button>{locale.consent.acceptAll}</button>
      </div>
    </div>
  );
}`}</code></pre>
        </div>

        <p className="mb-4 text-foreground">
          You can also read strings from any namespace:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <pre className="text-foreground"><code>{`const locale = useNDPRLocale();

// Common strings
const loadingLabel = locale.common.loading;    // "Loading..." or translated
const cancelLabel  = locale.common.cancel;     // "Cancel" or translated

// DSR strings
const submitLabel  = locale.dsr.submitRequest; // "Submit Request" or translated

// DPIA navigation
const nextLabel    = locale.dpia.next;         // "Next" or translated`}</code></pre>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-xl mb-4">
          <h4 className="text-green-800 dark:text-green-200 font-medium mb-2">No provider? No problem</h4>
          <p className="text-green-700 dark:text-green-300 text-sm">
            If <code className="bg-green-100 dark:bg-green-800 px-1 rounded text-xs">useNDPRLocale()</code> is
            called outside an <code className="bg-green-100 dark:bg-green-800 px-1 rounded text-xs">NDPRProvider</code>,
            it returns the full English default locale. Components that use the hook are safe to
            render in isolation without a provider wrapping them.
          </p>
        </div>
      </section>

      <section id="imports" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Available Imports from /core</h2>
        <p className="mb-4 text-foreground">
          All locale-related exports are available from the{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">@tantainnovative/ndpr-toolkit/core</code>{' '}
          entry point so you can import only what you need without pulling in React component code.
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Export</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Kind</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 font-mono text-foreground">NDPRLocale</td>
                <td className="border border-border px-4 py-2 text-foreground">Type</td>
                <td className="border border-border px-4 py-2 text-muted-foreground">Full partial locale interface with all 7 namespaces</td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 font-mono text-foreground">defaultLocale</td>
                <td className="border border-border px-4 py-2 text-foreground">Const</td>
                <td className="border border-border px-4 py-2 text-muted-foreground">The built-in English locale object — fully typed with all keys required</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 font-mono text-foreground">mergeLocale</td>
                <td className="border border-border px-4 py-2 text-foreground">Function</td>
                <td className="border border-border px-4 py-2 text-muted-foreground">
                  <code className="text-xs">(partial?: NDPRLocale) =&gt; typeof defaultLocale</code> — deep-merge helper
                </td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 font-mono text-foreground">useNDPRLocale</td>
                <td className="border border-border px-4 py-2 text-foreground">Hook</td>
                <td className="border border-border px-4 py-2 text-muted-foreground">Returns the fully resolved locale from the nearest NDPRProvider</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="border border-border px-4 py-2 font-mono text-foreground">useNDPRConfig</td>
                <td className="border border-border px-4 py-2 text-foreground">Hook</td>
                <td className="border border-border px-4 py-2 text-muted-foreground">Returns the full NDPRConfig (including raw locale, org name, DPO email, theme)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import type { NDPRLocale } from '@tantainnovative/ndpr-toolkit/core';
import { defaultLocale, mergeLocale, useNDPRLocale, useNDPRConfig }
  from '@tantainnovative/ndpr-toolkit/core';`}</code></pre>
        </div>
      </section>

      <div className="mt-8 pt-6 border-t border-border">
        <h3 className="text-lg font-semibold text-foreground mb-3">Related Guides</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/docs/guides/styling-customization" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            Styling &amp; Customization &rarr;
          </Link>
          <Link href="/docs/guides/presets" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            Zero-config Presets &rarr;
          </Link>
          <Link href="/docs/guides/compound-components" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            Compound Components &rarr;
          </Link>
        </div>
      </div>
    </DocLayout>
  );
}
