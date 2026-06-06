'use client';

import React, { useRef } from 'react';
import CheckboxField from '../shared/CheckboxField';
import CheckboxGroup from '../shared/CheckboxGroup';
import FormField from '../shared/FormField';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { TextArea } from '@/components/ui/TextArea';
import { cn } from '@/lib/utils';

interface DataSharingStepProps {
  formData: {
    thirdPartySharing: boolean;
    thirdParties: string[];
    thirdPartyCategories: string[];
    thirdPartyPurposes: string[];
    cookiesUsed: boolean;
    cookieTypes: string[];
    cookieLifespan: string;
    trackingTechnologies: string[];
    internationalTransfers: boolean;
    transferCountries: string[];
    transferSafeguards: string[];
    processesChildrenData: boolean;
    childrenDataDetails: string;
    processesSpecialCategories: boolean;
    specialCategoriesDetails: string;
    dataBreachProcedures: string;
    regulatoryCompliance: string[];
  };
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onToggleItem: (
    category: 
      'cookieTypes' | 
      'transferCountries' | 
      'trackingTechnologies' | 
      'transferSafeguards' | 
      'thirdPartyCategories' | 
      'thirdPartyPurposes' | 
      'regulatoryCompliance', 
    item: string
  ) => void;
  onAddThirdParty: () => void;
  onRemoveThirdParty: (index: number) => void;
  defaultCookieTypes: string[];
  commonTransferCountries: string[];
  trackingTechnologies: string[];
  transferSafeguards: string[];
}

