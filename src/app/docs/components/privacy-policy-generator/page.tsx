'use client';

import Link from 'next/link';
import { DocLayout } from '../DocLayout';
import { LegalCitationBlock } from '@/components/docs/LegalCitationBlock';

export default function PrivacyPolicyGeneratorDocs() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Privacy Policy Generator — NDPA Toolkit Documentation',
    description: 'NDPA 2023-compliant privacy policy generator for websites and applications',
    author: { '@type': 'Person', name: 'Abraham Esandayinze Tanta' },
    publisher: { '@type': 'Organization', name: 'NDPA Toolkit', url: 'https://ndprtoolkit.com.ng' },
    about: { '@type': 'SoftwareApplication', name: 'NDPA Toolkit' },
  };

  return (
    <DocLayout
      title="Privacy Policy Generator"
      description="NDPA 2023-compliant privacy policy generator for websites and applications"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex mb-6 gap-3">
        <Link href="/ndpr-demos/policy" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition">
          View Demo →
        </Link>
        <a href="https://github.com/mr-tanta/ndpr-toolkit/tree/main/packages/ndpr-toolkit/src/components/policy" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-card transition">
          View Source
        </a>
      </div>
      <LegalCitationBlock moduleId="policy" />

      <section id="overview" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Overview</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          The Privacy Policy Management components provide a comprehensive solution for creating, previewing, and exporting
          customized, NDPA-compliant privacy policies for your website or application. The system includes three main components:
          PolicyGenerator, PolicyPreview, and PolicyExporter, which work together to create professional, enterprise-ready
          privacy policies with variable support.
        </p>
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h4 className="font-semibold text-foreground mb-2">NDPA Privacy Policy Requirements</h4>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Under the NDPA 2023, organizations must maintain a clear and accessible privacy policy that informs data subjects
            about how their personal data is collected, processed, stored, and protected. The policy must be written in
            clear, plain language and cover specific elements required by the regulation.
          </p>
        </div>
      </section>

      <section id="installation" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Installation</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          Install the NDPR Toolkit package which includes the Privacy Policy Generator components:
        </p>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">pnpm add @tantainnovative/ndpr-toolkit</code>
        </pre>
      </section>

      <section id="components" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Components</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          The Privacy Policy Management system includes three main components that work together to create, preview, and export NDPA-compliant privacy policies:
        </p>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-foreground mb-2">PolicyGenerator</h3>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              The main component that allows users to create a policy by configuring sections and variables with an intuitive interface.
            </p>
            <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
              <code className="text-sm text-foreground font-mono">{`import { PolicyGenerator } from '@tantainnovative/ndpr-toolkit';

<PolicyGenerator
  sections={policySections}
  variables={policyVariables}
  onGenerate={(policy) => {
    // policy.sections - Updated sections
    // policy.variables - Updated variables with values
    // policy.content - Generated policy content in markdown format
    setPolicyContent(policy.content);
  }}
  title="Privacy Policy Generator"
  description="Create your NDPA-compliant privacy policy"
  showPreview={true}
  allowEditing={true}
/>`}</code>
            </pre>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-foreground mb-2">PolicyPreview</h3>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              A component for displaying the generated privacy policy with professional formatting and navigation features.
            </p>
            <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
              <code className="text-sm text-foreground font-mono">{`import { PolicyPreview } from '@tantainnovative/ndpr-toolkit';

<PolicyPreview
  content={policyContent}
  title="Privacy Policy"
  showTableOfContents={true}
  className="policy-preview"
  onContentChange={(updatedContent) => {
    setPolicyContent(updatedContent);
  }}
/>`}</code>
            </pre>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-foreground mb-2">PolicyExporter</h3>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              A utility component for exporting the generated policy in various formats (PDF, HTML, Markdown) with professional formatting.
            </p>
            <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
              <code className="text-sm text-foreground font-mono">{`import { PolicyExporter } from '@tantainnovative/ndpr-toolkit';

<PolicyExporter
  content={policyContent}
  title="Privacy Policy"
  filename="privacy-policy"
  formats={{
    pdf: true,
    markdown: true,
    html: true
  }}
  companyInfo={{
    name: "Your Company Name",
    logo: "/path/to/logo.png",
    website: "https://example.com",
    email: "privacy@example.com"
  }}
/>`}</code>
            </pre>
          </div>
        </div>
      </section>

      <section id="variable-support" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Variable Support</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          The Privacy Policy Management system supports variables in templates, allowing for dynamic and enterprise-ready policies.
          Variables are defined with specific types and can be edited through the PolicyGenerator interface, making it easy to customize
          the policy for different organizations and use cases.
        </p>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">Defining Variables</h3>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          Variables are defined as an array of PolicyVariable objects, each with properties like id, name, description, defaultValue,
          inputType, and required status. These variables can then be referenced in your policy sections using the <code className="text-foreground bg-muted px-1 rounded">{'{{'}</code> and <code className="text-foreground bg-muted px-1 rounded">{'}}'}</code> syntax.
        </p>

        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`const policyVariables = [
  {
    id: 'companyName',
    name: 'Company Name',
    description: 'The legal name of your organization',
    defaultValue: 'Your Company',
    value: '',
    inputType: 'text',
    required: true
  },
  {
    id: 'contactEmail',
    name: 'Contact Email',
    description: 'Email address for privacy inquiries',
    defaultValue: 'privacy@example.com',
    value: '',
    inputType: 'email',
    required: true
  },
  {
    id: 'effectiveDate',
    name: 'Effective Date',
    description: 'When this privacy policy takes effect',
    defaultValue: new Date().toISOString().split('T')[0],
    value: '',
    inputType: 'date',
    required: true
  },
  {
    id: 'dataRetentionPeriod',
    name: 'Data Retention Period',
    description: 'How long you retain user data',
    defaultValue: '12 months',
    value: '',
    inputType: 'text',
    required: true
  }
];

const policySections = [
  {
    id: 'introduction',
    title: 'Introduction',
    template: '# Privacy Policy for {{companyName}}\\n\\nLast Updated: {{effectiveDate}}\\n\\n{{companyName}} ("we", "us", or "our") is committed to protecting your privacy.',
    required: true,
    included: true,
    order: 1
  }
];`}</code>
        </pre>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">Variable Validation</h3>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          The <code className="text-foreground bg-muted px-1 rounded">generatePolicyText</code> utility also provides validation to help you identify missing variables:
        </p>

        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`// Passing PolicySection[] + OrganizationInfo returns an object with
// fullText, sectionTexts and missingVariables. (Passing a single
// template string instead returns just the substituted string.)
const result = generatePolicyText(policySections, orgInfo);

// The full generated text
console.log(result.fullText);

// Any required OrganizationInfo fields referenced but left empty
console.log(result.missingVariables); // e.g., ['privacyPhone']

// Individual section texts, keyed by section id
console.log(result.sectionTexts);`}</code>
        </pre>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">Using with PolicySection Array</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`import { generatePolicyText, PolicySection } from '@tantainnovative/ndpr-toolkit';

