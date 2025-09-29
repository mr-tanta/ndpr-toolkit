"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  PolicyGenerator,
  PolicyPreview,
  PolicyExporter,
} from "@tantainnovative/ndpr-toolkit";
import type { PolicySection, PolicyVariable, PolicyTemplate } from "@/types";

export default function PolicyDemoPage() {
  const [activeTab, setActiveTab] = useState<string>("generator");
  // Initialize with empty objects/arrays to prevent undefined errors
  const [policyData, setPolicyData] = useState<Record<string, unknown>>({});
  const [generatedPolicy, setGeneratedPolicy] = useState<PolicySection[]>([]);
  const [policyVariables, setPolicyVariables] = useState<PolicyVariable[]>([]);

  // Helper: process conditional {{#if …}}…{{else}}…{{/if}} blocks
  const processConditionalBlocks = (
    content: string,
    data: Record<string, unknown>,
  ): string => {
    if (!content || typeof content !== "string") return "";
    if (!data || typeof data !== "object") data = {};

    try {
      // First pass: Process nested if blocks from innermost to outermost
      let processedContent = content;
      let lastContent = "";

      // Keep processing until no more changes are made (handles nested conditionals)
      while (processedContent !== lastContent) {
        lastContent = processedContent;
        const ifRegex =
          /\{\{#if ([^}]+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g;

        processedContent = processedContent.replace(
          ifRegex,
          (_match, variable, ifContent, elseContent = "") => {
            if (!variable || typeof variable !== "string") return elseContent;

            // Handle complex conditions with AND/OR operators
            if (variable.includes("&&") || variable.includes("||")) {
              try {
                // Create a safe evaluation context with data variables
                const evalContext = { ...data };
                // Replace operators with JavaScript operators
                const jsCondition = variable
                  .replace(/\s*&&\s*/g, " && ")
                  .replace(/\s*\|\|\s*/g, " || ");

                // Safely evaluate the condition
                const result = Object.keys(evalContext).some(
                  (key) => jsCondition.includes(key) && evalContext[key],
                );

                return result ? ifContent : elseContent;
              } catch (error) {
                console.error("Error evaluating complex condition:", error);
                return elseContent;
              }
            }

            // Handle simple conditions
            let value = data[variable];
            if (value === "true") value = true;
            if (value === "false") value = false;
            if (Array.isArray(value) && value.length === 0) value = false;
            if (value === "" || value === undefined || value === null)
              value = false;

            return value ? ifContent : elseContent;
          },
        );
      }

      // Second pass: Clean up any empty lines and extra whitespace
      return processedContent
        .replace(/\n{3,}/g, "\n\n") // Replace multiple newlines with double newlines
        .replace(/\s+\n/g, "\n") // Remove trailing whitespace
        .trim();
    } catch (error) {
      console.error("Error processing conditional blocks:", error);
      return content; // Return original content if tHere&apos;s an error
    }
  };

  // Build the exportable markdown/HTML content
  const generateFormattedContent = (): string => {
    try {
      if (
        !generatedPolicy ||
        !Array.isArray(generatedPolicy) ||
        generatedPolicy.length === 0
      ) {
        return "# No policy content generated yet\n\nPlease use the generator to create your policy.";
      }

      // Get current date in a professional format
      const formattedDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Create a professional header with proper spacing and formatting
      const policyTitle = `# ${policyData?.organizationName || "Your Organization"} Privacy Policy\n\n`;
      const lastUpdated = `*Last Updated: ${formattedDate}*\n\n`;
      const complianceNotice = `*This privacy policy is designed to comply with the Nigeria Data Protection Regulation (NDPR) and has been prepared by ${policyData?.organizationName || "Your Organization"}.*\n\n`;

      // Add a professional table of contents
      let tableOfContents = "## Table of Contents\n\n";
      const includedSections = generatedPolicy.filter(
        (section) => section && section.included !== false,
      );

      includedSections.forEach((section, index) => {
        if (section && section.title) {
          tableOfContents += `${index + 1}. [${section.title}](#${section.id})\n`;
        }
      });
      tableOfContents += "\n";

      // Process each section with careful error handling and enhanced formatting
      const sectionsContent = includedSections
        .map((section, sectionIndex) => {
          try {
            if (
              !section ||
              !section.template ||
              typeof section.template !== "string"
            ) {
              return "";
            }

            let processed = section.template;
            const sectionVars = section.variables || [];

            // Process all variables for this section
            if (Array.isArray(sectionVars)) {
              sectionVars.forEach((varName) => {
                if (typeof varName !== "string") return;

                let val: unknown = policyData?.[varName] ?? "";

                // Format array values as professional bullet points
                if (Array.isArray(val) && val.length > 0) {
                  val = val.map((item, i) => `${i + 1}. ${item}`).join("\n\n");
                } else if (Array.isArray(val)) {
                  val = "Not specified";
                }

                // Handle special formatting for dates
                if (
                  varName.toLowerCase().includes("date") &&
                  typeof val === "string"
                ) {
                  try {
                    const date = new Date(val);
                    if (!isNaN(date.getTime())) {
                      val = date.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      });
                    }
                  } catch {
                    // Keep original value if date parsing fails
                  }
                }

                try {
                  // Replace both triple and double braces for HTML/plain text
                  const valStr = String(val);
                  processed = processed
                    .replace(
                      new RegExp(`\\{\\{\\{${varName}\\}\\}\\}`, "g"),
                      valStr,
                    )
                    .replace(new RegExp(`\\{\\{${varName}\\}\\}`, "g"), valStr);
                } catch (regexError) {
                  console.error("Error replacing variables:", regexError);
                }
              });
            }

            // Process conditional blocks with enhanced error handling
            try {
              processed = processConditionalBlocks(processed, policyData || {});
            } catch (condError) {
              console.error("Error processing conditional blocks:", condError);
            }

            // Add section number for better organization
            return `## ${sectionIndex + 1}. ${section.title || "Untitled Section"} {#${section.id}}\n\n${processed}`;
          } catch (sectionError) {
            console.error("Error processing section:", sectionError);
            return "";
          }
        })
        .filter(Boolean)
        .join("\n\n");

      // Add a professional footer
      const footer = `\n\n---\n\n*This privacy policy was last updated on ${formattedDate}. If you have any questions about this policy, please contact ${policyData?.dpoName || "our Data Protection Officer"} at ${policyData?.dpoEmail || policyData?.contactEmail || "our contact email"}.*\n\n© ${new Date().getFullYear()} ${policyData?.organizationName || "Your Organization"}. All rights reserved.`;

      return (
        policyTitle +
        lastUpdated +
        complianceNotice +
        tableOfContents +
        sectionsContent +
        footer
      );
    } catch (error) {
      console.error("Error generating formatted content:", error);
      return "# Error Generating Policy\n\nThere was an error generating your policy content. Please try again.";
    }
  };

  // Called when PolicyGenerator emits data
  const handleGeneratePolicy = (data: Record<string, unknown>) => {
    try {
      console.log("Policy generator data received:", data);

      // Validate sections
      const sections = Array.isArray(data?.sections) ? data.sections : [];
      // Validate variables
      const variables = Array.isArray(data?.variables) ? data.variables : [];
      // Validate values
      const values =
        data?.values && typeof data.values === "object" ? data.values : {};

      // Update state with validated data
      setGeneratedPolicy(sections);
      setPolicyVariables(variables);
      setPolicyData(values as Record<string, unknown>);

      // Only navigate if we have valid sections
      if (sections.length > 0) {
        setActiveTab("display");
      } else {
        console.warn("No policy sections were generated");
      }
    } catch (error) {
      console.error("Error handling policy generation:", error);
      // Initialize with empty arrays to prevent mapping errors
      setGeneratedPolicy([]);
      setPolicyVariables([]);
      setPolicyData({});
    }
  };

  // Handle policy edits - we'll need to implement this differently since PolicyPreview doesn&apos;t support direct section updates
  const handlePolicyEdit = () => {
    console.log("Policy edit requested");
    // In a real implementation, you might want to switch back to the generator tab or open an edit modal
    setActiveTab("generator");
  };

  // Your NDPR template definition
  const policyTemplate: PolicyTemplate = {
    id: "ndpr-policy",
    name: "NDPR Compliant Privacy Policy",
    description: "A comprehensive privacy policy template compliant with NDPR",
    organizationType: "business",
    version: "1.0",
    lastUpdated: Date.now(), // Using timestamp as required by the PolicyTemplate type
    variables: [
      {
        name: "organizationName",
        label: "Organization Name",
        type: "text",
        required: true,
        defaultValue: "Your Company"
      },
      {
        name: "website",
        label: "Website URL",
        type: "text",
        required: true,
        defaultValue: "https://example.com"
      },
      {
        name: "contactEmail",
        label: "Contact Email",
        type: "text",
        required: true,
        defaultValue: "privacy@example.com"
      },
      {
        name: "address",
        label: "Business Address",
        type: "textarea",
        required: true,
        defaultValue: "123 Business Street, Lagos, Nigeria"
      },
      {
        name: "phone",
        label: "Contact Phone",
        type: "text",
        required: true,
        defaultValue: "+234 123 456 7890"
      },
      {
        name: "dpoName",
        label: "Data Protection Officer Name",
        type: "text",
        required: true,
        defaultValue: "John Doe"
      },
      {
        name: "dpoEmail",
        label: "DPO Email",
        type: "text",
        required: true,
        defaultValue: "dpo@example.com"
      },
      {
        name: "industry",
        label: "Industry",
        type: "text",
        required: true,
        defaultValue: "Technology"
      },
      {
        name: "effectiveDate",
        label: "Effective Date",
        type: "date",
        required: true,
        defaultValue: new Date().toLocaleDateString()
      }
    ],
    sections: [
      {
        id: "introduction",
        title: "Introduction",
        required: true,
        order: 1,
        included: true,
        content: `## Introduction

{{organizationName}} ("we", "us", or "our") is committed to protecting your personal data and respecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you interact with our services, website, and applications.

This policy is compliant with the Nigeria Data Protection Regulation (NDPR) 2019 and applies to all personal data processed by us. By using our services, you consent to the data practices described in this Privacy Policy.

### About Us

{{organizationName}} is a {{organizationType}} organization registered in Nigeria with its principal place of business at {{address}}. We can be contacted at:

- Email: {{contactEmail}}
- Phone: {{phone}}
- Address: {{address}}

### Data Protection Officer

We have appointed a Data Protection Officer ("DPO") who is responsible for overseeing questions regarding this Privacy Policy. If you have any questions about this Privacy Policy, including any requests to exercise your legal rights, please contact our DPO using the details below:

- Name: {{dpoName}}
- Email: {{dpoEmail}}
- Address: {{address}}

### Effective Date

This Privacy Policy is effective as of {{effectiveDate}} and will remain in effect except with respect to any changes in its provisions in the future, which will be in effect immediately after being posted on this page.`,
        included: true,
        variables: [
          "organizationName",
          "organizationType",
          "address",
          "contactEmail",
          "phone",
          "dpoName",
          "dpoEmail",
          "effectiveDate",
        ],
      },
      {
        id: "definitions",
        title: "Definitions",
        required: true,
        description: "Define key terms used throughout the policy",
        template: `## Key Definitions

To help you understand this Privacy Policy, here are definitions of key terms used throughout:

- **Personal Data**: Any information relating to an identified or identifiable natural person ('data subject'); an identifiable natural person is one who can be identified, directly or indirectly, in particular by reference to an identifier such as a name, an identification number, location data, an online identifier or to one or more factors specific to the physical, physiological, genetic, mental, economic, cultural or social identity of that natural person.

- **Data Subject**: A natural person who is the subject of Personal Data, i.e., the individual to whom the Personal Data relates.

- **Processing**: Any operation or set of operations which is performed on Personal Data or on sets of Personal Data, whether or not by automated means, such as collection, recording, organization, structuring, storage, adaptation or alteration, retrieval, consultation, use, disclosure by transmission, dissemination or otherwise making available, alignment or combination, restriction, erasure or destruction.

- **Data Controller**: The natural or legal person, public authority, agency or other body which, alone or jointly with others, determines the purposes and means of the processing of Personal Data. For the purposes of this Privacy Policy, {{organizationName}} is the Data Controller.

- **Data Processor**: A natural or legal person, public authority, agency or other body which processes Personal Data on behalf of the Data Controller.

- **Consent**: Any freely given, specific, informed and unambiguous indication of the Data Subject's wishes by which he or she, by a statement or by a clear affirmative action, signifies agreement to the processing of Personal Data relating to him or her.

- **Data Breach**: A breach of security leading to the accidental or unlawful destruction, loss, alteration, unauthorized disclosure of, or access to, Personal Data transmitted, stored or otherwise processed.

- **NDPR**: The Nigeria Data Protection Regulation 2019, issued by the National Information Technology Development Agency (NITDA).

- **NITDA**: The National Information Technology Development Agency, the regulatory body responsible for enforcing the NDPR in Nigeria.

- **Special Categories of Personal Data**: Personal Data revealing racial or ethnic origin, political opinions, religious or philosophical beliefs, trade union membership, genetic data, biometric data, data concerning health, or data concerning a natural person's sex life or sexual orientation.`,
        included: true,
        variables: ["organizationName"],
      },
      {
        id: "dataCollection",
        title: "Data Collection",
        required: true,
        description:
          "Explain what personal data you collect and how you collect it",
        template: `## Personal Data We Collect

### Categories of Personal Data We Collect

{{#if collectsPersonalData}}
We collect and process various categories of personal data for the purposes set out in this Privacy Policy. These categories include:

{{{dataTypes}}}
{{else}}
We do not collect personal data beyond what is necessary for basic website functionality.
{{/if}}

### How We Collect Personal Data

We collect personal data through various methods, including:

1. **Direct Interactions**: When you provide your personal data by filling in forms, creating an account, subscribing to our services, requesting marketing materials, participating in surveys, or corresponding with us.

2. **Automated Technologies**: As you interact with our {{website}}, we automatically collect Technical Data about your equipment, browsing actions, and patterns using cookies, server logs, and other similar technologies.

3. **Third Parties or Publicly Available Sources**: We may receive personal data about you from various third parties and public sources, such as analytics providers, advertising networks, search information providers, data brokers, or publicly available databases.

### Cookies and Similar Technologies

{{#if usesCookies}}
We use cookies and similar tracking technologies to track activity on our services and to hold certain information. The types of cookies we use include:

{{{cookieTypes}}}

You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our services.
{{else}}
We do not use cookies or similar tracking technologies on our website.
{{/if}}

### Children's Privacy

{{#if collectsChildrenData}}
We may collect data from children under 13 with verifiable parental consent. Parents can review, delete, or refuse further collection of their child's personal data by contacting us using the details provided in this Privacy Policy.
{{else}}
Our services are not intended for children under the age of 13, and we do not knowingly collect personal data from children under 13. If we learn we have collected or received personal data from a child under 13 without verification of parental consent, we will delete that information.
{{/if}}`,
        included: true,
        variables: [
          "collectsPersonalData",
          "dataTypes",
          "website",
          "usesCookies",
          "cookieTypes",
          "collectsChildrenData",
        ],
      },
      {
        id: "dataUse",
        title: "Use of Personal Data",
        required: true,
        description: "Explain how you use the personal data you collect",
        template: `## How We Use Your Personal Data

### Purposes for Processing Your Personal Data

{{#if collectsPersonalData}}
We will only use your personal data when the law allows us and for legitimate purposes. We process your personal data for the following purposes:

{{{dataPurposes}}}
{{else}}
We do not collect or process personal data beyond what is necessary for basic website functionality.
{{/if}}

### Automated Decision-Making and Profiling

We may use automated decision-making processes, including profiling, to analyze your personal data and make decisions that may have a significant effect on you. These processes may be used for purposes such as:

- Determining your eligibility for certain products or services
- Personalizing your experience and the content we show you
- Detecting fraudulent or suspicious activity

You have the right not to be subject to a decision based solely on automated processing, including profiling, which produces legal effects concerning you or similarly significantly affects you, except where:

- It is necessary for entering into or performing a contract between you and us
- It is authorized by applicable law
- It is based on your explicit consent

### Change of Purpose

We will only use your personal data for the purposes for which we collected it, unless we reasonably consider that we need to use it for another reason and that reason is compatible with the original purpose. If we need to use your personal data for an unrelated purpose, we will notify you and explain the legal basis which allows us to do so.

Please note that we may process your personal data without your knowledge or consent, in compliance with the above rules, where this is required or permitted by law.`,
        included: true,
        variables: ["collectsPersonalData", "dataPurposes"],
      },
      {
        id: "legalBasis",
        title: "Legal Basis for Processing",
        required: true,
        description: "Explain the legal basis for processing personal data",
        template: `## Legal Basis for Processing Personal Data

Under the Nigeria Data Protection Regulation (NDPR), we must have a valid legal basis for processing your personal data. We rely on the following legal bases for processing your personal data:

{{#if legalBases}}
{{{legalBases}}}
{{else}}
### Consent

We process certain personal data based on your consent. This means you have given us specific, informed, and unambiguous consent to process your personal data for particular purposes. For example, when you opt-in to receive marketing communications or agree to the use of certain cookies on our website.

You have the right to withdraw your consent at any time by contacting us using the details provided in this Privacy Policy or by using the opt-out mechanisms we provide (such as unsubscribe links in our marketing emails).

### Contractual Necessity

We process personal data when it is necessary for the performance of a contract to which you are a party or to take steps at your request before entering into such a contract. For example, when you purchase our products or services, we need to process your personal data to fulfill your order, provide customer support, and manage your account.

### Legal Obligation

We process personal data when it is necessary for compliance with a legal obligation to which we are subject. For example, we may need to process your personal data to comply with tax laws, regulatory requirements, or court orders.

### Legitimate Interests

We process personal data when it is necessary for the purposes of the legitimate interests pursued by us or by a third party, except where such interests are overridden by your interests or fundamental rights and freedoms which require protection of personal data.
{{/if}}

### Special Categories of Personal Data

For special categories of personal data (such as data revealing racial or ethnic origin, political opinions, religious beliefs, health data, or biometric data), we will generally process such data only with your explicit consent, unless the processing is necessary for one of the other legal bases specifically permitted under the NDPR.
- For the establishment, exercise, or defense of legal claims
- For reasons of substantial public interest, on the basis of Nigerian law
- For preventive or occupational medicine, medical diagnosis, or the provision of health or social care`,
        included: true,
        variables: ["legalBases"],
      },
      {
        id: "dataSharing",
        title: "Data Sharing",
        required: true,
        description: "Explain how you share personal data with third parties",
        template: `## Data Sharing

### Third-Party Disclosures

{{#if collectsPersonalData}}
We may share your personal data with the following categories of third parties:

{{{dataRecipients}}}
{{else}}
We do not share personal data with third parties beyond what is necessary for basic website functionality.
{{/if}}

### Safeguards for Third-Party Transfers

We require all third parties to respect the security of your personal data and to treat it in accordance with the law. We do not allow our third-party service providers to use your personal data for their own purposes and only permit them to process your personal data for specified purposes and in accordance with our instructions.

### International Transfers

{{#if transfersDataInternationally}}
We may transfer your personal data to countries outside Nigeria. When we do, we ensure a similar degree of protection is afforded to your personal data by ensuring at least one of the following safeguards is implemented:

- We will only transfer your personal data to countries that have been deemed to provide an adequate level of protection for personal data.
- Where we use certain service providers, we may use specific contracts approved for use in Nigeria which give personal data the same protection it has in Nigeria.
- Where we transfer data to the United States or other regions, we may use specific certification mechanisms or obtain your consent for the transfer.

Please contact us if you want further information on the specific mechanism used by us when transferring your personal data out of Nigeria.
{{/if}}`,
        included: true,
        variables: [
          "collectsPersonalData",
          "dataRecipients",
          "transfersDataInternationally",
        ],
      },
      {
        id: "dataRetention",
        title: "Data Retention",
        required: true,
        description: "Explain how long you retain personal data",
        template: `## Data Retention 
### How Long We Keep Your Personal Data

{{#if collectsPersonalData}}
We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.

Our standard retention period for personal data is: {{dataRetentionPeriod}}

To determine the appropriate retention period for personal data, we consider the amount, nature, and sensitivity of the personal data, the potential risk of harm from unauthorized use or disclosure of your personal data, the purposes for which we process your personal data and whether we can achieve those purposes through other means, and the applicable legal requirements.
{{else}}
We do not retain personal data beyond what is necessary for basic website functionality.
{{/if}}

### Data Deletion

When your personal data is no longer required for the purposes for which it was collected, we will delete or anonymize it. If this is not possible (for example, because your personal data has been stored in backup archives), then we will securely store your personal data and isolate it from any further processing until deletion is possible.

### Data Minimization

We practice data minimization, which means we only collect and process the personal data that is necessary for the purposes for which it is collected. We regularly review our data collection practices to ensure we are not collecting more data than necessary.`,
        included: true,
        variables: ["collectsPersonalData", "dataRetentionPeriod"],
      },
    ],
  };

  return (
    <div className="container mx-auto p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="generator">Generator</TabsTrigger>
          <TabsTrigger value="display">Preview</TabsTrigger>
          <TabsTrigger value="audit">Audit & Export</TabsTrigger>
        </TabsList>

        {/* Generator */}
        <TabsContent value="generator" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Policy Generator</CardTitle>
              <CardDescription>
                Configure your organization and generate an NDPR‐compliant
                policy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PolicyGenerator
                sections={policyTemplate.sections}
                variables={Object.entries(policyTemplate.variables).map(
                  ([key, value]) => ({
                    id: key,
                    name: value.name,
                    description: value.description,
                    required: value.required,
                    defaultValue: value.defaultValue,
                    value: value.defaultValue || "",
                    inputType: "text", // Default to text input type
                  }),
                )}
                onGenerate={handleGeneratePolicy}
                title="NDPR Privacy Policy Generator"
                description="Generate an NDPR-compliant privacy policy for your organization."
                buttonClassName="bg-blue-600 hover:bg-blue-700 text-white"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview */}
        <TabsContent value="display" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Policy Preview</CardTitle>
              <CardDescription>
                Review and edit your generated policy before exporting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedPolicy && generatedPolicy.length > 0 ? (
                <PolicyPreview
                  content={generateFormattedContent()}
                  sections={generatedPolicy}
                  variables={policyVariables || []}
                  onEdit={handlePolicyEdit}
                  organizationName={String(
                    policyData?.organizationName || "Your Organization",
                  )}
                  lastUpdated={new Date()}
                  showTableOfContents={true}
                  showMetadata={true}
                  title="Enterprise Privacy Policy"
                  description="NDPR-compliant privacy policy ready for implementation"
                  buttonClassName="bg-blue-600 hover:bg-blue-700 text-white"
                />
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500">
                    No policy has been generated yet. Please use the Generator
                    tab first.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          {policyData && policyData.contactEmail ? (
            <div className="mt-6 text-sm text-gray-500">
              Questions? Contact{" "}
              <a href={`mailto:${String(policyData.contactEmail)}`}>
                {String(policyData.contactEmail)}
              </a>
            </div>
          ) : null}
        </TabsContent>

        {/* Audit & Export */}
        <TabsContent value="audit" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit & Export</CardTitle>
              <CardDescription>
                Check compliance and export in multiple formats.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedPolicy && generatedPolicy.length > 0 ? (
                <PolicyExporter
                  content={generateFormattedContent()}
                  title={`${String(policyData?.organizationName || "Your Org")} Privacy Policy`}
                  organizationName={String(
                    policyData?.organizationName || "Your Org",
                  )}
                  lastUpdated={new Date()}
                  componentTitle="Export Privacy Policy"
                  description="Download in PDF, HTML, or Markdown."
                  buttonClassName="bg-blue-600 hover:bg-blue-700 text-white"
                  showExportHistory
                  includeComplianceNotice
                />
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500">
                    No policy has been generated yet. Please use the Generator
                    tab first.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Implementation Notes */}
      <div className="mt-10 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Implementation Notes</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <code>PolicyGenerator</code>: Build your policy based on the
            template.
          </li>
          <li>
            <code>PolicyPreview</code>: Live‐edit the generated sections.
          </li>
          <li>
            <code>PolicyExporter</code>: Audit compliance and export final
            documents.
          </li>
        </ul>
        <p className="mt-4">
          For full docs, visit{" "}
          <Link
            href="/docs/components/privacy-policy-generator"
            className="text-blue-600 hover:underline"
          >
            Privacy Policy Generator documentation
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