export default function DataSharingStep({
  formData,
  errors,
  onChange,
  onToggleItem,
  onAddThirdParty,
  onRemoveThirdParty,
  defaultCookieTypes,
  commonTransferCountries,
  trackingTechnologies,
  transferSafeguards,
}: DataSharingStepProps) {
  const thirdPartyInputRef = useRef<HTMLInputElement>(null);

  // Define third party categories
  const thirdPartyCategories = [
    'Cloud service providers',
    'Payment processors',
    'Analytics providers',
    'Marketing and advertising partners',
    'Customer support services',
    'Social media platforms',
    'Delivery and logistics providers',
    'IT and system maintenance providers',
    'Professional advisors (legal, accounting)',
    'Regulatory authorities',
    'Business partners',
    'Affiliates and subsidiaries'
  ];

  // Define third party purposes
  const thirdPartyPurposes = [
    'Processing payments',
    'Delivering products or services',
    'Customer support',
    'Analytics and performance monitoring',
    'Marketing and advertising',
    'Fraud prevention and security',
    'Legal and regulatory compliance',
    'Service optimization',
    'Research and development',
    'Business operations'
  ];

  // Define regulatory compliance options
  const regulatoryComplianceOptions = [
    'General Data Protection Regulation (GDPR)',
    'California Consumer Privacy Act (CCPA)',
    'Personal Information Protection and Electronic Documents Act (PIPEDA)',
    'Health Insurance Portability and Accountability Act (HIPAA)',
    'Children\'s Online Privacy Protection Act (COPPA)',
    'Payment Card Industry Data Security Standard (PCI DSS)',
    'South Africa\'s Protection of Personal Information Act (POPIA)',
    'Kenya\'s Data Protection Act',
    'Ghana\'s Data Protection Act',
    'ISO 27001 Information Security Standard'
  ];

  return (
    <div className="space-y-8">
      {/* Third-Party Sharing */}
      <Card className="overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 pb-3">
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">Third-Party Sharing</CardTitle>
          <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
            Specify if and how you share personal data with third parties
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <CheckboxField
            id="thirdPartySharing"
            name="thirdPartySharing"
            label="We don&apos;t share your data with third parties"
            checked={formData.thirdPartySharing}
            onChange={onChange}
            className="mb-4"
          />

          {formData.thirdPartySharing && (
            <div className="space-y-4">
              <FormField
                id="thirdPartyInput"
                label="Add Specific Third Parties"
                error={errors.thirdParties}
              >
                <div className="flex space-x-2 mb-2">
                  <input
                    ref={thirdPartyInputRef}
                    type="text"
                    id="thirdPartyInput"
                    placeholder="e.g., Google Analytics, Stripe"
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={onAddThirdParty}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add
                  </button>
                </div>
              </FormField>

              {formData.thirdParties.length > 0 && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Added Third Parties:</label>
                  <ul className="space-y-1">
                    {formData.thirdParties.map((party, index) => (
                      <li key={index} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-md text-sm">
                        <span>{party}</span>
                        <button
                          type="button"
                          onClick={() => onRemoveThirdParty(index)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <CheckboxGroup
                title="Categories of Third Parties"
                items={thirdPartyCategories}
                selectedItems={formData.thirdPartyCategories}
                onToggleItem={(item) => onToggleItem('thirdPartyCategories', item)}
                required
                error={errors.thirdPartyCategories}
                columns={1}
              />

              <CheckboxGroup
                title="Purposes of Sharing"
                items={thirdPartyPurposes}
                selectedItems={formData.thirdPartyPurposes}
                onToggleItem={(item) => onToggleItem('thirdPartyPurposes', item)}
                required
                error={errors.thirdPartyPurposes}
                columns={1}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cookies and Tracking */}
      <Card className="overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 pb-3">
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">Cookies and Tracking Technologies</CardTitle>
          <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
            Specify how you use cookies and other tracking technologies
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <CheckboxField
            id="cookiesUsed"
            name="cookiesUsed"
            label="We use cookies and similar tracking technologies"
            checked={formData.cookiesUsed}
            onChange={onChange}
            className="mb-4"
          />

          {formData.cookiesUsed && (
            <div className="space-y-4">
              <CheckboxGroup
                title="Types of Cookies Used"
                items={defaultCookieTypes}
                selectedItems={formData.cookieTypes}
                onToggleItem={(item) => onToggleItem('cookieTypes', item)}
                required
                error={errors.cookieTypes}
                columns={2}
              />

              <FormField
                id="cookieLifespan"
                label="Cookie Lifespan"
                required
                error={errors.cookieLifespan}
              >
                <select
                  id="cookieLifespan"
                  name="cookieLifespan"
                  value={formData.cookieLifespan}
                  onChange={onChange}
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                    errors.cookieLifespan
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                  } dark:bg-gray-700 dark:text-white`}
                >
                  <option value="">Select cookie lifespan</option>
                  <option value="Session only">Session only</option>
                  <option value="1 day">1 day</option>
                  <option value="7 days">7 days</option>
                  <option value="30 days">30 days</option>
                  <option value="90 days">90 days</option>
                  <option value="1 year">1 year</option>
                  <option value="2 years">2 years</option>
                  <option value="Varies by cookie type">Varies by cookie type</option>
                </select>
              </FormField>

              <CheckboxGroup
                title="Other Tracking Technologies Used"
                items={trackingTechnologies}
                selectedItems={formData.trackingTechnologies}
                onToggleItem={(item) => onToggleItem('trackingTechnologies', item)}
                columns={2}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* International Transfers */}
      <Card className="overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 pb-3">
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">International Data Transfers</CardTitle>
          <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
            Specify if you transfer data internationally and the safeguards in place
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <CheckboxField
            id="internationalTransfers"
            name="internationalTransfers"
            label="We transfer data internationally"
            checked={formData.internationalTransfers}
            onChange={onChange}
            className="mb-4"
          />

          {formData.internationalTransfers && (
            <div className="space-y-4">
              <CheckboxGroup
                title="Countries or Regions of Transfer"
                items={commonTransferCountries}
                selectedItems={formData.transferCountries}
                onToggleItem={(item) => onToggleItem('transferCountries', item)}
                required
                error={errors.transferCountries}
                columns={2}
              />

              <CheckboxGroup
                title="Transfer Safeguards"
                items={transferSafeguards}
                selectedItems={formData.transferSafeguards}
                onToggleItem={(item) => onToggleItem('transferSafeguards', item)}
                required
                error={errors.transferSafeguards}
                columns={1}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Special Categories */}
      <Card className="overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 pb-3">
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">Special Categories of Data</CardTitle>
          <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
            Specify if you process children&apos;s data or special categories of personal data
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="space-y-4">
            <CheckboxField
              id="processesChildrenData"
              name="processesChildrenData"
              label="We process data of children under 18"
              checked={formData.processesChildrenData}
              onChange={onChange}
              className="mb-2"
            />

            {formData.processesChildrenData && (
              <FormField
                id="childrenDataDetails"
                label="Details about children's data processing"
                required
                error={errors.childrenDataDetails}
              >
                <TextArea
                  id="childrenDataDetails"
                  name="childrenDataDetails"
                  value={formData.childrenDataDetails}
                  onChange={onChange}
                  rows={3}
                  placeholder="Explain how you collect, use, and protect children's data, including parental consent mechanisms"
                />
              </FormField>
            )}

            <CheckboxField
              id="processesSpecialCategories"
              name="processesSpecialCategories"
              label="We process special categories of data (race, ethnicity, health, biometric, etc.)"
              checked={formData.processesSpecialCategories}
              onChange={onChange}
              className="mb-2"
            />

            {formData.processesSpecialCategories && (
              <FormField
                id="specialCategoriesDetails"
                label="Details about special category data processing"
                required
                error={errors.specialCategoriesDetails}
              >
                <TextArea
                  id="specialCategoriesDetails"
                  name="specialCategoriesDetails"
                  value={formData.specialCategoriesDetails}
                  onChange={onChange}
                  rows={3}
                  placeholder="Explain what special categories of data you process, why, and the legal basis for processing"
                />
              </FormField>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Compliance */}
      <Card className="overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 pb-3">
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">Additional Compliance</CardTitle>
          <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
            Specify additional compliance measures and regulatory frameworks
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="space-y-4">
            <FormField
              id="dataBreachProcedures"
              label="Data Breach Procedures"
            >
              <TextArea
                id="dataBreachProcedures"
                name="dataBreachProcedures"
                value={formData.dataBreachProcedures}
                onChange={onChange}
                rows={3}
                placeholder="Describe your procedures for handling data breaches, including notification timelines"
              />
            </FormField>

            <CheckboxGroup
              title="Additional Regulatory Compliance"
              items={regulatoryComplianceOptions}
              selectedItems={formData.regulatoryCompliance}
              onToggleItem={(item) => onToggleItem('regulatoryCompliance', item)}
              columns={1}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