const policySections: PolicySection[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    template: '{{name}} ("we", "us", or "our") operates the {{website}} website.',
    required: true,
    included: true
  },
  {
    id: 'contact',
    title: 'Contact Us',
    template: 'If you have any questions, please contact us at {{privacyEmail}}.',
    required: true,
    included: true
  }
];

// With PolicySection[], the second argument is an OrganizationInfo object;
// only its keys (name, website, privacyEmail, ...) are substituted.
const orgInfo = {
  name: 'Acme Corporation',
  website: 'https://acme.com',
  privacyEmail: 'privacy@acme.com'
};

const result = generatePolicyText(policySections, orgInfo);

console.log(result.fullText);
console.log(result.sectionTexts.introduction);
console.log(result.sectionTexts.contact);`}</code>
        </pre>
      </section>

      <section id="usage" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Usage</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          Here&apos;s a complete example of how to implement the Privacy Policy Generator in your application:
        </p>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`import { useState } from 'react';
import {
  PolicyGenerator,
  PolicyPreview,
  PolicyExporter,
} from '@tantainnovative/ndpr-toolkit';
import type { PolicySection, PolicyVariable } from '@tantainnovative/ndpr-toolkit';

const policySections: PolicySection[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    template: '{{organizationName}} ("we", "us", or "our") operates the {{websiteUrl}} website.',
    required: true,
    included: true,
    order: 1
  },
  // More sections...
];

