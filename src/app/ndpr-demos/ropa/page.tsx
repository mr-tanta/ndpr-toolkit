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

type RiskLevel = 'low' | 'medium' | 'high';

interface ProcessingRecord {
  id: string;
  activityName: string;
  purpose: string;
  lawfulBasis: LawfulBasis;
  dataCategories: string[];
  dataSubjects: string[];
  recipients: string[];
  retentionPeriod: string;
  securityMeasures: string[];
  crossBorderTransfer: boolean;
  transferCountries: string[];
  dpoContact: string;
  riskLevel: RiskLevel;
  lastReviewed: number;
  createdAt: number;
  status: 'active' | 'under_review' | 'archived';
}

const LAWFUL_BASIS_LABELS: Record<LawfulBasis, string> = {
  consent: 'Consent',
  contract: 'Performance of a Contract',
  legal_obligation: 'Legal Obligation',
  vital_interests: 'Vital Interests',
  public_interest: 'Public Interest',
  legitimate_interests: 'Legitimate Interests',
};

const DATA_CATEGORY_OPTIONS = [
  'Name and Contact Details',
  'Identification Numbers',
  'Financial Data',
  'Employment Information',
  'Health Data',
  'Biometric Data',
  'Location Data',
  'Online Identifiers',
  'Communication Records',
  'Education History',
  'Criminal Records',
  'Children\'s Data',
];

const DATA_SUBJECT_OPTIONS = [
  'Customers',
  'Employees',
  'Job Applicants',
  'Contractors',
  'Suppliers',
  'Website Visitors',
  'Newsletter Subscribers',
  'Minors',
  'Patients',
  'Students',
];

const SECURITY_MEASURE_OPTIONS = [
  'Encryption at rest',
  'Encryption in transit',
  'Access control policies',
  'Multi-factor authentication',
  'Regular backups',
  'Intrusion detection systems',
  'Data loss prevention (DLP)',
  'Regular security audits',
  'Staff training on data protection',
  'Incident response procedures',
  'Pseudonymization',
  'Anonymization',
];

