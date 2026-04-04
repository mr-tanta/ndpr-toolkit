'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

type LawfulBasis =
  | 'consent'
  | 'contract'
  | 'legal_obligation'
  | 'vital_interests'
  | 'public_interest'
  | 'legitimate_interests';

interface ProcessingActivity {
  id: string;
  name: string;
  description: string;
  lawfulBasis: LawfulBasis;
  dataCategories: string[];
  dataSubjects: string;
  retentionPeriod: string;
  createdAt: number;
  status: 'active' | 'under_review' | 'archived';
  justification: string;
}

const LAWFUL_BASES: Record<LawfulBasis, { label: string; description: string }> = {
  consent: {
    label: 'Consent',
    description:
      'The data subject has given clear consent for you to process their personal data for a specific purpose.',
  },
  contract: {
    label: 'Performance of a Contract',
    description:
      'Processing is necessary for the performance of a contract to which the data subject is party, or to take steps at the request of the data subject prior to entering a contract.',
  },
  legal_obligation: {
    label: 'Legal Obligation',
    description:
      'Processing is necessary for compliance with a legal obligation to which the controller is subject.',
  },
  vital_interests: {
    label: 'Vital Interests',
    description:
      'Processing is necessary to protect the vital interests of the data subject or another natural person.',
  },
  public_interest: {
    label: 'Public Interest',
    description:
      'Processing is necessary for the performance of a task carried out in the public interest or in the exercise of official authority.',
  },
  legitimate_interests: {
    label: 'Legitimate Interests',
    description:
      'Processing is necessary for the purposes of the legitimate interests pursued by the controller or a third party, except where overridden by the interests or fundamental rights of the data subject.',
  },
};

const DATA_CATEGORY_OPTIONS = [
  'Basic Personal Information',
  'Contact Details',
  'Financial Information',
  'Health Data',
  'Location Data',
  'Biometric Data',
  'Employment Data',
  'Education Data',
  'Online Identifiers',
  'Communication Data',
];