const policyVariables: PolicyVariable[] = [
  {
    id: 'organizationName',
    name: 'Organization Name',
    description: 'The legal name of your organization',
    defaultValue: 'Your Company',
    value: '',
    inputType: 'text',
    required: true
  },
  {
    id: 'websiteUrl',
    name: 'Website URL',
    description: 'Your primary website address',
    defaultValue: 'https://example.com',
    value: '',
    inputType: 'url',
    required: true
  }
];

function PrivacyPolicyPage() {
  const [policyContent, setPolicyContent] = useState('');

  return (
    <div>
      <PolicyGenerator
        sections={policySections}
        variables={policyVariables}
        onGenerate={(policy) => {
          // policy.sections  - PolicySection[] with current values
          // policy.variables - PolicyVariable[] with entered values
          // policy.content   - generated policy content (markdown)
          setPolicyContent(policy.content);
        }}
        title="Privacy Policy Generator"
        description="Create your NDPA-compliant privacy policy"
        showPreview={true}
        allowEditing={true}
      />

      {policyContent && (
        <div className="mt-6">
          <PolicyPreview
            content={policyContent}
            title="Privacy Policy"
            showTableOfContents={true}
            onContentChange={setPolicyContent}
          />
          <PolicyExporter
            content={policyContent}
            title="Privacy Policy"
            filename="privacy-policy"
            formats={{ pdf: true, markdown: true, html: true }}
          />
        </div>
      )}
    </div>
  );
}`}</code>
        </pre>
      </section>

      <section id="api" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">API Reference</h2>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">PolicyGenerator Props</h3>
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse mb-6">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Prop</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Default</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">onGenerate</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{`(policy: { sections: PolicySection[]; variables: PolicyVariable[]; content: string }) => void`}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Required</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Callback fired when the policy is generated, receiving the updated sections, variables, and generated content</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">sections</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">PolicySection[]</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">DEFAULT_POLICY_SECTIONS</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">List of policy sections to render and edit</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">variables</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">PolicyVariable[]</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">DEFAULT_POLICY_VARIABLES</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">List of policy variables editable through the interface</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">title</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">string</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{`"NDPA Privacy Policy Generator"`}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Title displayed on the generator</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">description</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">string</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">NDPA Section 27 default</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Description text displayed on the generator</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">generateButtonText</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">string</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{`"Generate Policy"`}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Text for the generate button</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">showPreview</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">boolean</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">true</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Whether to show a preview of the generated policy</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">allowEditing</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">boolean</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">true</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Whether to allow editing the generated policy content</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">className</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">string</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{`""`}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Custom CSS class for the generator container</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 px-4 text-sm font-medium text-foreground">unstyled</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">boolean</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">false</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Removes all default styles; use with classNames to apply your own</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">generatePolicyText Function</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`/**
 * Generates policy text by replacing variables in a template
 *
 * @param sectionsOrTemplate - Either an array of PolicySection objects or a template string
 * @param organizationInfoOrVariables - Either an OrganizationInfo object or a variables object
 * @returns Either a string (if no variables used) or an object with fullText, sectionTexts, and missingVariables
 */