export default function ROPADemoPage() {
  const [activeTab, setActiveTab] = useState('summary');
  const [isClient, setIsClient] = useState(false);
  const [records, setRecords] = useState<ProcessingRecord[]>([]);

  // Form state
  const [formActivity, setFormActivity] = useState('');
  const [formPurpose, setFormPurpose] = useState('');
  const [formBasis, setFormBasis] = useState<LawfulBasis>('consent');
  const [formCategories, setFormCategories] = useState<string[]>([]);
  const [formSubjects, setFormSubjects] = useState<string[]>([]);
  const [formRecipients, setFormRecipients] = useState('');
  const [formRetention, setFormRetention] = useState('');
  const [formSecurity, setFormSecurity] = useState<string[]>([]);
  const [formCrossBorder, setFormCrossBorder] = useState(false);
  const [formCountries, setFormCountries] = useState('');
  const [formDpo, setFormDpo] = useState('');
  const [formRisk, setFormRisk] = useState<RiskLevel>('low');

  useEffect(() => {
    setIsClient(true);

    const sampleRecords: ProcessingRecord[] = [
      {
        id: 'ropa-1',
        activityName: 'Customer Relationship Management',
        purpose: 'Managing customer accounts, service delivery, and support communications',
        lawfulBasis: 'contract',
        dataCategories: ['Name and Contact Details', 'Financial Data', 'Communication Records'],
        dataSubjects: ['Customers'],
        recipients: ['Internal CRM Team', 'Cloud Service Provider (Data Processor)'],
        retentionPeriod: '5 years after last transaction',
        securityMeasures: [
          'Encryption at rest',
          'Encryption in transit',
          'Access control policies',
          'Multi-factor authentication',
          'Regular backups',
        ],
        crossBorderTransfer: true,
        transferCountries: ['United States'],
        dpoContact: 'dpo@example.com',
        riskLevel: 'medium',
        lastReviewed: Date.now() - 30 * 24 * 60 * 60 * 1000,
        createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
        status: 'active',
      },
      {
        id: 'ropa-2',
        activityName: 'Employee Payroll Processing',
        purpose: 'Monthly salary computation, tax deductions, and statutory remittances',
        lawfulBasis: 'legal_obligation',
        dataCategories: [
          'Name and Contact Details',
          'Identification Numbers',
          'Financial Data',
          'Employment Information',
        ],
        dataSubjects: ['Employees'],
        recipients: ['HR Department', 'Finance Department', 'FIRS', 'Pension Fund Administrator'],
        retentionPeriod: '7 years after employment ends',
        securityMeasures: [
          'Encryption at rest',
          'Access control policies',
          'Multi-factor authentication',
          'Regular backups',
          'Staff training on data protection',
        ],
        crossBorderTransfer: false,
        transferCountries: [],
        dpoContact: 'dpo@example.com',
        riskLevel: 'low',
        lastReviewed: Date.now() - 60 * 24 * 60 * 60 * 1000,
        createdAt: Date.now() - 730 * 24 * 60 * 60 * 1000,
        status: 'active',
      },
      {
        id: 'ropa-3',
        activityName: 'Website Analytics and Marketing',
        purpose:
          'Tracking website usage patterns and delivering targeted marketing campaigns to opted-in users',
        lawfulBasis: 'consent',
        dataCategories: ['Name and Contact Details', 'Online Identifiers', 'Location Data'],
        dataSubjects: ['Website Visitors', 'Newsletter Subscribers'],
        recipients: ['Marketing Team', 'Analytics Platform (Data Processor)'],
        retentionPeriod: '2 years or until consent is withdrawn',
        securityMeasures: [
          'Encryption in transit',
          'Pseudonymization',
          'Access control policies',
          'Data loss prevention (DLP)',
        ],
        crossBorderTransfer: true,
        transferCountries: ['United States', 'Ireland'],
        dpoContact: 'dpo@example.com',
        riskLevel: 'medium',
        lastReviewed: Date.now() - 15 * 24 * 60 * 60 * 1000,
        createdAt: Date.now() - 180 * 24 * 60 * 60 * 1000,
        status: 'active',
      },
      {
        id: 'ropa-4',
        activityName: 'Recruitment and Hiring',
        purpose: 'Processing job applications, conducting interviews, and onboarding new employees',
        lawfulBasis: 'legitimate_interests',
        dataCategories: [
          'Name and Contact Details',
          'Identification Numbers',
          'Employment Information',
          'Education History',
        ],
        dataSubjects: ['Job Applicants'],
        recipients: ['HR Department', 'Hiring Managers'],
        retentionPeriod: '6 months after position is filled (unsuccessful applicants)',
        securityMeasures: [
          'Access control policies',
          'Encryption at rest',
          'Staff training on data protection',
        ],
        crossBorderTransfer: false,
        transferCountries: [],
        dpoContact: 'dpo@example.com',
        riskLevel: 'low',
        lastReviewed: Date.now() - 90 * 24 * 60 * 60 * 1000,
        createdAt: Date.now() - 400 * 24 * 60 * 60 * 1000,
        status: 'under_review',
      },
    ];

    setRecords(sampleRecords);
  }, []);

  const handleToggleCategory = (category: string) => {
    setFormCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleToggleSubject = (subject: string) => {
    setFormSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const handleToggleSecurity = (measure: string) => {
    setFormSecurity((prev) =>
      prev.includes(measure) ? prev.filter((m) => m !== measure) : [...prev, measure]
    );
  };

  const handleAddRecord = () => {
    if (!formActivity.trim() || !formPurpose.trim()) return;

    const newRecord: ProcessingRecord = {
      id: `ropa-${Date.now()}`,
      activityName: formActivity,
      purpose: formPurpose,
      lawfulBasis: formBasis,
      dataCategories: formCategories,
      dataSubjects: formSubjects,
      recipients: formRecipients
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean),
      retentionPeriod: formRetention,
      securityMeasures: formSecurity,
      crossBorderTransfer: formCrossBorder,
      transferCountries: formCrossBorder
        ? formCountries
            .split(',')
            .map((c) => c.trim())
            .filter(Boolean)
        : [],
      dpoContact: formDpo,
      riskLevel: formRisk,
      lastReviewed: Date.now(),
      createdAt: Date.now(),
      status: 'active',
    };

    setRecords((prev) => [newRecord, ...prev]);

    // Reset form
    setFormActivity('');
    setFormPurpose('');
    setFormBasis('consent');
    setFormCategories([]);
    setFormSubjects([]);
    setFormRecipients('');
    setFormRetention('');
    setFormSecurity([]);
    setFormCrossBorder(false);
    setFormCountries('');
    setFormDpo('');
    setFormRisk('low');
    setActiveTab('register');
  };

  const handleUpdateStatus = (id: string, status: ProcessingRecord['status']) => {
    setRecords((prev) =>
      prev.map((record) => (record.id === id ? { ...record, status } : record))
    );
  };

  const getRiskBadgeVariant = (risk: RiskLevel) => {
    const variants: Record<RiskLevel, 'success' | 'warning' | 'danger'> = {
      low: 'success',
      medium: 'warning',
      high: 'danger',
    };
    return variants[risk];
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

  const getStatusBadgeVariant = (status: ProcessingRecord['status']) => {
    const variants: Record<ProcessingRecord['status'], 'success' | 'warning' | 'secondary'> = {
      active: 'success',
      under_review: 'warning',
      archived: 'secondary',
    };
    return variants[status];
  };

  // Compliance summary calculations
  const complianceSummary = {
    totalRecords: records.length,
    activeRecords: records.filter((r) => r.status === 'active').length,
    highRisk: records.filter((r) => r.riskLevel === 'high').length,
    crossBorderCount: records.filter((r) => r.crossBorderTransfer).length,
    needsReview: records.filter(
      (r) => r.lastReviewed < Date.now() - 90 * 24 * 60 * 60 * 1000
    ).length,
    basisDistribution: Object.entries(LAWFUL_BASIS_LABELS).map(([key, label]) => ({
      basis: key as LawfulBasis,
      label,
      count: records.filter((r) => r.lawfulBasis === key).length,
    })),
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

      <h1 className="text-3xl font-bold mb-4">Record of Processing Activities (ROPA)</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Maintain a comprehensive record of all personal data processing activities as required by the
        Nigeria Data Protection Act (NDPA). The ROPA serves as a central register demonstrating
        compliance with data protection obligations and supports NDPC audit readiness.
      </p>

      <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">NDPA Requirements for Record Keeping</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
          Under the Nigeria Data Protection Act (NDPA), data controllers and processors are required to
          maintain records of processing activities. These records must contain:
        </p>
        <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <li>The name and contact details of the controller and DPO</li>
          <li>The purposes of the processing</li>
          <li>A description of the categories of data subjects and personal data</li>
          <li>Categories of recipients to whom data has been or will be disclosed</li>
          <li>Transfers to third countries and the documentation of safeguards</li>
          <li>Envisaged time limits for erasure of different categories of data</li>
          <li>
            A general description of the technical and organizational security measures in place
          </li>
        </ul>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="summary">Compliance Summary</TabsTrigger>
          <TabsTrigger value="add">Add Record</TabsTrigger>
          <TabsTrigger value="register">Processing Register</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Summary</CardTitle>
              <CardDescription>
                Overview of your processing activities and compliance posture.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="p-4 border rounded-md text-center">
                  <div className="text-2xl font-bold">{complianceSummary.totalRecords}</div>
                  <div className="text-sm text-gray-500">Total Records</div>
                </div>
                <div className="p-4 border rounded-md text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {complianceSummary.activeRecords}
                  </div>
                  <div className="text-sm text-gray-500">Active</div>
                </div>
                <div className="p-4 border rounded-md text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {complianceSummary.highRisk}
                  </div>
                  <div className="text-sm text-gray-500">High Risk</div>
                </div>
                <div className="p-4 border rounded-md text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {complianceSummary.crossBorderCount}
                  </div>
                  <div className="text-sm text-gray-500">Cross-Border</div>
                </div>
                <div className="p-4 border rounded-md text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {complianceSummary.needsReview}
                  </div>
                  <div className="text-sm text-gray-500">Needs Review</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Lawful Basis Distribution</h3>
                  <div className="space-y-2">
                    {complianceSummary.basisDistribution
                      .filter((b) => b.count > 0)
                      .map((item) => (
                        <div
                          key={item.basis}
                          className="flex items-center justify-between p-3 border rounded-md"
                        >
                          <Badge variant={getBasisBadgeVariant(item.basis)}>{item.label}</Badge>
                          <span className="font-medium">{item.count}</span>
                        </div>
                      ))}
                    {complianceSummary.basisDistribution.every((b) => b.count === 0) && (
                      <p className="text-sm text-gray-500">No records yet.</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Risk Distribution</h3>
                  <div className="space-y-2">
                    {(['low', 'medium', 'high'] as RiskLevel[]).map((level) => {
                      const count = records.filter((r) => r.riskLevel === level).length;
                      return (
                        <div
                          key={level}
                          className="flex items-center justify-between p-3 border rounded-md"
                        >
                          <Badge variant={getRiskBadgeVariant(level)}>
                            {level.charAt(0).toUpperCase() + level.slice(1)} Risk
                          </Badge>
                          <span className="font-medium">{count}</span>
                        </div>
                      );
                    })}
                  </div>

                  <h3 className="text-lg font-semibold mb-3 mt-6">Records Needing Review</h3>
                  {complianceSummary.needsReview === 0 ? (
                    <p className="text-sm text-green-600 p-3 border rounded-md bg-green-50">
                      All records have been reviewed within the last 90 days.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {records
                        .filter((r) => r.lastReviewed < Date.now() - 90 * 24 * 60 * 60 * 1000)
                        .map((record) => (
                          <div key={record.id} className="p-3 border border-yellow-200 rounded-md bg-yellow-50">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{record.activityName}</span>
                              <span className="text-xs text-gray-500">
                                Last reviewed: {new Date(record.lastReviewed).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Processing Record</CardTitle>
              <CardDescription>
                Document a new data processing activity for inclusion in the ROPA.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Activity Name *</label>
                    <input
                      type="text"
                      value={formActivity}
                      onChange={(e) => setFormActivity(e.target.value)}
                      placeholder="e.g., Customer Data Processing"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">DPO Contact</label>
                    <input
                      type="email"
                      value={formDpo}
                      onChange={(e) => setFormDpo(e.target.value)}
                      placeholder="dpo@yourcompany.com"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Purpose of Processing *</label>
                  <textarea
                    value={formPurpose}
                    onChange={(e) => setFormPurpose(e.target.value)}
                    placeholder="Describe the purpose of this data processing activity"
                    rows={2}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Lawful Basis</label>
                    <select
                      value={formBasis}
                      onChange={(e) => setFormBasis(e.target.value as LawfulBasis)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {(Object.entries(LAWFUL_BASIS_LABELS) as [LawfulBasis, string][]).map(
                        ([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Risk Level</label>
                    <select
                      value={formRisk}
                      onChange={(e) => setFormRisk(e.target.value as RiskLevel)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Categories of Personal Data</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {DATA_CATEGORY_OPTIONS.map((category) => (
                      <label key={category} className="flex items-center gap-2 text-sm cursor-pointer">
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
                  <label className="block text-sm font-medium mb-1">Categories of Data Subjects</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {DATA_SUBJECT_OPTIONS.map((subject) => (
                      <label key={subject} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formSubjects.includes(subject)}
                          onChange={() => handleToggleSubject(subject)}
                          className="rounded"
                        />
                        {subject}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Recipients</label>
                  <input
                    type="text"
                    value={formRecipients}
                    onChange={(e) => setFormRecipients(e.target.value)}
                    placeholder="Comma-separated list of recipients (e.g., HR Dept, Finance Team, Cloud Provider)"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Retention Period</label>
                  <input
                    type="text"
                    value={formRetention}
                    onChange={(e) => setFormRetention(e.target.value)}
                    placeholder="e.g., 3 years after last interaction"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Technical and Organizational Security Measures
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {SECURITY_MEASURE_OPTIONS.map((measure) => (
                      <label key={measure} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formSecurity.includes(measure)}
                          onChange={() => handleToggleSecurity(measure)}
                          className="rounded"
                        />
                        {measure}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="p-4 border rounded-md">
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      checked={formCrossBorder}
                      onChange={(e) => setFormCrossBorder(e.target.checked)}
                      className="rounded"
                    />
                    This activity involves cross-border data transfers
                  </label>
                  {formCrossBorder && (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Destination Countries
                      </label>
                      <input
                        type="text"
                        value={formCountries}
                        onChange={(e) => setFormCountries(e.target.value)}
                        placeholder="Comma-separated list (e.g., United States, United Kingdom)"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleAddRecord}
                  disabled={!formActivity.trim() || !formPurpose.trim()}
                >
                  Add Processing Record
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="register" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Processing Register</CardTitle>
              <CardDescription>
                Complete record of all documented processing activities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {records.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No processing records yet. Add one from the &quot;Add Record&quot; tab.
                </div>
              ) : (
                <div className="space-y-6">
                  {records.map((record) => (
                    <div key={record.id} className="border rounded-lg p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-lg">{record.activityName}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {record.purpose}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Badge variant={getBasisBadgeVariant(record.lawfulBasis)}>
                            {LAWFUL_BASIS_LABELS[record.lawfulBasis]}
                          </Badge>
                          <Badge variant={getRiskBadgeVariant(record.riskLevel)}>
                            {record.riskLevel.charAt(0).toUpperCase() + record.riskLevel.slice(1)} Risk
                          </Badge>
                          <Badge variant={getStatusBadgeVariant(record.status)}>
                            {record.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-4">
                        <div>
                          <span className="font-medium block mb-1">Data Subjects</span>
                          <div className="flex flex-wrap gap-1">
                            {record.dataSubjects.map((subject) => (
                              <span
                                key={subject}
                                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-xs rounded-full"
                              >
                                {subject}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium block mb-1">Recipients</span>
                          <div className="flex flex-wrap gap-1">
                            {record.recipients.map((recipient) => (
                              <span
                                key={recipient}
                                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-xs rounded-full"
                              >
                                {recipient}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium block mb-1">Retention</span>
                          <span>{record.retentionPeriod || 'Not specified'}</span>
                        </div>
                      </div>

                      {record.dataCategories.length > 0 && (
                        <div className="mt-3">
                          <span className="text-sm font-medium">Data Categories:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {record.dataCategories.map((cat) => (
                              <span
                                key={cat}
                                className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {record.securityMeasures.length > 0 && (
                        <div className="mt-3">
                          <span className="text-sm font-medium">Security Measures:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {record.securityMeasures.map((measure) => (
                              <span
                                key={measure}
                                className="px-2 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full"
                              >
                                {measure}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {record.crossBorderTransfer && (
                        <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                          <span className="text-sm font-medium">Cross-Border Transfer:</span>
                          <span className="text-sm ml-1">
                            {record.transferCountries.join(', ')}
                          </span>
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex gap-4">
                          <span>Created: {new Date(record.createdAt).toLocaleDateString()}</span>
                          <span>
                            Last reviewed: {new Date(record.lastReviewed).toLocaleDateString()}
                          </span>
                        </div>
                        {record.dpoContact && <span>DPO: {record.dpoContact}</span>}
                      </div>

                      <div className="mt-3 flex gap-2">
                        {record.status !== 'under_review' && (
                          <button
                            onClick={() => handleUpdateStatus(record.id, 'under_review')}
                            className="text-xs px-3 py-1 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            Mark for Review
                          </button>
                        )}
                        {record.status !== 'active' && (
                          <button
                            onClick={() => handleUpdateStatus(record.id, 'active')}
                            className="text-xs px-3 py-1 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            Set Active
                          </button>
                        )}
                        {record.status !== 'archived' && (
                          <button
                            onClick={() => handleUpdateStatus(record.id, 'archived')}
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
        <h2 className="text-xl font-semibold mb-2">Implementation Notes</h2>
        <p className="mb-4">
          This demo showcases the Record of Processing Activities (ROPA) management capabilities for
          compliance with the Nigeria Data Protection Act (NDPA):
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Compliance Summary</strong> &mdash; Get a bird&apos;s-eye view of your processing
            activities, risk distribution, and records needing review.
          </li>
          <li>
            <strong>Processing Records</strong> &mdash; Document each processing activity with all
            NDPA-required fields including purpose, lawful basis, data categories, recipients, retention
            periods, and security measures.
          </li>
          <li>
            <strong>Cross-Border Tracking</strong> &mdash; Flag and track processing activities that
            involve international data transfers, linking to NDPA Part VI requirements.
          </li>
          <li>
            <strong>Review Management</strong> &mdash; Identify records that need periodic review to
            ensure ongoing compliance.
          </li>
        </ul>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-sm font-semibold text-blue-800 mb-1">NDPA Compliance Reference</h3>
          <p className="text-sm text-blue-700">
            The ROPA supports compliance with the <strong>NDPA&apos;s accountability principle</strong>{' '}
            (Section 24) and record-keeping obligations. Data controllers must maintain comprehensive
            records of processing activities and make them available to the{' '}
            <strong>Nigeria Data Protection Commission (NDPC)</strong> upon request. The ROPA is a
            critical document for demonstrating compliance during NDPC audits and investigations.
          </p>
        </div>
        <p className="mt-4">
          For detailed documentation, see the{' '}
          <Link href="/docs/components/ropa" className="text-blue-600 hover:underline">
            ROPA documentation
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
