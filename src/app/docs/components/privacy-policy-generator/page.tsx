'use client';

import Link from 'next/link';
import { DocLayout } from '../DocLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function PrivacyPolicyGeneratorDocs() {
  return (
    <DocLayout
      title="Privacy Policy Generator"
      description="NDPA 2023-compliant privacy policy generator for websites and applications"
    >
      <div className="flex mb-6 space-x-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/ndpr-demos/policy">
            View Demo
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <a href="https://github.com/mr-tanta/ndpr-toolkit/tree/main/packages/ndpr-toolkit/src/components/policy" target="_blank" rel="noopener noreferrer">
            View Source
          </a>
        </Button>
      </div>
      
      <section id="overview" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Overview</h2>
        <p className="mb-4">
          The Privacy Policy Management components provide a comprehensive solution for creating, previewing, and exporting
          customized, NDPA-compliant privacy policies for your website or application. The system includes three main components:
          PolicyGenerator, PolicyPreview, and PolicyExporter, which work together to create professional, enterprise-ready
          privacy policies with variable support.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
          <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-2">NDPA Privacy Policy Requirements</h4>
          <p className="text-blue-700 dark:text-blue-300 text-sm mb-0">
            Under the NDPA 2023, organizations must maintain a clear and accessible privacy policy that informs data subjects 
            about how their personal data is collected, processed, stored, and protected. The policy must be written in 
            clear, plain language and cover specific elements required by the regulation.
          </p>
        </div>
      </section>

      <section id="installation" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <p className="mb-4">
          Install the NDPR Toolkit package which includes the Privacy Policy Generator components:
        </p>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto mb-4">
          <pre><code>pnpm add @tantainnovative/ndpr-toolkit</code></pre>
        </div>
      </section>

      <section id="components" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Components</h2>
        <p className="mb-4">
          The Privacy Policy Management system includes three main components that work together to create, preview, and export NDPA-compliant privacy policies:
        </p>
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-2">PolicyGenerator</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              The main component that allows users to create a policy by configuring sections and variables with an intuitive interface.
            </p>
            <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
              <pre><code>{`import { PolicyGenerator } from '@tantainnovative/ndpr-toolkit';

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
/>`}</code></pre>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-2">PolicyPreview</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              A component for displaying the generated privacy policy with professional formatting and navigation features.
            </p>
            <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
              <pre><code>{`import { PolicyPreview } from '@tantainnovative/ndpr-toolkit';

<PolicyPreview 
  content={policyContent} // Markdown content of the policy
  title="Privacy Policy"
  showTableOfContents={true}
  className="policy-preview"
  onContentChange={(updatedContent) => {
    setPolicyContent(updatedContent);
  }}
/>`}</code></pre>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-2">PolicyExporter</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              A utility component for exporting the generated policy in various formats (PDF, HTML, Markdown) with professional formatting.
            </p>
            <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
              <pre><code>{`import { PolicyExporter } from '@tantainnovative/ndpr-toolkit';

<PolicyExporter 
  content={policyContent} // Markdown content of the policy
  title="Privacy Policy"
  filename="privacy-policy"
  formats={{
    pdf: true,
    markdown: true,
    html: true
  }}
  companyInfo={{
    name: "Your Company Name",
    logo: "/path/to/logo.png", // Optional
    website: "https://example.com",
    email: "privacy@example.com"
  }}
/>`}</code></pre>
            </div>
          </div>
        </div>
      </section>

      <section id="variable-support" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Variable Support</h2>
        <p className="mb-4">
          The Privacy Policy Management system supports variables in templates, allowing for dynamic and enterprise-ready policies. 
          Variables are defined with specific types and can be edited through the PolicyGenerator interface, making it easy to customize
          the policy for different organizations and use cases.
        </p>
        
        <h3 className="text-xl font-bold mt-6 mb-4">Defining Variables</h3>
        <p className="mb-4">
          Variables are defined as an array of PolicyVariable objects, each with properties like id, name, description, defaultValue,
          inputType, and required status. These variables can then be referenced in your policy sections using the <code>{'{{'}</code> and <code>{'}}'}</code> syntax.
        </p>
        
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto mb-6">
          <pre><code>{`// Example of defining policy variables
const policyVariables = [
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

// Example of a policy section that uses variables
const policySections = [
  {
    id: 'introduction',
    title: 'Introduction',
    content: '# Privacy Policy for {{companyName}}\n\nLast Updated: {{effectiveDate}}\n\n## Introduction\n{{companyName}} ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our services.',
    enabled: true,
    order: 1
  },
This page informs you of our policies regarding the collection, use, and disclosure 
of personal data when you use our Service and the choices you have associated with that data.

## Contact Us
If you have any questions about this Privacy Policy, please contact us:
- By email: {{contactEmail}}
- By visiting this page on our website: {{websiteUrl}}/contact
\`;

// Using the template with the generatePolicyText utility
import { generatePolicyText } from '@tantainnovative/ndpr-toolkit';

const variables = {
  organizationName: 'Acme Corporation',
  lastUpdated: new Date().toLocaleDateString(),
  websiteUrl: 'https://acme.com',
  contactEmail: 'privacy@acme.com'
};

const generatedPolicy = generatePolicyText(policyTemplate, variables);

// The result will have all variables replaced with their values
console.log(generatedPolicy);`}</code></pre>
        </div>
        
        <h3 className="text-xl font-bold mt-6 mb-4">Variable Validation</h3>
        <p className="mb-4">
          The <code>generatePolicyText</code> utility also provides validation to help you identify missing variables:
        </p>
        
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto mb-6">
          <pre><code>{`// The function returns an object with additional information
const result = generatePolicyText(policyTemplate, variables);

// The full generated text
console.log(result.fullText);

// Any missing variables that weren't provided
console.log(result.missingVariables); // e.g., ['phoneNumber']

// Individual section texts if using PolicySection[] input
console.log(result.sectionTexts);`}</code></pre>
        </div>
        
        <h3 className="text-xl font-bold mt-6 mb-4">Using with PolicySection Array</h3>
        <p className="mb-4">
          Variables also work with the array-based policy section format:
        </p>
        
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`import { generatePolicyText, PolicySection } from '@tantainnovative/ndpr-toolkit';

const policySections: PolicySection[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    content: '{{organizationName}} ("we", "us", or "our") operates the {{websiteUrl}} website.'
  },
  {
    id: 'data-collection',
    title: 'Data Collection',
    content: 'We collect several different types of information for various purposes to provide and improve our Service to you.'
  },
  {
    id: 'contact',
    title: 'Contact Us',
    content: 'If you have any questions, please contact us at {{contactEmail}}.'
  }
];

const variables = {
  organizationName: 'Acme Corporation',
  websiteUrl: 'https://acme.com',
  contactEmail: 'privacy@acme.com'
};

const result = generatePolicyText(policySections, variables);

// Access the full text
console.log(result.fullText);

// Access individual section texts
console.log(result.sectionTexts.introduction);
console.log(result.sectionTexts.contact);`}</code></pre>
        </div>
      </section>

      <section id="usage" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Usage</h2>
        <p className="mb-4">
          Here&apos;s a complete example of how to implement the Privacy Policy Generator in your application:
        </p>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`import { useState } from 'react';
import { 
  PolicyGenerator, 
  PolicyPreview, 
  PolicyExporter,
  generatePolicyText,
} from '@tantainnovative/ndpr-toolkit';
import type { PolicySection } from '@tantainnovative/ndpr-toolkit';

// Define your policy templates
const policyTemplates = [
  {
    id: 'standard',
    name: 'Standard Privacy Policy',
    description: 'A comprehensive privacy policy suitable for most websites and applications.',
    sections: [
      {
        id: 'introduction',
        title: 'Introduction',
        content: '{{organizationName}} ("we", "us", or "our") operates the {{websiteUrl}} website ("the Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.'
      },
      {
        id: 'data-collection',
        title: 'Information Collection and Use',
        content: 'We collect several different types of information for various purposes to provide and improve our Service to you.'
      },
      // More sections...
    ]
  },
  {
    id: 'minimal',
    name: 'Minimal Privacy Policy',
    description: 'A simplified privacy policy for small websites with minimal data collection.',
    sections: [
      // Sections...
    ]
  }
];

function PrivacyPolicyPage() {
  const [generatedPolicy, setGeneratedPolicy] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('standard');
  const [policyData, setPolicyData] = useState({
    organizationName: '',
    organizationWebsite: '',
    organizationContact: '',
    // Other fields...
  });
  const [variables, setVariables] = useState({
    organizationName: '',
    websiteUrl: '',
    contactEmail: '',
    lastUpdated: new Date().toLocaleDateString()
  });
  
  const handlePolicyGenerated = (data) => {
    setPolicyData(data);
    
    // Update variables based on policy data
    setVariables({
      ...variables,
      organizationName: data.organizationName,
      websiteUrl: data.organizationWebsite,
      contactEmail: data.organizationContact
    });
    
    // Find the selected template
    const template = policyTemplates.find(t => t.id === selectedTemplate);
    
    // Generate the policy text with variables
    const result = generatePolicyText(template.sections, variables);
    
    setGeneratedPolicy({
      title: \`Privacy Policy for \${data.organizationName}\`,
      content: result.fullText,
      sections: template.sections.map(section => ({
        ...section,
        content: result.sectionTexts[section.id] || section.content
      })),
      lastUpdated: new Date()
    });
  };
  
  const handleExportPolicy = (format) => {
    // Export logic...
  };
  
  return (
    <div>
      {!generatedPolicy ? (
        <PolicyGenerator 
          onComplete={handlePolicyGenerated}
          templates={policyTemplates}
          initialValues={policyData}
          onTemplateSelect={(templateId) => setSelectedTemplate(templateId)}
          variables={variables}
        />
      ) : (
        <div>
          <PolicyPreview 
            policy={generatedPolicy}
            onEdit={() => setGeneratedPolicy(null)}
            variables={variables}
            onVariableChange={(newVariables) => {
              setVariables(newVariables);
              
              // Regenerate policy with new variables
              const template = policyTemplates.find(t => t.id === selectedTemplate);
              const result = generatePolicyText(template.sections, newVariables);
              
              setGeneratedPolicy({
                ...generatedPolicy,
                content: result.fullText,
                sections: template.sections.map(section => ({
                  ...section,
                  content: result.sectionTexts[section.id] || section.content
                }))
              });
            }}
          />
          
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-2">Export Options</h3>
            <PolicyExporter
              policy={generatedPolicy}
              formats={['html', 'pdf', 'markdown']}
              filename={\`privacy-policy-\${policyData.organizationName.toLowerCase().replace(/\\s+/g, '-')}\`}
              onExport={handleExportPolicy}
            />
          </div>
        </div>
      )}
    </div>
  );
}`}</code></pre>
        </div>
      </section>

      <section id="api" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">API Reference</h2>
        
        <h3 className="text-xl font-bold mt-8 mb-4">PolicyGenerator Props</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prop</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Default</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">onComplete</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{`(data: PolicyData) => void`}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Required</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Callback when policy generation is complete</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">templates</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">PolicyTemplate[]</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Required</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Array of policy templates</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">initialValues</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{`Partial<PolicyData>`}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{}</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Initial values for the policy form</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">onTemplateSelect</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{`(templateId: string) => void`}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">undefined</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Callback when a template is selected</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">variables</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{`Record<string, string>`}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{}</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Variables to replace in policy templates</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4">generatePolicyText Function</h3>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`/**
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
}`}</code></pre>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4">PolicyTemplate Type</h3>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`type PolicyTemplate = {
  id: string;
  name: string;
  description: string;
  sections: PolicySection[];
};`}</code></pre>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4">PolicySection Type</h3>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`type PolicySection = {
  id: string;
  title: string;
  content: string;
  required?: boolean;
};`}</code></pre>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4">PolicyData Type</h3>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
          <pre><code>{`type PolicyData = {
  // Organization Information
  organizationName: string;
  organizationWebsite: string;
  organizationContact: string;
  dpoName?: string;
  dpoEmail?: string;
  
  // Data Collection
  dataCollectionMethods: string[];
  personalDataTypes: string[];
  sensitiveDataTypes?: string[];
  legalBasisForProcessing: string[];
  
  // Data Usage
  dataUsagePurposes: string[];
  automaticDecisionMaking: boolean;
  
  // Data Sharing
  thirdPartySharing: boolean;
  thirdPartyCategories?: string[];
  internationalTransfers: boolean;
  transferSafeguards?: string;
  
  // Data Subject Rights
  dataSubjectRightsProcess: string;
  
  // Security and Retention
  securityMeasures: string[];
  retentionPeriod: string;
  
  // Cookies and Tracking
  usesCookies: boolean;
  cookieTypes?: string[];
  
  // Additional Information
  lastUpdated: Date;
  effectiveDate: Date;
  additionalInformation?: string;
};`}</code></pre>
        </div>
      </section>

      <section id="best-practices" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Clear Language:</strong> Ensure your privacy policy is written in clear, plain language that is easy for data subjects to understand.
          </li>
          <li>
            <strong>Regular Updates:</strong> Review and update your privacy policy regularly, especially when there are changes to your data processing activities.
          </li>
          <li>
            <strong>Accessibility:</strong> Make your privacy policy easily accessible on your website or application, typically through a link in the footer.
          </li>
          <li>
            <strong>Customization:</strong> While the generator provides a solid template, customize the policy to accurately reflect your specific data practices.
          </li>
          <li>
            <strong>Legal Review:</strong> Have your generated privacy policy reviewed by a legal professional familiar with the NDPA to ensure compliance.
          </li>
          <li>
            <strong>Use Variables:</strong> Leverage the variable system to create reusable templates that can be easily updated when your organization information changes.
          </li>
        </ul>
      </section>

      <section id="help-resources" className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
        <p className="mb-4">
          If you have questions about implementing the Privacy Policy Generator or need assistance with NDPA compliance, check out these resources:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">GitHub Issues</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                Report bugs or request features on our GitHub repository.
              </p>
              <Button asChild variant="outline" size="sm">
                <a href="https://github.com/mr-tanta/ndpr-toolkit/issues" target="_blank" rel="noopener noreferrer">
                  View Issues
                </a>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">NDPA Resources</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                Learn more about NDPA 2023 compliance requirements.
              </p>
              <Button asChild variant="outline" size="sm">
                <a href="https://ndpc.gov.ng/" target="_blank" rel="noopener noreferrer">
                  NDPA Framework
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </DocLayout>
  );
}
