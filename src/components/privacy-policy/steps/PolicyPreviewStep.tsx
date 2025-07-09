"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/Card";

interface PolicyPreviewStepProps {
  formData: {
    organizationName: string;
    organizationContact: string;
    organizationWebsite: string;
    organizationAddress: string;
    dataCollectionPurposes: string[];
    dataRetentionPeriod: string;
    thirdPartySharing: boolean;
    thirdParties: string[];
    securityMeasures: string[];
    cookiesUsed: boolean;
    cookieTypes: string[];
    internationalTransfers: boolean;
    transferCountries: string[];
    customSections: { title: string; template: string }[];
    hasDPO: boolean;
    dpoContact: string;
    includeNDPRCompliance: boolean;
    policyEffectiveDate: string;
  };
  previewRef: React.RefObject<HTMLDivElement | null>;
}

export default function PolicyPreviewStep({
  formData,
  previewRef,
}: PolicyPreviewStepProps) {
  return (
    <div className="space-y-8">
      <Card className="transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-indigo-500"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
              Privacy Policy Preview
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
              Preview Mode
            </span>
          </div>

          <div
            ref={previewRef}
            className="prose dark:prose-invert prose-indigo max-w-none text-base prose-headings:text-gray-800 dark:prose-headings:text-gray-100 prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-li:text-gray-600 dark:prose-li:text-gray-300 prose-h1:text-2xl prose-h1:font-bold prose-h2:text-xl prose-h2:font-semibold prose-h2:border-b prose-h2:border-gray-200 dark:prose-h2:border-gray-700 prose-h2:pb-2 prose-h2:mt-8 overflow-auto"
          >
            <h1>{formData.organizationName} Privacy Policy</h1>

            <h2>Introduction</h2>
            <p>
              This Privacy Policy describes how {formData.organizationName}{" "}
              collects, uses, and discloses your personal information.
              {formData.includeNDPRCompliance &&
                " This policy is compliant with the Nigeria Data Protection Regulation (NDPR) and the Data Protection Act (DPA)."}
            </p>

            <h2>About Us</h2>
            <p>
              {formData.organizationName}
              {formData.organizationAddress &&
                ` is located at ${formData.organizationAddress}`}
              .
              {formData.organizationWebsite &&
                ` Our website is ${formData.organizationWebsite}.`}
            </p>

            <h2>Information We Collect</h2>
            <p>
              We collect and process your personal data for the following
              purposes:
            </p>
            <ul>
              {(formData.dataCollectionPurposes || []).map((purpose, index) => (
                <li key={`purpose-${index}`}>{purpose}</li>
              ))}
            </ul>

            <h2>Data Retention</h2>
            <p>
              We will retain your personal data for{" "}
              {formData.dataRetentionPeriod ||
                "a period appropriate to the purpose"}
              , or for as long as necessary to fulfill the purposes for which it
              was collected.
            </p>

            {formData.thirdPartySharing &&
              (formData.thirdParties || []).length > 0 && (
                <>
                  <h2>Third-Party Sharing</h2>
                  <p>
                    We may share your personal information with the following
                    third parties:
                  </p>
                  <ul>
                    {(formData.thirdParties || []).map((party, index) => (
                      <li key={`party-${index}`}>{party}</li>
                    ))}
                  </ul>
                </>
              )}

            {formData.cookiesUsed &&
              (formData.cookieTypes || []).length > 0 && (
                <>
                  <h2>Cookies and Tracking Technologies</h2>
                  <p>
                    Our website uses cookies and similar tracking technologies.
                    We use the following types of cookies:
                  </p>
                  <ul>
                    {(formData.cookieTypes || []).map((type, index) => (
                      <li key={`type-${index}`}>{type}</li>
                    ))}
                  </ul>
                </>
              )}

            {formData.internationalTransfers &&
              (formData.transferCountries || []).length > 0 && (
                <>
                  <h2>International Data Transfers</h2>
                  <p>
                    We may transfer your personal data to the following
                    countries outside Nigeria:
                  </p>
                  <ul>
                    {(formData.transferCountries || []).map(
                      (country, index) => (
                        <li key={`country-${index}`}>{country}</li>
                      ),
                    )}
                  </ul>
                  <p>
                    We ensure appropriate safeguards are in place to protect
                    your data when transferred internationally.
                  </p>
                </>
              )}

            {(formData.securityMeasures || []).length > 0 && (
              <>
                <h2>Security Measures</h2>
                <p>
                  We implement the following security measures to protect your
                  personal data:
                </p>
                <ul>
                  {(formData.securityMeasures || []).map((measure, index) => (
                    <li key={`measure-${index}`}>{measure}</li>
                  ))}
                </ul>
              </>
            )}

            <h2>Your Rights</h2>
            <p>
              {formData.includeNDPRCompliance
                ? "Under the NDPR and DPA, you have the following rights:"
                : "You have the following rights regarding your personal data:"}
            </p>
            <ul>
              <li>Right to access your personal data</li>
              <li>Right to rectify inaccurate personal data</li>
              <li>Right to erasure (&quot;right to be forgotten&quot;)</li>
              <li>Right to restrict processing</li>
              <li>Right to object to processing</li>
              <li>Right to data portability</li>
            </ul>
            <p>
              To exercise these rights, please contact us at{" "}
              {formData.organizationContact}.
            </p>

            {(formData.customSections || []).length > 0 &&
              (formData.customSections || []).map((section, index) => (
                <div key={`section-${index}`}>
                  <h2>{section.title}</h2>
                  <p>{section.template}</p>
                </div>
              ))}

            {formData.hasDPO && formData.dpoContact && (
              <>
                <h2>Data Protection Officer</h2>
                <p>
                  You can contact our Data Protection Officer at{" "}
                  {formData.dpoContact}.
                </p>
              </>
            )}

            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us at {formData.organizationContact}.
            </p>

            <p className="text-gray-500 dark:text-gray-400 mt-4">
              Last Updated:{" "}
              {formData.policyEffectiveDate ||
                new Date().toISOString().split("T")[0]}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