function generatePolicyText(
  sectionsOrTemplate: PolicySection[] | string,
  organizationInfoOrVariables: OrganizationInfo | Record<string, string>
): string | {
  fullText: string;
  sectionTexts: Record<string, string>;
  missingVariables: string[];
}`}</code>
        </pre>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">PolicyTemplate Type</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`interface PolicyTemplate {
  id: string;
  name: string;
  description: string;
  organizationType: 'business' | 'nonprofit' | 'government' | 'educational';
  sections: PolicySection[];
  variables: Record<string, {
    name: string;
    description: string;
    required: boolean;
    defaultValue?: string;
  }>;
  version: string;
  lastUpdated: number;
  ndpaCompliant: boolean;
}`}</code>
        </pre>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">PolicySection Type</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`interface PolicySection {
  id: string;
  title: string;
  /** Template text for the section (supports {{variable}} tokens) */
  template: string;
  /** Whether the section is required by the NDPA */
  required: boolean;
  /** Whether the section is included in the generated policy */
  included: boolean;
  description?: string;
  order?: number;
  /** Variables that can be used in the section template */
  variables?: string[];
}`}</code>
        </pre>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">PolicyVariable Type</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`interface PolicyVariable {
  id: string;
  /** Name of the variable as it appears in the template */
  name: string;
  description: string;
  defaultValue?: string;
  /** Current value of the variable */
  value: string;
  inputType: 'text' | 'textarea' | 'email' | 'url' | 'date' | 'select';
  /** Options for select inputs */
  options?: string[];
  required: boolean;
}`}</code>
        </pre>

        <h3 className="text-xl font-bold text-foreground mt-8 mb-4">OrganizationInfo Type</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`interface OrganizationInfo {
  name: string;
  website: string;
  /** Contact email for privacy inquiries */
  privacyEmail: string;
  address?: string;
  privacyPhone?: string;
  dpoName?: string;
  dpoEmail?: string;
  industry?: string;
  /** NDPC registration number (if registered) */
  ndpcRegistrationNumber?: string;
}`}</code>
        </pre>
      </section>

      <section id="policy-page" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">PolicyPage — drop-in renderer</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{`<PolicyPage />`}</code>{' '}
          (added in v3.4.0) renders a fully-styled privacy policy from a typed{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">PrivacyPolicy</code> object.
          Pair it with <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">useDefaultPrivacyPolicy</code> for a zero-config compliance page:
        </p>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`// app/privacy/page.tsx
'use client';
import { useDefaultPrivacyPolicy } from '@tantainnovative/ndpr-toolkit';
import { PolicyPage } from '@tantainnovative/ndpr-toolkit/policy';

export default function PrivacyPage() {
  const { policy } = useDefaultPrivacyPolicy({
    orgInfo: {
      name: 'Acme Nigeria Ltd',
      email: 'privacy@acme.ng',
      website: 'https://acme.ng',
      address: '12 Marina, Lagos',
    },
  });

  return policy ? <PolicyPage policy={policy} /> : null;
}`}</code>
        </pre>

        <h3 className="text-lg font-semibold text-foreground mt-8 mb-3">Render mode: shadow vs inline</h3>
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">mode</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Renders</th>
                <th className="border border-border px-4 py-2 text-center font-semibold text-foreground">SEO</th>
                <th className="border border-border px-4 py-2 text-center font-semibold text-foreground">Host CSS isolation</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Best for</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground"><code className="bg-muted px-1 rounded">&apos;shadow&apos;</code> (default)</td>
                <td className="border border-border px-4 py-2 text-foreground">Inside Shadow DOM, opinionated styles included</td>
                <td className="border border-border px-4 py-2 text-center text-foreground">❌</td>
                <td className="border border-border px-4 py-2 text-center text-foreground">✅ structural</td>
                <td className="border border-border px-4 py-2 text-foreground">In-app embeds — drop-in widget</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground"><code className="bg-muted px-1 rounded">&apos;inline&apos;</code></td>
                <td className="border border-border px-4 py-2 text-foreground">Directly in host doc body</td>
                <td className="border border-border px-4 py-2 text-center text-foreground">✅</td>
                <td className="border border-border px-4 py-2 text-center text-foreground">⚠️ consumer styles</td>
                <td className="border border-border px-4 py-2 text-foreground">SSR&apos;d <code className="bg-muted px-1 rounded">/privacy</code> pages, public legal pages</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Inline mode + typography pairing</h3>
        <p className="text-muted-foreground mb-4">
          Inline mode defaults <code className="bg-muted px-1 py-0.5 rounded">includeStyles: false</code> so bare element selectors don&apos;t leak. Pair with your own typography library:
        </p>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`// Tailwind + @tailwindcss/typography
