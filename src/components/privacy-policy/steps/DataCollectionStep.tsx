'use client';

import React from 'react';
import CheckboxGroup from '../shared/CheckboxGroup';
import FormField from '../shared/FormField';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/utils';

interface DataCollectionStepProps {
  formData: {
    dataCollectionPurposes: string[];
    dataRetentionPeriod: string;
    securityMeasures: string[];
    dataSubjects: string[];
    dataCategories: string[];
    legalBasisForProcessing: string[];
  };
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onToggleItem: (
    category: 
      'dataCollectionPurposes' | 
      'securityMeasures' | 
      'dataSubjects' | 
      'dataCategories' | 
      'legalBasisForProcessing', 
    item: string
  ) => void;
  defaultDataPurposes: string[];
  defaultSecurityMeasures: string[];
  dataSubjectCategories: string[];
}

export default function DataCollectionStep({
  formData,
  errors,
  onChange,
  onToggleItem,
  defaultDataPurposes,
  defaultSecurityMeasures,
  dataSubjectCategories,
}: DataCollectionStepProps) {
  // Define legal basis options
  const legalBasisOptions = [
    'Consent of the data subject',
    'Performance of a contract',
    'Compliance with a legal obligation',
    'Protection of vital interests',
    'Performance of a task in the public interest',
    'Legitimate interests pursued by the controller',
    'Explicit consent for special categories',
    'Employment and social security purposes',
    'Vital interests where consent cannot be given',
    'Processing by non-profit bodies',
    'Data made public by the data subject',
    'Legal claims or judicial acts',
    'Substantial public interest',
    'Preventive or occupational medicine',
    'Public health',
    'Archiving, research and statistics'
  ];

  // Define data categories
  const dataCategories = [
    'Personal identifiers (name, email, phone)',
    'Contact information',
    'Location data',
    'Financial information',
    'Transaction data',
    'Technical data (IP address, device info)',
    'Profile data',
    'Usage data',
    'Marketing preferences',
    'Communications data',
    'Employment information',
    'Education information',
    'Biometric data',
    'Health data',
    'Government identifiers'
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <Card className="overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
            <CardHeader className="bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 pb-3">
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">Data Collection Purposes</CardTitle>
              <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                Select all the purposes for which you collect personal data
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <CheckboxGroup
                title=""
                items={defaultDataPurposes}
                selectedItems={formData.dataCollectionPurposes}
                onToggleItem={(item) => onToggleItem('dataCollectionPurposes', item)}
                required
                error={errors.dataCollectionPurposes}
                columns={1}
                className="space-y-1"
              />
            </CardContent>
          </Card>

          <Card className="overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
            <CardHeader className="bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 pb-3">
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">Data Retention</CardTitle>
              <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                Specify how long you retain personal data
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <FormField
                id="dataRetentionPeriod"
                label="Data Retention Period"
                required
                error={errors.dataRetentionPeriod}
              >
                <Select
                  id="dataRetentionPeriod"
                  name="dataRetentionPeriod"
                  value={formData.dataRetentionPeriod}
                  onChange={onChange}
                >
                  <option value="">Select a retention period</option>
                  <option value="1 year">1 year</option>
                  <option value="2 years">2 years</option>
                  <option value="3 years">3 years</option>
                  <option value="5 years">5 years</option>
                  <option value="7 years">7 years</option>
                  <option value="10 years">10 years</option>
                  <option value="as long as necessary for the purposes described">As long as necessary</option>
                </Select>
              </FormField>
            </CardContent>
          </Card>

          <Card className="overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
            <CardHeader className="bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 pb-3">
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">Data Subjects</CardTitle>
              <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                Select the categories of individuals whose data you process
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <CheckboxGroup
                title=""
                items={dataSubjectCategories}
                selectedItems={formData.dataSubjects}
                onToggleItem={(item) => onToggleItem('dataSubjects', item)}
                required
                error={errors.dataSubjects}
                columns={1}
                className="space-y-1"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card className="overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
            <CardHeader className="bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 pb-3">
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">Personal Data Categories</CardTitle>
              <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                Select the types of personal data you collect
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <CheckboxGroup
                title=""
                items={dataCategories}
                selectedItems={formData.dataCategories}
                onToggleItem={(item) => onToggleItem('dataCategories', item)}
                required
                error={errors.dataCategories}
                columns={1}
                className="space-y-1"
              />
            </CardContent>
          </Card>

          <Card className="overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
            <CardHeader className="bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 pb-3">
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">Legal Basis</CardTitle>
              <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                Select the legal grounds for processing personal data
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <CheckboxGroup
                title=""
                items={legalBasisOptions}
                selectedItems={formData.legalBasisForProcessing}
                onToggleItem={(item) => onToggleItem('legalBasisForProcessing', item)}
                required
                error={errors.legalBasisForProcessing}
                columns={1}
                className="space-y-1"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 pb-3">
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">Security Measures</CardTitle>
          <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
            Select the security measures you implement to protect personal data
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <CheckboxGroup
            title=""
            items={defaultSecurityMeasures}
            selectedItems={formData.securityMeasures}
            onToggleItem={(item) => onToggleItem('securityMeasures', item)}
            columns={2}
            className="space-y-1"
          />
        </CardContent>
      </Card>
    </div>
  );
}