export default function LawfulBasisDemoPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isClient, setIsClient] = useState(false);
  const [activities, setActivities] = useState<ProcessingActivity[]>([]);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formBasis, setFormBasis] = useState<LawfulBasis>('consent');
  const [formCategories, setFormCategories] = useState<string[]>([]);
  const [formSubjects, setFormSubjects] = useState('');
  const [formRetention, setFormRetention] = useState('');
  const [formJustification, setFormJustification] = useState('');

  useEffect(() => {
    setIsClient(true);

    const sampleActivities: ProcessingActivity[] = [
      {
        id: 'act-1',
        name: 'Customer Account Management',
        description: 'Processing of customer data for account creation, maintenance, and service delivery',
        lawfulBasis: 'contract',
        dataCategories: ['Basic Personal Information', 'Contact Details', 'Financial Information'],
        dataSubjects: 'Customers',
        retentionPeriod: '5 years after account closure',
        createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
        status: 'active',
        justification:
          'Processing is necessary to fulfil the service agreement entered into with customers.',
      },
      {
        id: 'act-2',
        name: 'Email Marketing Campaigns',
        description: 'Sending promotional emails and newsletters to subscribed users',
        lawfulBasis: 'consent',
        dataCategories: ['Basic Personal Information', 'Contact Details', 'Online Identifiers'],
        dataSubjects: 'Newsletter Subscribers',
        retentionPeriod: 'Until consent is withdrawn',
        createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
        status: 'active',
        justification:
          'Users have provided explicit opt-in consent to receive marketing communications.',
      },
      {
        id: 'act-3',
        name: 'Tax Reporting',
        description: 'Collection and processing of employee financial data for tax compliance',
        lawfulBasis: 'legal_obligation',
        dataCategories: ['Basic Personal Information', 'Financial Information', 'Employment Data'],
        dataSubjects: 'Employees',
        retentionPeriod: '7 years per FIRS regulations',
        createdAt: Date.now() - 120 * 24 * 60 * 60 * 1000,
        status: 'active',
        justification:
          'Processing is required to comply with Nigerian tax legislation and FIRS reporting obligations.',
      },
    ];

    setActivities(sampleActivities);
  }, []);

  const handleToggleCategory = (category: string) => {
    setFormCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleAddActivity = () => {
    if (!formName.trim() || !formDescription.trim() || !formSubjects.trim()) return;

    const newActivity: ProcessingActivity = {
      id: `act-${Date.now()}`,
      name: formName,
      description: formDescription,
      lawfulBasis: formBasis,
      dataCategories: formCategories,
      dataSubjects: formSubjects,
      retentionPeriod: formRetention,
      createdAt: Date.now(),
      status: 'active',
      justification: formJustification,
    };

    setActivities((prev) => [newActivity, ...prev]);

    // Reset form
    setFormName('');
    setFormDescription('');
    setFormBasis('consent');
    setFormCategories([]);
    setFormSubjects('');
    setFormRetention('');
    setFormJustification('');
    setActiveTab('register');
  };

  const handleUpdateStatus = (id: string, status: ProcessingActivity['status']) => {
    setActivities((prev) =>
      prev.map((activity) => (activity.id === id ? { ...activity, status } : activity))
    );
  };

  const getBasisBadgeVariant = (basis: LawfulBasis) => {
    const variants: Record<LawfulBasis, 'primary' | 'success' | 'warning' | 'info' | 'secondary' | 'danger'> = {
      consent: 'primary',
      contract: 'success',
      legal_obligation: 'warning',
      vital_interests: 'danger',
      public_interest: 'info',
      legitimate_interests: 'secondary',
    };
    return variants[basis];
  };

  const getStatusBadgeVariant = (status: ProcessingActivity['status']) => {
    const variants: Record<ProcessingActivity['status'], 'success' | 'warning' | 'secondary'> = {
      active: 'success',
      under_review: 'warning',
      archived: 'secondary',
    };
    return variants[status];
  };

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link href="/ndpr-demos" className="text-blue-600 hover:underline">
          &larr; Back to NDPA Demos
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-4">Lawful Basis Tracker</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Track and document the lawful basis for each processing activity as required by the Nigeria Data
        Protection Act (NDPA), Section 25. Every processing of personal data must be grounded in one of
        the six lawful bases defined by the Act.
      </p>

      <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">NDPA Section 25 &mdash; Lawful Bases for Processing</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
          Under the Nigeria Data Protection Act (NDPA), processing of personal data is only lawful if at
          least one of the following conditions applies:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(Object.entries(LAWFUL_BASES) as [LawfulBasis, { label: string; description: string }][]).map(
            ([key, value]) => (
              <div key={key} className="p-3 bg-white dark:bg-gray-800 rounded-md border">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={getBasisBadgeVariant(key)}>{value.label}</Badge>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{value.description}</p>
              </div>
            )
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="add">Add Activity</TabsTrigger>
          <TabsTrigger value="register">Activity Register</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Lawful Basis Overview</CardTitle>
              <CardDescription>
                Summary of processing activities grouped by their lawful basis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 border rounded-md text-center">
                  <div className="text-2xl font-bold">{activities.length}</div>
                  <div className="text-sm text-gray-500">Total Activities</div>
                </div>
                <div className="p-4 border rounded-md text-center">
                  <div className="text-2xl font-bold">
                    {activities.filter((a) => a.status === 'active').length}
                  </div>
                  <div className="text-sm text-gray-500">Active</div>
                </div>
                <div className="p-4 border rounded-md text-center">
                  <div className="text-2xl font-bold">
                    {new Set(activities.map((a) => a.lawfulBasis)).size}
                  </div>
                  <div className="text-sm text-gray-500">Bases Used</div>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-3">Distribution by Lawful Basis</h3>
              <div className="space-y-3">
                {(Object.entries(LAWFUL_BASES) as [LawfulBasis, { label: string; description: string }][]).map(
                  ([key, value]) => {
                    const count = activities.filter((a) => a.lawfulBasis === key).length;
                    return (
                      <div key={key} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center gap-2">
                          <Badge variant={getBasisBadgeVariant(key)}>{value.label}</Badge>
                        </div>
                        <span className="font-medium">
                          {count} {count === 1 ? 'activity' : 'activities'}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Processing Activity</CardTitle>
              <CardDescription>
                Document a new processing activity and select its lawful basis under NDPA Section 25.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Activity Name *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., Customer Onboarding"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description *</label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Describe the processing activity in detail"
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Lawful Basis *</label>
                  <select
                    value={formBasis}
                    onChange={(e) => setFormBasis(e.target.value as LawfulBasis)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {(Object.entries(LAWFUL_BASES) as [LawfulBasis, { label: string }][]).map(
                      ([key, value]) => (
                        <option key={key} value={key}>
                          {value.label}
                        </option>
                      )
                    )}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    {LAWFUL_BASES[formBasis].description}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Data Categories</label>
                  <div className="grid grid-cols-2 gap-2">
                    {DATA_CATEGORY_OPTIONS.map((category) => (
                      <label
                        key={category}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formCategories.includes(category)}
                          onChange={() => handleToggleCategory(category)}
                          className="rounded"
                        />
                        {category}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Data Subjects *</label>
                  <input
                    type="text"
                    value={formSubjects}
                    onChange={(e) => setFormSubjects(e.target.value)}
                    placeholder="e.g., Customers, Employees, Website Visitors"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Retention Period</label>
                  <input
                    type="text"
                    value={formRetention}
                    onChange={(e) => setFormRetention(e.target.value)}
                    placeholder="e.g., 3 years after account closure"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Justification</label>
                  <textarea
                    value={formJustification}
                    onChange={(e) => setFormJustification(e.target.value)}
                    placeholder="Explain why this lawful basis applies to this processing activity"
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <Button
                  onClick={handleAddActivity}
                  disabled={!formName.trim() || !formDescription.trim() || !formSubjects.trim()}
                >
                  Add Processing Activity
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="register" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Processing Activity Register</CardTitle>
              <CardDescription>
                All documented processing activities and their associated lawful bases.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No processing activities recorded yet. Add one from the &quot;Add Activity&quot; tab.
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-lg">{activity.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {activity.description}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={getBasisBadgeVariant(activity.lawfulBasis)}>
                            {LAWFUL_BASES[activity.lawfulBasis].label}
                          </Badge>
                          <Badge variant={getStatusBadgeVariant(activity.status)}>
                            {activity.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-sm">
                        <div>
                          <span className="font-medium">Data Subjects:</span>{' '}
                          {activity.dataSubjects}
                        </div>
                        <div>
                          <span className="font-medium">Retention:</span>{' '}
                          {activity.retentionPeriod || 'Not specified'}
                        </div>
                        <div>
                          <span className="font-medium">Recorded:</span>{' '}
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {activity.dataCategories.length > 0 && (
                        <div className="mt-3">
                          <span className="text-sm font-medium">Data Categories:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {activity.dataCategories.map((cat) => (
                              <span
                                key={cat}
                                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-xs rounded-full"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {activity.justification && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                          <span className="text-sm font-medium">Justification:</span>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {activity.justification}
                          </p>
                        </div>
                      )}

                      <div className="mt-3 flex gap-2">
                        {activity.status !== 'under_review' && (
                          <button
                            onClick={() => handleUpdateStatus(activity.id, 'under_review')}
                            className="text-xs px-3 py-1 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            Mark for Review
                          </button>
                        )}
                        {activity.status !== 'active' && (
                          <button
                            onClick={() => handleUpdateStatus(activity.id, 'active')}
                            className="text-xs px-3 py-1 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            Set Active
                          </button>
                        )}
                        {activity.status !== 'archived' && (
                          <button
                            onClick={() => handleUpdateStatus(activity.id, 'archived')}
                            className="text-xs px-3 py-1 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            Archive
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-10 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">How It Works</h2>
        <p className="mb-4">
          The Lawful Basis Tracker helps organisations document and manage the legal grounds for each
          data processing activity in compliance with the Nigeria Data Protection Act (NDPA):
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Section 25 of the NDPA</strong> requires that every processing of personal data must
            have a lawful basis. Controllers must identify and document the applicable basis before
            processing begins.
          </li>
          <li>
            <strong>Accountability Principle</strong> &mdash; The NDPA mandates that data controllers
            must be able to demonstrate compliance, including showing which lawful basis applies to each
            processing operation.
          </li>
          <li>
            <strong>Record Keeping</strong> &mdash; Maintaining a register of processing activities with
            their lawful bases supports compliance with the NDPC&apos;s audit and investigation powers.
          </li>
        </ul>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-sm font-semibold text-blue-800 mb-1">NDPA Compliance Reference</h3>
          <p className="text-sm text-blue-700">
            This component supports compliance with <strong>NDPA Section 25</strong> (lawful bases for
            processing) and <strong>Section 24</strong> (principles of data processing, including the
            accountability principle). The <strong>Nigeria Data Protection Commission (NDPC)</strong> may
            request evidence of lawful basis documentation during compliance audits.
          </p>
        </div>
        <p className="mt-4">
          For detailed documentation, see the{' '}
          <Link href="/docs/components/lawful-basis" className="text-blue-600 hover:underline">
            Lawful Basis Tracker documentation
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
