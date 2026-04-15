'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { DemoLayout } from '@/components/site/DemoLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
// Local types matching what the demo actually uses
type LawfulBasis = 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_interest' | 'legitimate_interests';
type RiskLevel = 'low' | 'medium' | 'high';

interface ProcessingRecord {
  id: string;
  activityName: string;
  purpose: string;
  lawfulBasis: LawfulBasis;
  department: string;
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
  contract: 'Contract',
  legal_obligation: 'Legal Obligation',
  vital_interests: 'Vital Interests',
  public_interest: 'Public Interest',
  legitimate_interests: 'Legitimate Interests',
};

const LAWFUL_BASIS_COLORS: Record<LawfulBasis, { bg: string; text: string; dot: string }> = {
  consent: { bg: 'bg-gray-50 dark:bg-gray-900/50', text: 'text-gray-700 dark:text-gray-300', dot: 'bg-blue-500' },
  contract: { bg: 'bg-gray-50 dark:bg-gray-900/50', text: 'text-gray-700 dark:text-gray-300', dot: 'bg-blue-500' },
  legal_obligation: { bg: 'bg-gray-50 dark:bg-gray-900/50', text: 'text-gray-700 dark:text-gray-300', dot: 'bg-blue-500' },
  vital_interests: { bg: 'bg-gray-50 dark:bg-gray-900/50', text: 'text-gray-700 dark:text-gray-300', dot: 'bg-blue-500' },
  public_interest: { bg: 'bg-gray-50 dark:bg-gray-900/50', text: 'text-gray-700 dark:text-gray-300', dot: 'bg-blue-500' },
  legitimate_interests: { bg: 'bg-gray-50 dark:bg-gray-900/50', text: 'text-gray-700 dark:text-gray-300', dot: 'bg-blue-500' },
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

const DEPARTMENTS = ['Engineering', 'Marketing', 'Human Resources', 'Finance', 'Operations', 'Legal', 'Sales', 'Customer Success'];

const SAMPLE_RECORDS: ProcessingRecord[] = [
  {
    id: 'ropa-1',
    activityName: 'Customer Relationship Management',
    purpose: 'Managing customer accounts, service delivery, and support communications',
    lawfulBasis: 'contract',
    department: 'Customer Success',
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
    department: 'Finance',
    dataCategories: ['Name and Contact Details', 'Identification Numbers', 'Financial Data', 'Employment Information'],
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
    purpose: 'Tracking website usage patterns and delivering targeted marketing campaigns to opted-in users',
    lawfulBasis: 'consent',
    department: 'Marketing',
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
    department: 'Human Resources',
    dataCategories: ['Name and Contact Details', 'Identification Numbers', 'Employment Information', 'Education History'],
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
    lastReviewed: Date.now() - 100 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 400 * 24 * 60 * 60 * 1000,
    status: 'under_review',
  },
  {
    id: 'ropa-5',
    activityName: 'Fraud Detection and Prevention',
    purpose: 'Real-time monitoring of transactions to detect and prevent fraudulent activities',
    lawfulBasis: 'legitimate_interests',
    department: 'Engineering',
    dataCategories: ['Financial Data', 'Online Identifiers', 'Location Data'],
    dataSubjects: ['Customers'],
    recipients: ['Security Team', 'Fraud Analytics Platform'],
    retentionPeriod: '3 years after last transaction',
    securityMeasures: [
      'Encryption at rest',
      'Encryption in transit',
      'Access control policies',
      'Intrusion detection systems',
      'Regular security audits',
    ],
    crossBorderTransfer: false,
    transferCountries: [],
    dpoContact: 'dpo@example.com',
    riskLevel: 'high',
    lastReviewed: Date.now() - 10 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 200 * 24 * 60 * 60 * 1000,
    status: 'active',
  },
];

export default function ROPADemoPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isClient, setIsClient] = useState(false);
  const [records, setRecords] = useState<ProcessingRecord[]>([]);
  const [sortField, setSortField] = useState<'activityName' | 'department' | 'riskLevel' | 'createdAt'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<RiskLevel | 'all'>('all');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    data: true,
    security: false,
    crossBorder: false,
  });

  // Form state
  const [formActivity, setFormActivity] = useState('');
  const [formPurpose, setFormPurpose] = useState('');
  const [formBasis, setFormBasis] = useState<LawfulBasis>('consent');
  const [formDepartment, setFormDepartment] = useState('');
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
    setRecords(SAMPLE_RECORDS);
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

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
      department: formDepartment,
      dataCategories: formCategories,
      dataSubjects: formSubjects,
      recipients: formRecipients.split(',').map((r) => r.trim()).filter(Boolean),
      retentionPeriod: formRetention,
      securityMeasures: formSecurity,
      crossBorderTransfer: formCrossBorder,
      transferCountries: formCrossBorder ? formCountries.split(',').map((c) => c.trim()).filter(Boolean) : [],
      dpoContact: formDpo,
      riskLevel: formRisk,
      lastReviewed: Date.now(),
      createdAt: Date.now(),
      status: 'active',
    };

    setRecords((prev) => [newRecord, ...prev]);
    setFormActivity('');
    setFormPurpose('');
    setFormBasis('consent');
    setFormDepartment('');
    setFormCategories([]);
    setFormSubjects([]);
    setFormRecipients('');
    setFormRetention('');
    setFormSecurity([]);
    setFormCrossBorder(false);
    setFormCountries('');
    setFormDpo('');
    setFormRisk('low');
    setActiveTab('records');
  };

  const handleUpdateStatus = (id: string, status: ProcessingRecord['status']) => {
    setRecords((prev) =>
      prev.map((record) => (record.id === id ? { ...record, status } : record))
    );
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const getRiskConfig = (risk: RiskLevel) => {
    const configs: Record<RiskLevel, { variant: 'success' | 'warning' | 'danger'; color: string; bg: string }> = {
      low: { variant: 'success', color: 'text-green-600', bg: 'bg-green-500' },
      medium: { variant: 'warning', color: 'text-amber-600', bg: 'bg-amber-500' },
      high: { variant: 'danger', color: 'text-red-600', bg: 'bg-red-500' },
    };
    return configs[risk];
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

  const getStatusConfig = (status: ProcessingRecord['status']) => {
    const configs: Record<ProcessingRecord['status'], { variant: 'success' | 'warning' | 'secondary'; label: string }> = {
      active: { variant: 'success', label: 'Active' },
      under_review: { variant: 'warning', label: 'Under Review' },
      archived: { variant: 'secondary', label: 'Archived' },
    };
    return configs[status];
  };

  // Statistics
  const stats = useMemo(() => {
    const deptCounts: Record<string, number> = {};
    const basisCounts: Record<string, number> = {};
    records.forEach((r) => {
      deptCounts[r.department] = (deptCounts[r.department] || 0) + 1;
      basisCounts[r.lawfulBasis] = (basisCounts[r.lawfulBasis] || 0) + 1;
    });

    const gaps: string[] = [];
    records.forEach((r) => {
      if (!r.retentionPeriod) gaps.push(`${r.activityName}: Missing retention period`);
      if (r.securityMeasures.length < 3) gaps.push(`${r.activityName}: Insufficient security measures (${r.securityMeasures.length})`);
      if (r.lastReviewed < Date.now() - 90 * 24 * 60 * 60 * 1000) gaps.push(`${r.activityName}: Overdue for review`);
    });

    return {
      total: records.length,
      active: records.filter((r) => r.status === 'active').length,
      highRisk: records.filter((r) => r.riskLevel === 'high').length,
      crossBorder: records.filter((r) => r.crossBorderTransfer).length,
      needsReview: records.filter((r) => r.lastReviewed < Date.now() - 90 * 24 * 60 * 60 * 1000).length,
      deptCounts,
      basisCounts,
      gaps,
    };
  }, [records]);

  // Filtered and sorted records
  const displayedRecords = useMemo(() => {
    let filtered = [...records];
    if (filterDept !== 'all') filtered = filtered.filter((r) => r.department === filterDept);
    if (filterRisk !== 'all') filtered = filtered.filter((r) => r.riskLevel === filterRisk);

    filtered.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'activityName') return a.activityName.localeCompare(b.activityName) * dir;
      if (sortField === 'department') return a.department.localeCompare(b.department) * dir;
      if (sortField === 'riskLevel') {
        const order: Record<RiskLevel, number> = { low: 0, medium: 1, high: 2 };
        return (order[a.riskLevel] - order[b.riskLevel]) * dir;
      }
      return (a.createdAt - b.createdAt) * dir;
    });

    return filtered;
  }, [records, filterDept, filterRisk, sortField, sortDir]);

  // CSV preview
  const csvPreview = useMemo(() => {
    const headers = ['Activity Name', 'Purpose', 'Lawful Basis', 'Department', 'Data Categories', 'Data Subjects', 'Recipients', 'Retention Period', 'Risk Level', 'Status', 'Cross-Border', 'DPO Contact'];
    const rows = records.slice(0, 4).map((r) => [
      r.activityName,
      r.purpose.slice(0, 60) + (r.purpose.length > 60 ? '...' : ''),
      LAWFUL_BASIS_LABELS[r.lawfulBasis],
      r.department,
      r.dataCategories.join('; '),
      r.dataSubjects.join('; '),
      r.recipients.join('; '),
      r.retentionPeriod,
      r.riskLevel,
      r.status,
      r.crossBorderTransfer ? r.transferCountries.join('; ') : 'No',
      r.dpoContact,
    ]);
    return { headers, rows };
  }, [records]);

  if (!isClient) {
    return (
      <DemoLayout
        title="Record of Processing Activities"
        description="Maintain a comprehensive ROPA to demonstrate compliance with the Nigeria Data Protection Act. The central register for all personal data processing activities."
        ndpaSection="Section 28(2)"
        code={`import { ROPAManager } from '@tantainnovative/ndpr-toolkit/ropa';`}
      >
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      </DemoLayout>
    );
  }

  return (
    <DemoLayout
      title="Record of Processing Activities"
      description="Maintain a comprehensive ROPA to demonstrate compliance with the Nigeria Data Protection Act. The central register for all personal data processing activities."
      ndpaSection="Section 28(2)"
      code={`import { ROPAManager } from '@tantainnovative/ndpr-toolkit/ropa';`}
    >
      <div
        style={{
          '--ndpr-primary': '99 102 241',
          '--ndpr-primary-hover': '129 140 248',
          '--ndpr-primary-foreground': '255 255 255',
          '--ndpr-background': '17 24 39',
          '--ndpr-foreground': '241 245 249',
          '--ndpr-muted': '26 34 53',
          '--ndpr-muted-foreground': '148 163 184',
          '--ndpr-border': '30 41 59',
        } as React.CSSProperties}
      >
        {/* Stats Summary */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 text-sm">
            <span className="text-2xl font-bold">{stats.total}</span>
            <span className="text-gray-500 dark:text-gray-400">Records</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 text-sm">
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</span>
            <span className="text-gray-500 dark:text-gray-400">Active</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 text-sm">
            <span className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.highRisk}</span>
            <span className="text-gray-500 dark:text-gray-400">High Risk</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 text-sm">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.needsReview}</span>
            <span className="text-gray-500 dark:text-gray-400">Needs Review</span>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="add">Add Record</TabsTrigger>
            <TabsTrigger value="records">Records Table</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              {[
                { label: 'Total Records', value: stats.total, icon: '\u2630', color: 'text-gray-900 dark:text-gray-100', bg: '' },
                { label: 'Active', value: stats.active, icon: '\u2713', color: 'text-green-600', bg: '' },
                { label: 'High Risk', value: stats.highRisk, icon: '\u26A0', color: 'text-red-600', bg: '' },
                { label: 'Cross-Border', value: stats.crossBorder, icon: '\uD83C\uDF10', color: 'text-blue-600', bg: '' },
                { label: 'Needs Review', value: stats.needsReview, icon: '\u23F0', color: 'text-amber-600', bg: '' },
              ].map((stat) => (
                <Card key={stat.label} className={stat.bg}>
                  <CardContent className="pt-5 pb-4 text-center">
                    <div className="text-lg mb-1">{stat.icon}</div>
                    <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* By Lawful Basis */}
              <Card>
                <CardHeader>
                  <CardTitle>By Lawful Basis</CardTitle>
                  <CardDescription>Distribution of records across the six NDPA lawful bases</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(Object.entries(LAWFUL_BASIS_LABELS) as [LawfulBasis, string][]).map(([key, label]) => {
                      const count = stats.basisCounts[key] || 0;
                      const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                      const colors = LAWFUL_BASIS_COLORS[key];
                      return (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`}></span>
                              <span className="text-sm font-medium">{label}</span>
                            </div>
                            <span className="text-sm font-semibold tabular-nums">{count}</span>
                          </div>
                          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-700 ${colors.dot}`} style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* By Department */}
              <Card>
                <CardHeader>
                  <CardTitle>By Department</CardTitle>
                  <CardDescription>Which departments are processing personal data</CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.keys(stats.deptCounts).length === 0 ? (
                    <p className="text-sm text-gray-500 py-4">No data yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(stats.deptCounts)
                        .sort((a, b) => b[1] - a[1])
                        .map(([dept, count]) => {
                          const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                          return (
                            <div key={dept}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">{dept || 'Unassigned'}</span>
                                <span className="text-sm font-semibold tabular-nums">{count}</span>
                              </div>
                              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-700 bg-blue-500" style={{ width: `${percentage}%` }} />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Risk Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Risk Distribution</CardTitle>
                  <CardDescription>Risk levels across all processing activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-6">
                    {(['low', 'medium', 'high'] as RiskLevel[]).map((level) => {
                      const count = records.filter((r) => r.riskLevel === level).length;
                      const config = getRiskConfig(level);
                      const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                      return (
                        <div key={level} className="flex-1 text-center">
                          <div className="relative w-20 h-20 mx-auto mb-2">
                            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                              <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="none" className="text-gray-200 dark:text-gray-700" />
                              <circle
                                cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="none"
                                strokeDasharray={`${(percentage / 100) * 201} 201`}
                                strokeLinecap="round"
                                className={config.color}
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className={`text-lg font-bold ${config.color}`}>{count}</span>
                            </div>
                          </div>
                          <span className="text-xs font-medium capitalize">{level} Risk</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Compliance Gaps */}
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Gaps</CardTitle>
                  <CardDescription>Issues requiring attention for NDPC audit readiness</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.gaps.length === 0 ? (
                    <div className="py-6 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm text-green-600 font-medium">No compliance gaps detected</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {stats.gaps.map((gap, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                          <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                          </svg>
                          <span className="text-xs text-amber-800 dark:text-amber-300">{gap}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Add Record Tab */}
          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle>Add Processing Record</CardTitle>
                <CardDescription>
                  Document a new data processing activity for inclusion in the ROPA. Expand sections to fill in all details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Section: Basic Info */}
                  <div className="border rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection('basic')}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-blue-600">1</span>
                        <span className="font-medium text-sm">Basic Information</span>
                      </div>
                      <svg className={`w-4 h-4 transition-transform ${expandedSections.basic ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    {expandedSections.basic && (
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="ropa-activity" className="block text-sm font-medium mb-1.5">Activity Name *</label>
                            <input id="ropa-activity" type="text" value={formActivity} onChange={(e) => setFormActivity(e.target.value)} placeholder="e.g., Customer Data Processing" className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
                          </div>
                          <div>
                            <label htmlFor="ropa-department" className="block text-sm font-medium mb-1.5">Department</label>
                            <select id="ropa-department" value={formDepartment} onChange={(e) => setFormDepartment(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow">
                              <option value="">Select department</option>
                              {DEPARTMENTS.map((d) => (<option key={d} value={d}>{d}</option>))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label htmlFor="ropa-purpose" className="block text-sm font-medium mb-1.5">Purpose of Processing *</label>
                          <textarea id="ropa-purpose" value={formPurpose} onChange={(e) => setFormPurpose(e.target.value)} placeholder="Describe the purpose of this data processing activity" rows={2} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label htmlFor="ropa-basis" className="block text-sm font-medium mb-1.5">Lawful Basis</label>
                            <select id="ropa-basis" value={formBasis} onChange={(e) => setFormBasis(e.target.value as LawfulBasis)} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow">
                              {(Object.entries(LAWFUL_BASIS_LABELS) as [LawfulBasis, string][]).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
                            </select>
                          </div>
                          <div>
                            <label htmlFor="ropa-risk" className="block text-sm font-medium mb-1.5">Risk Level</label>
                            <select id="ropa-risk" value={formRisk} onChange={(e) => setFormRisk(e.target.value as RiskLevel)} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow">
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="ropa-dpo" className="block text-sm font-medium mb-1.5">DPO Contact</label>
                            <input id="ropa-dpo" type="email" value={formDpo} onChange={(e) => setFormDpo(e.target.value)} placeholder="dpo@company.com" className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section: Data Details */}
                  <div className="border rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection('data')}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-blue-600">2</span>
                        <span className="font-medium text-sm">Data Categories, Subjects &amp; Recipients</span>
                      </div>
                      <svg className={`w-4 h-4 transition-transform ${expandedSections.data ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    {expandedSections.data && (
                      <div className="p-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Categories of Personal Data</label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {DATA_CATEGORY_OPTIONS.map((category) => (
                              <label key={category} className={`flex items-center gap-2 text-sm cursor-pointer p-2 rounded-lg border transition-colors ${formCategories.includes(category) ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                                <input type="checkbox" checked={formCategories.includes(category)} onChange={() => handleToggleCategory(category)} className="rounded text-blue-600" />
                                {category}
                              </label>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Categories of Data Subjects</label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {DATA_SUBJECT_OPTIONS.map((subject) => (
                              <label key={subject} className={`flex items-center gap-2 text-sm cursor-pointer p-2 rounded-lg border transition-colors ${formSubjects.includes(subject) ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                                <input type="checkbox" checked={formSubjects.includes(subject)} onChange={() => handleToggleSubject(subject)} className="rounded text-blue-600" />
                                {subject}
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="ropa-recipients" className="block text-sm font-medium mb-1.5">Recipients</label>
                            <input id="ropa-recipients" type="text" value={formRecipients} onChange={(e) => setFormRecipients(e.target.value)} placeholder="Comma-separated (e.g., HR Dept, Cloud Provider)" className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
                          </div>
                          <div>
                            <label htmlFor="ropa-retention" className="block text-sm font-medium mb-1.5">Retention Period</label>
                            <input id="ropa-retention" type="text" value={formRetention} onChange={(e) => setFormRetention(e.target.value)} placeholder="e.g., 3 years after last interaction" className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section: Security */}
                  <div className="border rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection('security')}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-blue-600">3</span>
                        <span className="font-medium text-sm">Security Measures</span>
                        {formSecurity.length > 0 && <span className="text-xs text-gray-400">({formSecurity.length} selected)</span>}
                      </div>
                      <svg className={`w-4 h-4 transition-transform ${expandedSections.security ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    {expandedSections.security && (
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {SECURITY_MEASURE_OPTIONS.map((measure) => (
                            <label key={measure} className={`flex items-center gap-2 text-sm cursor-pointer p-2 rounded-lg border transition-colors ${formSecurity.includes(measure) ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                              <input type="checkbox" checked={formSecurity.includes(measure)} onChange={() => handleToggleSecurity(measure)} className="rounded text-green-600" />
                              {measure}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section: Cross-Border */}
                  <div className="border rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection('crossBorder')}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-blue-600">4</span>
                        <span className="font-medium text-sm">Cross-Border Transfers</span>
                        {formCrossBorder && <Badge variant="info">Yes</Badge>}
                      </div>
                      <svg className={`w-4 h-4 transition-transform ${expandedSections.crossBorder ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    {expandedSections.crossBorder && (
                      <div className="p-4 space-y-4">
                        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                          <input type="checkbox" checked={formCrossBorder} onChange={(e) => setFormCrossBorder(e.target.checked)} className="rounded text-blue-600" />
                          This activity involves cross-border data transfers
                        </label>
                        {formCrossBorder && (
                          <div>
                            <label htmlFor="ropa-countries" className="block text-sm font-medium mb-1.5">Destination Countries</label>
                            <input id="ropa-countries" type="text" value={formCountries} onChange={(e) => setFormCountries(e.target.value)} placeholder="Comma-separated (e.g., United States, United Kingdom)" className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <Button onClick={handleAddRecord} disabled={!formActivity.trim() || !formPurpose.trim()} className="w-full md:w-auto">
                    Add Processing Record
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Records Table Tab */}
          <TabsContent value="records">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Processing Register</CardTitle>
                    <CardDescription>{displayedRecords.length} of {records.length} records</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="text-xs px-2 py-1 border rounded-lg bg-white dark:bg-gray-900" aria-label="Filter by department">
                      <option value="all">All Departments</option>
                      {DEPARTMENTS.filter((d) => records.some((r) => r.department === d)).map((d) => (<option key={d} value={d}>{d}</option>))}
                    </select>
                    <select value={filterRisk} onChange={(e) => setFilterRisk(e.target.value as RiskLevel | 'all')} className="text-xs px-2 py-1 border rounded-lg bg-white dark:bg-gray-900" aria-label="Filter by risk level">
                      <option value="all">All Risks</option>
                      <option value="low">Low Risk</option>
                      <option value="medium">Medium Risk</option>
                      <option value="high">High Risk</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {displayedRecords.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-gray-500 mb-2">No records match the current filters.</p>
                    <Button variant="outline" size="sm" onClick={() => { setFilterDept('all'); setFilterRisk('all'); }}>
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => handleSort('activityName')}>
                            Activity {sortField === 'activityName' && <span>{sortDir === 'asc' ? '\u2191' : '\u2193'}</span>}
                          </th>
                          <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 hidden md:table-cell" onClick={() => handleSort('department')}>
                            Department {sortField === 'department' && <span>{sortDir === 'asc' ? '\u2191' : '\u2193'}</span>}
                          </th>
                          <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Basis</th>
                          <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => handleSort('riskLevel')}>
                            Risk {sortField === 'riskLevel' && <span>{sortDir === 'asc' ? '\u2191' : '\u2193'}</span>}
                          </th>
                          <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Data</th>
                          <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="text-right py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {displayedRecords.map((record) => {
                          const riskConfig = getRiskConfig(record.riskLevel);
                          const statusConfig = getStatusConfig(record.status);
                          const isOverdue = record.lastReviewed < Date.now() - 90 * 24 * 60 * 60 * 1000;

                          return (
                            <tr key={record.id} className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors ${isOverdue ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''}`}>
                              <td className="py-3 px-3">
                                <div className="font-medium text-sm">{record.activityName}</div>
                                <div className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-xs">{record.purpose}</div>
                                {record.crossBorderTransfer && (
                                  <span className="inline-flex items-center gap-1 mt-1 text-xs text-blue-600 dark:text-blue-400">
                                    {'\uD83C\uDF10'} {record.transferCountries.join(', ')}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">
                                {record.department || <span className="text-gray-400">--</span>}
                              </td>
                              <td className="py-3 px-3 hidden lg:table-cell">
                                <Badge variant={getBasisBadgeVariant(record.lawfulBasis)}>
                                  {LAWFUL_BASIS_LABELS[record.lawfulBasis]}
                                </Badge>
                              </td>
                              <td className="py-3 px-3">
                                <Badge variant={riskConfig.variant}>
                                  {record.riskLevel.charAt(0).toUpperCase() + record.riskLevel.slice(1)}
                                </Badge>
                              </td>
                              <td className="py-3 px-3 hidden lg:table-cell">
                                <div className="text-xs text-gray-500 space-y-0.5">
                                  <div>{record.dataCategories.length} categories</div>
                                  <div>{record.securityMeasures.length} measures</div>
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex flex-col gap-1">
                                  <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                                  {isOverdue && (
                                    <span className="text-[10px] text-amber-600 font-medium">Overdue</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <div className="flex justify-end gap-1">
                                  {record.status !== 'under_review' && (
                                    <button onClick={() => handleUpdateStatus(record.id, 'under_review')} className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-700 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 dark:hover:bg-amber-900/20 transition-colors">
                                      Review
                                    </button>
                                  )}
                                  {record.status !== 'active' && (
                                    <button onClick={() => handleUpdateStatus(record.id, 'active')} className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-700 hover:bg-green-50 hover:border-green-200 hover:text-green-700 dark:hover:bg-green-900/20 transition-colors">
                                      Activate
                                    </button>
                                  )}
                                  {record.status !== 'archived' && (
                                    <button onClick={() => handleUpdateStatus(record.id, 'archived')} className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                      Archive
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export">
            <Card>
              <CardHeader>
                <CardTitle>Export Preview</CardTitle>
                <CardDescription>
                  Preview how your ROPA data will appear when exported as CSV. The full export includes all {records.length} records.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-xl overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 flex items-center justify-between border-b">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ropa-export.csv</span>
                    </div>
                    <span className="text-xs text-gray-400">{records.length} rows &times; {csvPreview.headers.length} columns</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-800">
                          {csvPreview.headers.map((header) => (
                            <th key={header} className="text-left py-2 px-3 text-gray-600 dark:text-gray-400 font-semibold whitespace-nowrap border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.rows.map((row, i) => (
                          <tr key={i} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                            {row.map((cell, j) => (
                              <td key={j} className="py-1.5 px-3 text-gray-700 dark:text-gray-300 whitespace-nowrap border-r border-gray-100 dark:border-gray-800 last:border-r-0 max-w-[200px] truncate">
                                {cell || <span className="text-gray-400">--</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                        {records.length > 4 && (
                          <tr className="border-t border-gray-200 dark:border-gray-700">
                            <td colSpan={csvPreview.headers.length} className="py-3 px-3 text-center text-gray-400 italic">
                              ... and {records.length - 4} more rows
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    onClick={() => {
                      const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
                      const csv = [csvPreview.headers.join(',')].concat(
                        records.map((r) => [
                          esc(r.activityName),
                          esc(r.purpose),
                          esc(LAWFUL_BASIS_LABELS[r.lawfulBasis]),
                          esc(r.department),
                          esc(r.dataCategories.join('; ')),
                          esc(r.dataSubjects.join('; ')),
                          esc(r.recipients.join('; ')),
                          esc(r.retentionPeriod),
                          r.riskLevel,
                          r.status,
                          r.crossBorderTransfer ? esc(r.transferCountries.join('; ')) : 'No',
                          r.dpoContact,
                        ].join(','))
                      ).join('\n');
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'ropa-export.csv';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Download CSV
                  </Button>
                  <Button variant="outline">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18.75 12h.008v.008h-.008V12zm-6 0h.008v.008H12.75V12z" />
                    </svg>
                    Print Report
                  </Button>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>NDPC Audit Tip:</strong> Export your ROPA regularly and keep copies readily available.
                    The Nigeria Data Protection Commission may request access to your record of processing activities
                    during compliance audits or investigations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* NDPA Reference Footer */}
        <div className="mt-10 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">NDPA Compliance Reference</h3>
              <p className="text-sm text-blue-800/80 dark:text-blue-300/80">
                The ROPA supports compliance with the <strong>NDPA&apos;s accountability principle</strong> (Section 24)
                and record-keeping obligations. Data controllers must maintain comprehensive records of processing
                activities and make them available to the <strong>Nigeria Data Protection Commission (NDPC)</strong> upon
                request. The ROPA is critical for demonstrating compliance during audits and investigations.
              </p>
              <Link
                href="/docs/components/ropa"
                className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                View full documentation
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DemoLayout>
  );
}
