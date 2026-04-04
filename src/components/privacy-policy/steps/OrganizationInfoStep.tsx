'use client';

import React from 'react';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { cn } from '@/lib/utils';

interface OrganizationInfoStepProps {
  formData: {
    organizationName: string;
    organizationContact: string;
    organizationWebsite: string;
    organizationAddress: string;
    hasDPO: boolean;
    dpoContact: string;
    includeNDPRCompliance: boolean;
  };
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export default function OrganizationInfoStep({
  formData,
  errors,
  onChange,
}: OrganizationInfoStepProps) {
  return (
    <div className="space-y-8">
      <Card className="overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 pb-3">
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">Organization Details</CardTitle>
          <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
            Provide information about your organization for the privacy policy
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormField
            id="organizationName"
            label="Organization Name"
            required
            error={errors.organizationName}
            className="md:col-span-2"
          >
            <Input
              type="text"
              id="organizationName"
              name="organizationName"
              value={formData.organizationName}
              onChange={onChange}
              placeholder="e.g., Acme Corporation"
              aria-required="true"
              className={errors.organizationName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            />
          </FormField>

          <FormField
            id="organizationContact"
            label="Contact Information"
            required
            error={errors.organizationContact}
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <Input
                type="text"
                id="organizationContact"
                name="organizationContact"
                value={formData.organizationContact}
                onChange={onChange}
                placeholder="email@example.com or phone"
                aria-required="true"
                className={`pl-10 ${errors.organizationContact ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
            </div>
          </FormField>

          <FormField
            id="organizationWebsite"
            label="Website (Optional)"
            error={errors.organizationWebsite}
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                </svg>
              </div>
              <Input
                type="text"
                id="organizationWebsite"
                name="organizationWebsite"
                value={formData.organizationWebsite}
                onChange={onChange}
                placeholder="e.g., https://www.example.com"
                className="pl-10"
              />
            </div>
          </FormField>
        </div>

        <FormField
          id="organizationAddress"
          label="Address (Optional)"
          error={errors.organizationAddress}
          className="mt-4"
        >
          <TextArea
            id="organizationAddress"
            name="organizationAddress"
            value={formData.organizationAddress}
            onChange={onChange}
            rows={2}
            placeholder="e.g., 123 Main Street, Lagos, Nigeria"
          />
        </FormField>
        </CardContent>
      </Card>

      <Card className="overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 pb-3">
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">Compliance Settings</CardTitle>
          <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
            Configure data protection compliance options
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">

        <Checkbox
          id="hasDPO"
          name="hasDPO"
          label="We have a Data Protection Officer (DPO)"
          checked={formData.hasDPO}
          onChange={onChange}
        />

        {formData.hasDPO && (
          <div className="ml-8 mt-2 mb-4">
            <FormField
              id="dpoContact"
              label="DPO Contact Information"
              required
              error={errors.dpoContact}
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <Input
                  type="text"
                  id="dpoContact"
                  name="dpoContact"
                  value={formData.dpoContact}
                  onChange={onChange}
                  placeholder="dpo@example.com or phone number"
                  aria-required="true"
                  className={`pl-10 ${errors.dpoContact ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
              </div>
            </FormField>
          </div>
        )}

        <Checkbox
          id="includeNDPRCompliance"
          name="includeNDPRCompliance"
          label="Include NDPA compliance statements"
          checked={formData.includeNDPRCompliance}
          onChange={onChange}
        />

        <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1 md:flex md:justify-between">
              <p className="text-sm text-indigo-700 dark:text-indigo-300">
                Including compliance statements helps demonstrate your commitment to data protection regulations.
              </p>
            </div>
          </div>
        </div>
        </CardContent>
      </Card>
    </div>
  );
}
