"use client";

import React, { useRef, useState } from "react";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";

interface CustomSectionsStepProps {
  formData: {
    customSections: { title: string; content: string }[];
    industryCategory: string;
    includeNDPRCompliance: boolean;
  };
  onAddCustomSection: (title: string, content: string) => void;
  onRemoveCustomSection: (index: number) => void;
}

interface TemplateSectionType {
  id: string;
  title: string;
  description: string;
  content: string;
  categories: string[];
}

export default function CustomSectionsStep({
  formData,
  onAddCustomSection,
  onRemoveCustomSection,
}: CustomSectionsStepProps) {
  const titleInputRef = useRef<HTMLInputElement>(null);
  const contentInputRef = useRef<HTMLTextAreaElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [showTemplateContent, setShowTemplateContent] =
    useState<boolean>(false);

  // Template sections that can be added to the policy
  const templateSections: TemplateSectionType[] = [
    {
      id: "gdpr-compliance",
      title: "GDPR Compliance",
      description:
        "Information about compliance with the EU General Data Protection Regulation",
      content: `In addition to complying with the Nigeria Data Protection Regulation (NDPR) and Data Protection Act (DPA), we also adhere to the European Union's General Data Protection Regulation (GDPR) for users from the European Economic Area (EEA).

When processing personal data of individuals in the EEA, we ensure that:
- We have a lawful basis for processing
- We implement appropriate technical and organizational measures
- We facilitate the exercise of data subject rights
- We have appropriate data transfer mechanisms in place
- We maintain records of processing activities

For more information about our GDPR compliance measures, please contact us at the details provided in the 'Contact Us' section.`,
      categories: ["All"],
    },
    {
      id: "california-privacy-rights",
      title: "California Privacy Rights",
      description:
        "Information about compliance with California privacy laws (CCPA/CPRA)",
      content: `If you are a California resident, you have specific rights under California privacy laws, including the California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA).

As a California resident, you have the right to:
- Know what personal information we collect about you
- Request deletion of your personal information
- Opt-out of the sale or sharing of your personal information
- Limit the use of your sensitive personal information
- Non-discrimination for exercising your rights

To exercise your California privacy rights, please contact us using the information in the 'Contact Us' section. We will respond to verifiable consumer requests within 45 days.`,
      categories: ["All"],
    },
    {
      id: "mobile-app-privacy",
      title: "Mobile Application Privacy",
      description: "Privacy information specific to mobile applications",
      content: `Our mobile application collects and processes personal data as described in this Privacy Policy. In addition to the information outlined elsewhere in this policy, our mobile application may:

- Access your device's camera, microphone, or other sensors with your permission
- Collect device identifiers such as device ID, advertising ID, or similar identifiers
- Access your location data (precise or approximate) with your permission
- Collect information about your mobile network and internet connection

You can control these permissions through your device settings. If you choose to deny certain permissions, some features of the application may not be available or may have limited functionality.`,
      categories: ["All"],
    },
    {
      id: "social-media-integration",
      title: "Social Media Integration",
      description: "Information about social media features and widgets",
      content: `Our services may include social media features, such as the Facebook Like button, and widgets, such as the Share button. These features may collect your IP address, which page you are visiting, and may set a cookie to enable the feature to function properly.

Social media features and widgets are either hosted by a third party or hosted directly on our site. Your interactions with these features are governed by the privacy policy of the company providing it.

If you choose to connect your account with us to a social media account, we may receive personal information about you from the social media provider, including your profile information, friends or connections list, and other information you have permitted the social media provider to share with third parties.`,
      categories: ["All"],
    },
    {
      id: "ecommerce-payments",
      title: "Payment Processing",
      description: "Information about payment processing and financial data",
      content: `When you make a purchase through our services, your payment information is processed by our payment service providers. We do not store complete credit card or debit card details on our servers.

Our payment processors collect and store your payment information in accordance with industry standards and applicable regulations, including the Payment Card Industry Data Security Standard (PCI DSS).

We may retain certain information about your transactions, such as the date and amount of the purchase, the items purchased, and your billing and shipping information, for record-keeping, accounting, and legal compliance purposes.`,
      categories: ["E-commerce and retail", "Financial services and fintech"],
    },
    {
      id: "healthcare-privacy",
      title: "Healthcare Information Privacy",
      description:
        "Information about healthcare data protection (relevant for healthcare organizations)",
      content: `We understand the sensitive nature of health information and are committed to protecting the privacy and security of your health data. We implement specific measures to safeguard health information in accordance with applicable healthcare privacy laws.

We only collect health information with your explicit consent or when necessary to provide our healthcare services. We limit access to health information to authorized personnel who need it to perform their duties.

We do not use or disclose your health information for marketing purposes without your explicit consent. We maintain audit trails of access to health information and regularly review our security practices to ensure the ongoing protection of your health data.`,
      categories: ["Healthcare and medical"],
    },
    {
      id: "educational-privacy",
      title: "Educational Records Privacy",
      description:
        "Information about educational data protection (relevant for educational institutions)",
      content: `We are committed to protecting the privacy of educational records and student information. We collect and process educational data only for legitimate educational purposes and in accordance with applicable education privacy laws.

We implement specific measures to safeguard educational records, including:
- Limiting access to authorized personnel with a legitimate educational interest
- Obtaining appropriate consents for certain uses of student information
- Providing access to students or parents/guardians to review and correct educational records
- Implementing security measures specific to the protection of educational data

We do not use student information for targeted advertising purposes or sell student information to third parties.`,
      categories: ["Education and e-learning"],
    },
    {
      id: "ndpr-dpa-details",
      title: "NDPR and DPA Compliance Details",
      description:
        "Detailed information about compliance with Nigerian data protection laws",
      content: `We are committed to full compliance with the Nigeria Data Protection Regulation (NDPR) of 2019 and the Data Protection Act (DPA) of 2023. Our compliance measures include:

1. **Data Protection Officer**: We have appointed a Data Protection Officer responsible for overseeing our data protection strategy and implementation.

2. **Data Protection Impact Assessments**: We conduct DPIAs for high-risk processing activities as required by Section 2.4 of the NDPR and Section 38 of the DPA.

3. **Data Protection Audit**: We conduct annual data protection audits and file audit reports with the Nigeria Data Protection Commission as required by Section 4.1 of the NDPR.

4. **Data Subject Access Request Procedure**: We have implemented a clear procedure for handling data subject access requests within the 30-day timeframe specified in Section 3.1(7) of the NDPR.

5. **Data Breach Notification**: We have established procedures to notify the Nigeria Data Protection Commission and affected data subjects of any data breaches within 72 hours, as required by Section 2.10 of the NDPR and Section 40 of the DPA.

6. **Training and Awareness**: We provide regular training to our staff on data protection principles and practices.

7. **Data Processing Agreements**: We enter into written agreements with all data processors as required by Section 2.7 of the NDPR and Section 37 of the DPA.

For more information about our NDPR and DPA compliance program, please contact our Data Protection Officer.`,
      categories: ["All"],
    },
  ];

  // Filter template sections based on industry category
  const filteredTemplateSections = templateSections.filter(
    (template) =>
      template.categories.includes("All") ||
      template.categories.includes(formData.industryCategory),
  );

  // Handle adding a template section
  const handleAddTemplateSection = () => {
    if (selectedTemplate) {
      const template = templateSections.find((t) => t.id === selectedTemplate);
      if (template) {
        onAddCustomSection(template.title, template.content);
        setSelectedTemplate("");
        setShowTemplateContent(false);
      }
    }
  };

  // Handle adding a custom section
  const handleAddCustomSection = () => {
    if (
      titleInputRef.current &&
      contentInputRef.current &&
      titleInputRef.current.value.trim() &&
      contentInputRef.current.value.trim()
    ) {
      onAddCustomSection(
        titleInputRef.current.value.trim(),
        contentInputRef.current.value.trim(),
      );
      titleInputRef.current.value = "";
      contentInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 pb-3">
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">
            Template Sections
          </CardTitle>
          <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
            Add pre-written sections to your privacy policy
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="space-y-3">
            <FormField id="templateSection" label="Select a Template Section">
              <Select
                id="templateSection"
                value={selectedTemplate}
                onChange={(e) => {
                  setSelectedTemplate(e.target.value);
                  setShowTemplateContent(!!e.target.value);
                }}
              >
                <option value="">-- Select a template section --</option>
                {filteredTemplateSections.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.title} - {template.description}
                  </option>
                ))}
              </Select>
            </FormField>

            {showTemplateContent && selectedTemplate && (
              <div className="mt-3 bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                  {
                    templateSections.find((t) => t.id === selectedTemplate)
                      ?.title
                  }
                </h5>
                <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line max-h-40 overflow-y-auto">
                  {
                    templateSections.find((t) => t.id === selectedTemplate)
                      ?.content
                  }
                </div>
              </div>
            )}

            <Button
              variant="default"
              size="sm"
              disabled={!selectedTemplate}
              onClick={handleAddTemplateSection}
            >
              Add Template Section
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Custom Sections */}
      <Card className="overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 pb-3">
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">
            Create Custom Section
          </CardTitle>
          <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
            Add your own custom section to the privacy policy
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="space-y-3">
            <FormField id="customSectionTitle" label="Section Title">
              <Input
                id="customSectionTitle"
                ref={titleInputRef}
                placeholder="e.g., Cookies Policy, International Transfers"
              />
            </FormField>

            <FormField id="customSectionContent" label="Section Content">
              <TextArea
                id="customSectionContent"
                ref={contentInputRef}
                rows={5}
                placeholder="Enter the content for this section..."
              />
            </FormField>

            <Button
              variant="default"
              size="sm"
              onClick={handleAddCustomSection}
            >
              Add Custom Section
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Added Sections List */}
      {formData.customSections.length > 0 && (
        <Card className="overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
          <CardHeader className="bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 pb-3">
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">
              Added Custom Sections
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
              Custom sections that will be included in your privacy policy
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <ul className="space-y-3">
              {formData.customSections.map((section, index) => (
                <Card key={index} className="overflow-visible">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        {section.title}
                      </h5>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onRemoveCustomSection(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line max-h-32 overflow-y-auto">
                      {section.content.length > 200
                        ? `${section.content.substring(0, 200)}...`
                        : section.content}
                    </div>
                    {section.content.length > 200 && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => alert(section.content)}
                        className="mt-2 p-0"
                      >
                        View Full Content
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