<article className="prose prose-slate dark:prose-invert max-w-3xl mx-auto">
  <PolicyPage policy={policy} mode="inline" />
</article>

// shadcn-ui Card
<Card>
  <CardContent className="prose dark:prose-invert">
    <PolicyPage policy={policy} mode="inline" />
  </CardContent>
</Card>

// Raw CSS (target the data attribute)
[data-ndpr-component="policy-page"] article {
  font-family: Georgia, serif;
  line-height: 1.7;
}`}</code>
        </pre>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Theme: light / dark / auto</h3>
        <p className="text-muted-foreground mb-4">
          Theme defaults to <code className="bg-muted px-1 py-0.5 rounded">&apos;light&apos;</code> (added in v3.4.1). Shadow DOM does <strong>not</strong> isolate{' '}
          <code className="bg-muted px-1 py-0.5 rounded">prefers-color-scheme</code>, so before 3.4.1 every visitor on macOS dark mode saw a dark policy bleed through any light-only host. Default light is safer for embedded widgets — opt in to OS-driven theming when you actively want it:
        </p>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`// Default — no prefers-color-scheme: dark block emitted.
<PolicyPage policy={policy} />

// Force dark.
<PolicyPage policy={policy} options={{ theme: 'dark' }} />

// Follow OS preference.
<PolicyPage policy={policy} options={{ theme: 'auto' }} />`}</code>
        </pre>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">TOC anchor links work in Shadow DOM</h3>
        <p className="text-muted-foreground mb-4">
          The exported policy includes a table-of-contents nav with intra-document anchors. Browser default
          anchor behaviour can&apos;t traverse Shadow DOM boundaries, so as of v3.5.1 PolicyPage installs a click
          delegate on the shadow root that intercepts these clicks and scrolls the matching{' '}
          <code className="bg-muted px-1 py-0.5 rounded">{`<section>`}</code> into view. No consumer code required.
        </p>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Custom CSS injection</h3>
        <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <code className="text-sm text-foreground font-mono">{`// Brand without leaving shadow mode.
<PolicyPage
  policy={policy}
  options={{
    customCSS: ':root { --color-accent: #1d4ed8; --max-width: 64rem; }',
  }}
/>`}</code>
        </pre>
      </section>

      <section id="best-practices" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Best Practices</h2>
        <ul className="space-y-3 text-muted-foreground leading-relaxed list-disc pl-6">
          <li>
            <strong className="text-foreground">Clear Language:</strong> Ensure your privacy policy is written in clear, plain language that is easy for data subjects to understand.
          </li>
          <li>
            <strong className="text-foreground">Regular Updates:</strong> Review and update your privacy policy regularly, especially when there are changes to your data processing activities.
          </li>
          <li>
            <strong className="text-foreground">Accessibility:</strong> Make your privacy policy easily accessible on your website or application, typically through a link in the footer.
          </li>
          <li>
            <strong className="text-foreground">Customization:</strong> While the generator provides a solid template, customize the policy to accurately reflect your specific data practices.
          </li>
          <li>
            <strong className="text-foreground">Legal Review:</strong> Have your generated privacy policy reviewed by a legal professional familiar with the NDPA to ensure compliance.
          </li>
          <li>
            <strong className="text-foreground">Use Variables:</strong> Leverage the variable system to create reusable templates that can be easily updated when your organization information changes.
          </li>
        </ul>
      </section>

      <section id="help-resources" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Need Help?</h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          If you have questions about implementing the Privacy Policy Generator or need assistance with NDPA compliance, check out these resources:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-2">GitHub Issues</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Report bugs or request features on our GitHub repository.
            </p>
            <a href="https://github.com/mr-tanta/ndpr-toolkit/issues" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition">
              View Issues
            </a>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-2">NDPA Resources</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Learn more about NDPA 2023 compliance requirements.
            </p>
            <a href="https://ndpc.gov.ng/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition">
              NDPA Framework
            </a>
          </div>
        </div>
      </section>
    </DocLayout>
  );
}
