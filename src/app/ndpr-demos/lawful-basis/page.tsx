'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  department: string;
}

const LAWFUL_BASES: Record<
  LawfulBasis,
  {
    label: string;
    description: string;
    section: string;
    whenToUse: string;
    color: string;
    bgColor: string;
    borderColor: string;
    iconBg: string;
    icon: string;
  }
> = {
  consent: {
    label: 'Consent',
    description:
      'The data subject has given clear consent for processing their personal data for a specific purpose.',
    section: 'Section 25(1)(a)',
    whenToUse: 'Marketing emails, cookies, newsletter subscriptions, optional profiling',
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-50 dark:bg-blue-950/40',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconBg: 'bg-blue-100 dark:bg-blue-900',
    icon: '\u2713',
  },
  contract: {
    label: 'Contract',
    description:
      'Processing is necessary for the performance of a contract with the data subject.',
    section: 'Section 25(1)(b)',
    whenToUse: 'Account creation, order fulfilment, service delivery, payment processing',
    color: 'text-green-700 dark:text-green-300',
    bgColor: 'bg-green-50 dark:bg-green-950/40',
    borderColor: 'border-green-200 dark:border-green-800',
    iconBg: 'bg-green-100 dark:bg-green-900',
    icon: '\u2696',
  },
  legal_obligation: {
    label: 'Legal Obligation',
    description:
      'Processing is necessary for compliance with a legal obligation to which the controller is subject.',
    section: 'Section 25(1)(c)',
    whenToUse: 'Tax reporting, regulatory filings, employment law compliance, anti-money laundering',
    color: 'text-purple-700 dark:text-purple-300',
    bgColor: 'bg-purple-50 dark:bg-purple-950/40',
    borderColor: 'border-purple-200 dark:border-purple-800',
    iconBg: 'bg-purple-100 dark:bg-purple-900',
    icon: '\u00a7',
  },
  vital_interests: {
    label: 'Vital Interests',
    description:
      'Processing is necessary to protect the vital interests of the data subject or another person.',
    section: 'Section 25(1)(d)',
    whenToUse: 'Medical emergencies, disaster response, life-threatening situations',
    color: 'text-red-700 dark:text-red-300',
    bgColor: 'bg-red-50 dark:bg-red-950/40',
    borderColor: 'border-red-200 dark:border-red-800',
    iconBg: 'bg-red-100 dark:bg-red-900',
    icon: '\u2665',
  },
  public_interest: {
    label: 'Public Interest',
    description:
      'Processing is necessary for a task carried out in the public interest or in the exercise of official authority.',
    section: 'Section 25(1)(e)',
    whenToUse: 'Government functions, public health monitoring, academic research, archiving',
    color: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    borderColor: 'border-amber-200 dark:border-amber-800',
    iconBg: 'bg-amber-100 dark:bg-amber-900',
    icon: '\u2605',
  },
  legitimate_interests: {
    label: 'Legitimate Interests',
    description:
      'Processing is necessary for the legitimate interests of the controller, except where overridden by the data subject\u2019s rights.',
    section: 'Section 25(1)(f)',
    whenToUse: 'Fraud prevention, network security, direct marketing to existing clients, internal analytics',
    color: 'text-indigo-700 dark:text-indigo-300',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900',
    icon: '\u2261',
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

const SAMPLE_ACTIVITIES: ProcessingActivity[] = [
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
    department: 'Customer Success',
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
    department: 'Marketing',
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
    department: 'Finance',
  },
  {
    id: 'act-4',
    name: 'Fraud Detection System',
    description: 'Real-time analysis of transaction patterns to identify and prevent fraudulent activities',
    lawfulBasis: 'legitimate_interests',
    dataCategories: ['Financial Information', 'Online Identifiers', 'Location Data'],
    dataSubjects: 'Customers',
    retentionPeriod: '3 years after last transaction',
    createdAt: Date.now() - 200 * 24 * 60 * 60 * 1000,
    status: 'active',
    justification:
      'The controller has a legitimate interest in preventing financial fraud and protecting customers from unauthorized transactions.',
    department: 'Security',
  },
  {
    id: 'act-5',
    name: 'Employee Health Records',
    description: 'Processing occupational health data for workplace safety compliance',
    lawfulBasis: 'legal_obligation',
    dataCategories: ['Basic Personal Information', 'Health Data', 'Employment Data'],
    dataSubjects: 'Employees',
    retentionPeriod: '40 years per occupational health regulations',
    createdAt: Date.now() - 300 * 24 * 60 * 60 * 1000,
    status: 'under_review',
    justification:
      'Required under Nigerian occupational health and safety regulations for workplace safety monitoring.',
    department: 'Human Resources',
  },
];

export default function LawfulBasisDemoPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isClient, setIsClient] = useState(false);
  const [activities, setActivities] = useState<ProcessingActivity[]>([]);
  const [hoveredBasis, setHoveredBasis] = useState<LawfulBasis | null>(null);
  const [filterBasis, setFilterBasis] = useState<LawfulBasis | 'all'>('all');

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formBasis, setFormBasis] = useState<LawfulBasis>('consent');
  const [formCategories, setFormCategories] = useState<string[]>([]);
  const [formSubjects, setFormSubjects] = useState('');
  const [formRetention, setFormRetention] = useState('');
  const [formJustification, setFormJustification] = useState('');
  const [formDepartment, setFormDepartment] = useState('');

  useEffect(() => {
    setIsClient(true);
    setActivities(SAMPLE_ACTIVITIES);
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
      department: formDepartment,
    };

    setActivities((prev) => [newActivity, ...prev]);
    setFormName('');
    setFormDescription('');
    setFormBasis('consent');
    setFormCategories([]);
    setFormSubjects('');
    setFormRetention('');
    setFormJustification('');
    setFormDepartment('');
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

  const complianceScore = useMemo(() => {
    if (activities.length === 0) return 0;
    let score = 0;
    const total = activities.length;
    activities.forEach((a) => {
      let actScore = 0;
      if (a.justification && a.justification.length > 10) actScore += 25;
      if (a.dataCategories.length > 0) actScore += 25;
      if (a.retentionPeriod) actScore += 25;
      if (a.status === 'active') actScore += 25;
      score += actScore;
    });
    return Math.round(score / total);
  }, [activities]);

  const filteredActivities = useMemo(() => {
    if (filterBasis === 'all') return activities;
    return activities.filter((a) => a.lawfulBasis === filterBasis);
  }, [activities, filterBasis]);

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/20">
      <div className="container mx-auto py-10 px-4 max-w-7xl">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            href="/ndpr-demos"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to NDPA Demos
          </Link>
        </div>

        {/* Hero Section */}
        <div className="relative mb-12 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-5 sm:p-8 md:p-12 text-white shadow-xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              NDPA Section 25
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">Lawful Basis Tracker</h1>
            <p className="text-blue-100 text-lg max-w-2xl">
              Document and manage the legal grounds for every data processing activity. Ensure every operation has a valid lawful basis under the Nigeria Data Protection Act.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-sm">
                <span className="text-2xl font-bold">{activities.length}</span>
                <span className="text-blue-200">Activities</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-sm">
                <span className="text-2xl font-bold">{new Set(activities.map((a) => a.lawfulBasis)).size}</span>
                <span className="text-blue-200">Bases Used</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-sm">
                <span className="text-2xl font-bold">{activities.filter((a) => a.status === 'active').length}</span>
                <span className="text-blue-200">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lawful Basis Selector Grid */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-1">The Six Lawful Bases</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Under NDPA Section 25, processing is only lawful if grounded in one of these six bases. Hover over a card to learn when to use it.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.entries(LAWFUL_BASES) as [LawfulBasis, typeof LAWFUL_BASES[LawfulBasis]][]).map(
              ([key, basis]) => {
                const count = activities.filter((a) => a.lawfulBasis === key).length;
                const isHovered = hoveredBasis === key;
                return (
                  <div
                    key={key}
                    className={`relative rounded-xl border-2 p-5 transition-all duration-300 cursor-pointer ${basis.bgColor} ${basis.borderColor} ${
                      isHovered ? 'shadow-lg scale-[1.02]' : 'shadow-sm'
                    }`}
                    onMouseEnter={() => setHoveredBasis(key)}
                    onMouseLeave={() => setHoveredBasis(null)}
                    onClick={() => {
                      setFormBasis(key);
                      setActiveTab('add');
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-lg ${basis.iconBg} flex items-center justify-center text-lg font-bold ${basis.color}`}>
                        {basis.icon}
                      </div>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${basis.iconBg} ${basis.color}`}>
                        {basis.section}
                      </span>
                    </div>
                    <h3 className={`text-base font-semibold mb-1 ${basis.color}`}>{basis.label}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                      {basis.description}
                    </p>

                    {/* When to use tooltip */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        isHovered ? 'max-h-24 opacity-100 mt-2' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className={`text-xs p-2.5 rounded-lg border ${basis.borderColor} ${basis.iconBg}`}>
                        <span className={`font-semibold ${basis.color}`}>When to use:</span>{' '}
                        <span className="text-gray-600 dark:text-gray-400">{basis.whenToUse}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {count} {count === 1 ? 'activity' : 'activities'}
                      </span>
                      <span className={`text-xs font-medium ${basis.color}`}>
                        Select &rarr;
                      </span>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="add">Add Activity</TabsTrigger>
            <TabsTrigger value="register">Activity Register</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Compliance Score */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Compliance Score</CardTitle>
                  <CardDescription>Documentation completeness across all activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center py-4">
                    <div className="relative w-36 h-36 mb-4">
                      <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 144 144">
                        <circle
                          cx="72"
                          cy="72"
                          r="62"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          className="text-gray-200 dark:text-gray-700"
                        />
                        <circle
                          cx="72"
                          cy="72"
                          r="62"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${(complianceScore / 100) * 389.56} 389.56`}
                          strokeLinecap="round"
                          className={
                            complianceScore >= 80
                              ? 'text-green-500'
                              : complianceScore >= 50
                              ? 'text-amber-500'
                              : 'text-red-500'
                          }
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold">{complianceScore}%</span>
                        <span className="text-xs text-gray-500">Documented</span>
                      </div>
                    </div>
                    <div className="w-full space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">With justification</span>
                        <span className="font-medium">{activities.filter((a) => a.justification && a.justification.length > 10).length}/{activities.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">With data categories</span>
                        <span className="font-medium">{activities.filter((a) => a.dataCategories.length > 0).length}/{activities.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">With retention period</span>
                        <span className="font-medium">{activities.filter((a) => a.retentionPeriod).length}/{activities.length}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Distribution & Stats */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Lawful Basis Distribution</CardTitle>
                  <CardDescription>
                    How your processing activities are distributed across the six lawful bases.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(Object.entries(LAWFUL_BASES) as [LawfulBasis, typeof LAWFUL_BASES[LawfulBasis]][]).map(
                      ([key, basis]) => {
                        const count = activities.filter((a) => a.lawfulBasis === key).length;
                        const percentage = activities.length > 0 ? (count / activities.length) * 100 : 0;
                        return (
                          <div key={key} className="group">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${basis.iconBg} border ${basis.borderColor}`}></span>
                                <span className="text-sm font-medium">{basis.label}</span>
                                <span className="text-xs text-gray-400">{basis.section}</span>
                              </div>
                              <span className="text-sm font-semibold tabular-nums">
                                {count} <span className="text-gray-400 font-normal">({percentage.toFixed(0)}%)</span>
                              </span>
                            </div>
                            <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ease-out ${
                                  key === 'consent' ? 'bg-blue-500' :
                                  key === 'contract' ? 'bg-green-500' :
                                  key === 'legal_obligation' ? 'bg-purple-500' :
                                  key === 'vital_interests' ? 'bg-red-500' :
                                  key === 'public_interest' ? 'bg-amber-500' :
                                  'bg-indigo-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activities.length}</div>
                      <div className="text-xs text-gray-500">Total Activities</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <div className="text-2xl font-bold text-green-600">{activities.filter((a) => a.status === 'active').length}</div>
                      <div className="text-xs text-gray-500">Active</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                      <div className="text-2xl font-bold text-amber-600">{activities.filter((a) => a.status === 'under_review').length}</div>
                      <div className="text-xs text-gray-500">Under Review</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Add Activity Tab */}
          <TabsContent value="add">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Selected Basis Card */}
              <div className="lg:col-span-1 order-2 lg:order-1">
                <div className={`sticky top-6 rounded-xl border-2 p-6 transition-all ${LAWFUL_BASES[formBasis].bgColor} ${LAWFUL_BASES[formBasis].borderColor}`}>
                  <div className={`w-12 h-12 rounded-xl ${LAWFUL_BASES[formBasis].iconBg} flex items-center justify-center text-2xl font-bold ${LAWFUL_BASES[formBasis].color} mb-4`}>
                    {LAWFUL_BASES[formBasis].icon}
                  </div>
                  <h3 className={`text-lg font-bold mb-1 ${LAWFUL_BASES[formBasis].color}`}>
                    {LAWFUL_BASES[formBasis].label}
                  </h3>
                  <p className={`text-xs font-mono mb-3 ${LAWFUL_BASES[formBasis].color} opacity-80`}>
                    {LAWFUL_BASES[formBasis].section}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {LAWFUL_BASES[formBasis].description}
                  </p>
                  <div className={`p-3 rounded-lg border ${LAWFUL_BASES[formBasis].borderColor} ${LAWFUL_BASES[formBasis].iconBg}`}>
                    <p className="text-xs font-semibold mb-1">Typical use cases:</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {LAWFUL_BASES[formBasis].whenToUse}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <Card className="lg:col-span-2 order-1 lg:order-2">
                <CardHeader>
                  <CardTitle>Add Processing Activity</CardTitle>
                  <CardDescription>
                    Document a new processing activity and select its lawful basis under NDPA Section 25.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Activity Name *</label>
                        <input
                          type="text"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder="e.g., Customer Onboarding"
                          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Department</label>
                        <input
                          type="text"
                          value={formDepartment}
                          onChange={(e) => setFormDepartment(e.target.value)}
                          placeholder="e.g., Marketing, Finance, HR"
                          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5">Description *</label>
                      <textarea
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Describe the processing activity in detail"
                        rows={3}
                        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Lawful Basis *</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {(Object.entries(LAWFUL_BASES) as [LawfulBasis, typeof LAWFUL_BASES[LawfulBasis]][]).map(
                          ([key, basis]) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setFormBasis(key)}
                              className={`p-3 rounded-lg border-2 text-left transition-all ${
                                formBasis === key
                                  ? `${basis.bgColor} ${basis.borderColor} shadow-md`
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                              }`}
                            >
                              <div className={`text-sm font-medium ${formBasis === key ? basis.color : ''}`}>
                                {basis.label}
                              </div>
                              <div className="text-xs text-gray-400 mt-0.5">{basis.section}</div>
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Data Categories</label>
                      <div className="grid grid-cols-2 gap-2">
                        {DATA_CATEGORY_OPTIONS.map((category) => (
                          <label
                            key={category}
                            className={`flex items-center gap-2 text-sm cursor-pointer p-2 rounded-lg border transition-colors ${
                              formCategories.includes(category)
                                ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                                : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formCategories.includes(category)}
                              onChange={() => handleToggleCategory(category)}
                              className="rounded text-blue-600"
                            />
                            {category}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Data Subjects *</label>
                        <input
                          type="text"
                          value={formSubjects}
                          onChange={(e) => setFormSubjects(e.target.value)}
                          placeholder="e.g., Customers, Employees"
                          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Retention Period</label>
                        <input
                          type="text"
                          value={formRetention}
                          onChange={(e) => setFormRetention(e.target.value)}
                          placeholder="e.g., 3 years after account closure"
                          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5">Justification</label>
                      <textarea
                        value={formJustification}
                        onChange={(e) => setFormJustification(e.target.value)}
                        placeholder="Explain why this lawful basis applies to this processing activity"
                        rows={3}
                        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                      />
                    </div>

                    <Button
                      onClick={handleAddActivity}
                      disabled={!formName.trim() || !formDescription.trim() || !formSubjects.trim()}
                      className="w-full md:w-auto"
                    >
                      Add Processing Activity
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Register Tab */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Processing Activity Register</CardTitle>
                    <CardDescription>
                      {filteredActivities.length} of {activities.length} activities shown
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setFilterBasis('all')}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        filterBasis === 'all'
                          ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      All
                    </button>
                    {(Object.entries(LAWFUL_BASES) as [LawfulBasis, typeof LAWFUL_BASES[LawfulBasis]][]).map(
                      ([key, basis]) => (
                        <button
                          key={key}
                          onClick={() => setFilterBasis(key)}
                          className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                            filterBasis === key
                              ? `${basis.bgColor} ${basis.borderColor} ${basis.color} font-medium`
                              : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          {basis.label}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredActivities.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 mb-2">No activities match this filter.</p>
                    <Button variant="outline" size="sm" onClick={() => setFilterBasis('all')}>
                      Clear Filter
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Activity</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Lawful Basis</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Data Subjects</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Retention</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {filteredActivities.map((activity) => (
                          <tr key={activity.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-medium text-sm">{activity.name}</div>
                              <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{activity.description}</div>
                              {activity.department && (
                                <span className="inline-block mt-1 text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                  {activity.department}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={getBasisBadgeVariant(activity.lawfulBasis)}>
                                {LAWFUL_BASES[activity.lawfulBasis].label}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">
                              {activity.dataSubjects}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 hidden lg:table-cell">
                              {activity.retentionPeriod || <span className="text-gray-400">--</span>}
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={getStatusBadgeVariant(activity.status)}>
                                {activity.status.replace('_', ' ')}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex justify-end gap-1">
                                {activity.status !== 'under_review' && (
                                  <button
                                    onClick={() => handleUpdateStatus(activity.id, 'under_review')}
                                    className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-700 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 dark:hover:bg-amber-900/20 transition-colors"
                                  >
                                    Review
                                  </button>
                                )}
                                {activity.status !== 'active' && (
                                  <button
                                    onClick={() => handleUpdateStatus(activity.id, 'active')}
                                    className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-700 hover:bg-green-50 hover:border-green-200 hover:text-green-700 dark:hover:bg-green-900/20 transition-colors"
                                  >
                                    Activate
                                  </button>
                                )}
                                {activity.status !== 'archived' && (
                                  <button
                                    onClick={() => handleUpdateStatus(activity.id, 'archived')}
                                    className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                  >
                                    Archive
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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
                This component supports compliance with <strong>NDPA Section 25</strong> (lawful bases for
                processing) and <strong>Section 24</strong> (principles of data processing, including the
                accountability principle). The <strong>Nigeria Data Protection Commission (NDPC)</strong> may
                request evidence of lawful basis documentation during compliance audits.
              </p>
              <Link
                href="/docs/components/lawful-basis-tracker"
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
    </div>
  );
}
