'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Label } from '@/components/ui/label';

// ---------- Types ----------

interface BreachFormData {
  title: string;
  description: string;
  category: string;
  affectedSystems: string[];
  dataTypes: string[];
  estimatedAffected: number;
  reporterName: string;
  reporterEmail: string;
  reporterDepartment: string;
}

interface RiskScores {
  confidentiality: number;
  integrity: number;
  availability: number;
}

interface ResolutionData {
  status: 'contained' | 'resolved';
  actionsTaken: string;
  lessonsLearned: string;
  preventiveMeasures: string;
}

type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

// ---------- Constants ----------

const STEPS = [
  { id: 1, label: 'Report Breach', icon: '1' },
  { id: 2, label: 'Risk Assessment', icon: '2' },
  { id: 3, label: 'NDPC Notification', icon: '3' },
  { id: 4, label: 'Resolution', icon: '4' },
];

const BREACH_CATEGORIES = [
  { value: '', label: 'Select category...' },
  { value: 'unauthorized_access', label: 'Unauthorized Access' },
  { value: 'data_leak', label: 'Data Leak / Exposure' },
  { value: 'phishing', label: 'Phishing Attack' },
  { value: 'ransomware', label: 'Ransomware / Malware' },
  { value: 'device_loss', label: 'Lost / Stolen Device' },
  { value: 'insider_threat', label: 'Insider Threat' },
  { value: 'system_compromise', label: 'System Compromise' },
  { value: 'other', label: 'Other' },
];

const AFFECTED_SYSTEMS_OPTIONS = [
  'Customer Database',
  'Employee Records',
  'Email System',
  'Financial Systems',
  'Website / Web App',
  'Mobile Application',
  'Cloud Storage',
  'Internal Network',
];

const DATA_TYPES_OPTIONS = [
  'Full Names',
  'Email Addresses',
  'Phone Numbers',
  'Physical Addresses',
  'National ID (NIN)',
  'Financial / Banking Data',
  'Health Records',
  'Biometric Data',
  'Login Credentials',
  'IP Addresses',
];

const NOTIFICATION_CHECKLIST = [
  'Nature of the personal data breach',
  'Categories and approximate number of data subjects affected',
  'Categories and approximate number of personal data records affected',
  'Name and contact details of the Data Protection Officer',
  'Description of likely consequences of the breach',
  'Description of measures taken or proposed to address the breach',
  'Description of measures taken to mitigate possible adverse effects',
];

const SAMPLE_STATS = {
  totalBreaches: 12,
  bySeverity: { low: 3, medium: 5, high: 3, critical: 1 },
  avgResolutionDays: 4.2,
  complianceRate: 91.7,
};

// ---------- Helpers ----------

function calculateRiskScore(scores: RiskScores): number {
  return Math.round(((scores.confidentiality + scores.integrity + scores.availability) / 15) * 100);
}

function getRiskLevel(score: number): RiskLevel {
  if (score <= 25) return 'low';
  if (score <= 50) return 'medium';
  if (score <= 75) return 'high';
  return 'critical';
}

function getRiskBadgeVariant(level: RiskLevel): 'success' | 'warning' | 'danger' | 'primary' {
  switch (level) {
    case 'low': return 'success';
    case 'medium': return 'warning';
    case 'high': return 'danger';
    case 'critical': return 'primary';
  }
}

function getRiskLevelColor(level: RiskLevel): string {
  switch (level) {
    case 'low': return 'text-green-600 dark:text-green-400';
    case 'medium': return 'text-amber-600 dark:text-amber-400';
    case 'high': return 'text-red-600 dark:text-red-400';
    case 'critical': return 'text-purple-600 dark:text-purple-400';
  }
}

function formatCountdown(ms: number): { hours: number; minutes: number; seconds: number; expired: boolean; urgency: 'green' | 'yellow' | 'red' } {
  if (ms <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, expired: true, urgency: 'red' };
  }
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const urgency = hours >= 48 ? 'green' : hours >= 24 ? 'yellow' : 'red';
  return { hours, minutes, seconds, expired: false, urgency };
}

// ---------- Component ----------

export default function BreachDemoPage() {
  const [isClient, setIsClient] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Breach Report
  const [breachForm, setBreachForm] = useState<BreachFormData>({
    title: '',
    description: '',
    category: '',
    affectedSystems: [],
    dataTypes: [],
    estimatedAffected: 0,
    reporterName: '',
    reporterEmail: '',
    reporterDepartment: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Step 2: Risk Assessment
  const [riskScores, setRiskScores] = useState<RiskScores>({
    confidentiality: 1,
    integrity: 1,
    availability: 1,
  });

  // Step 3: NDPC Notification
  const [discoveryTime] = useState(() => Date.now());
  const [countdown, setCountdown] = useState<{ hours: number; minutes: number; seconds: number; expired: boolean; urgency: 'green' | 'yellow' | 'red' }>({ hours: 72, minutes: 0, seconds: 0, expired: false, urgency: 'green' });
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  // Step 4: Resolution
  const [resolution, setResolution] = useState<ResolutionData>({
    status: 'contained',
    actionsTaken: '',
    lessonsLearned: '',
    preventiveMeasures: '',
  });
  const [isResolved, setIsResolved] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!isClient) return;
    const deadline = discoveryTime + 72 * 60 * 60 * 1000;
    const interval = setInterval(() => {
      const remaining = deadline - Date.now();
      setCountdown(formatCountdown(remaining));
    }, 1000);
    return () => clearInterval(interval);
  }, [isClient, discoveryTime]);

  // ---------- Step 1 Handlers ----------

  const toggleArrayItem = useCallback((field: 'affectedSystems' | 'dataTypes', item: string) => {
    setBreachForm(prev => {
      const current = prev[field];
      const updated = current.includes(item)
        ? current.filter(i => i !== item)
        : [...current, item];
      return { ...prev, [field]: updated };
    });
  }, []);

  const validateStep1 = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    if (!breachForm.title.trim()) errors.title = 'Breach title is required';
    if (!breachForm.description.trim()) errors.description = 'Description is required';
    if (!breachForm.category) errors.category = 'Please select a category';
    if (!breachForm.reporterName.trim()) errors.reporterName = 'Reporter name is required';
    if (!breachForm.reporterEmail.trim()) errors.reporterEmail = 'Reporter email is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [breachForm]);

  const handleStep1Submit = useCallback(() => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  }, [validateStep1]);

  // ---------- Step 2 Handlers ----------

  const handleRiskSlider = useCallback((field: keyof RiskScores, value: number) => {
    setRiskScores(prev => ({ ...prev, [field]: value }));
  }, []);

  // ---------- Step 4 Handlers ----------

  const handleResolve = useCallback(() => {
    setIsResolved(true);
  }, []);

  // ---------- Derived values ----------

  const riskScore = calculateRiskScore(riskScores);
  const riskLevel = getRiskLevel(riskScore);
  const requiresNdpcNotification = riskScore > 25;

  if (!isClient) {
    return (
      <div className="container mx-auto py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      {/* Hero Section */}
      <div className="mb-10">
        <Link
          href="/ndpr-demos"
          className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline mb-6"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to NDPA Demos
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Breach Notification
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400 text-lg">
              NDPA Section 40 &mdash; 72-hour NDPC notification
            </p>
          </div>
          <Badge variant="outline" className="self-start text-sm px-3 py-1">
            Interactive Demo
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {STEPS.map((step, idx) => (
            <React.Fragment key={step.id}>
              <button
                onClick={() => {
                  if (step.id < currentStep) setCurrentStep(step.id);
                }}
                className={`flex flex-col items-center gap-2 group ${
                  step.id <= currentStep ? 'cursor-pointer' : 'cursor-default'
                }`}
                disabled={step.id > currentStep}
              >
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                    ${step.id < currentStep
                      ? 'bg-green-600 text-white shadow-md'
                      : step.id === currentStep
                        ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-200 dark:ring-blue-900'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }
                  `}
                >
                  {step.id < currentStep ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.icon
                  )}
                </div>
                <span
                  className={`text-xs font-medium text-center hidden sm:block ${
                    step.id <= currentStep
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </button>

              {idx < STEPS.length - 1 && (
                <div className="flex-1 mx-2 sm:mx-4">
                  <div className="h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        step.id < currentStep
                          ? 'bg-green-500 w-full'
                          : 'bg-gray-200 dark:bg-gray-700 w-0'
                      }`}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 72-Hour Countdown */}
      <Card className="mb-8 overflow-hidden">
        <div
          className={`px-6 py-4 ${
            countdown.urgency === 'green'
              ? 'bg-green-50 dark:bg-green-950 border-b border-green-200 dark:border-green-800'
              : countdown.urgency === 'yellow'
                ? 'bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800'
                : 'bg-red-50 dark:bg-red-950 border-b border-red-200 dark:border-red-800'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className={`font-semibold ${
                countdown.urgency === 'green'
                  ? 'text-green-800 dark:text-green-300'
                  : countdown.urgency === 'yellow'
                    ? 'text-amber-800 dark:text-amber-300'
                    : 'text-red-800 dark:text-red-300'
              }`}>
                72-Hour NDPC Notification Deadline
              </h3>
              <p className={`text-sm mt-0.5 ${
                countdown.urgency === 'green'
                  ? 'text-green-600 dark:text-green-400'
                  : countdown.urgency === 'yellow'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-red-600 dark:text-red-400'
              }`}>
                {countdown.expired
                  ? 'Deadline has passed — immediate notification required'
                  : 'Time remaining to notify the Nigeria Data Protection Commission'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {countdown.expired ? (
                <Badge variant="danger" className="text-base px-4 py-2">OVERDUE</Badge>
              ) : (
                <>
                  <CountdownUnit
                    value={countdown.hours}
                    label="hrs"
                    urgency={countdown.urgency}
                  />
                  <span className={`text-xl font-bold ${
                    countdown.urgency === 'green'
                      ? 'text-green-600 dark:text-green-400'
                      : countdown.urgency === 'yellow'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-red-600 dark:text-red-400'
                  }`}>:</span>
                  <CountdownUnit
                    value={countdown.minutes}
                    label="min"
                    urgency={countdown.urgency}
                  />
                  <span className={`text-xl font-bold ${
                    countdown.urgency === 'green'
                      ? 'text-green-600 dark:text-green-400'
                      : countdown.urgency === 'yellow'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-red-600 dark:text-red-400'
                  }`}>:</span>
                  <CountdownUnit
                    value={countdown.seconds}
                    label="sec"
                    urgency={countdown.urgency}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Step Content */}
      <div className="mb-10">
        {/* Step 1: Report Breach */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Report a Data Breach</CardTitle>
              <CardDescription>
                Document the breach details as soon as it is discovered. This information will be used
                for the risk assessment and regulatory notification.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Breach Title */}
                <div>
                  <Label htmlFor="breach-title" className="mb-2">Breach Title *</Label>
                  <Input
                    id="breach-title"
                    placeholder="e.g., Customer Database Unauthorized Access"
                    value={breachForm.title}
                    onChange={e => setBreachForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                  {formErrors.title && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="breach-description" className="mb-2">Description *</Label>
                  <TextArea
                    id="breach-description"
                    placeholder="Describe what happened, how it was discovered, and the initial scope of the breach..."
                    rows={4}
                    value={breachForm.description}
                    onChange={e => setBreachForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                  {formErrors.description && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="breach-category" className="mb-2">Breach Category *</Label>
                  <Select
                    id="breach-category"
                    value={breachForm.category}
                    onChange={e => setBreachForm(prev => ({ ...prev, category: e.target.value }))}
                  >
                    {BREACH_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </Select>
                  {formErrors.category && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>
                  )}
                </div>

                {/* Affected Systems */}
                <div>
                  <Label className="mb-3">Affected Systems</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {AFFECTED_SYSTEMS_OPTIONS.map(system => (
                      <Checkbox
                        key={system}
                        label={system}
                        checked={breachForm.affectedSystems.includes(system)}
                        onChange={() => toggleArrayItem('affectedSystems', system)}
                      />
                    ))}
                  </div>
                </div>

                {/* Data Types */}
                <div>
                  <Label className="mb-3">Data Types Involved</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {DATA_TYPES_OPTIONS.map(dt => (
                      <Checkbox
                        key={dt}
                        label={dt}
                        checked={breachForm.dataTypes.includes(dt)}
                        onChange={() => toggleArrayItem('dataTypes', dt)}
                      />
                    ))}
                  </div>
                </div>

                {/* Estimated Affected */}
                <div>
                  <Label htmlFor="estimated-affected" className="mb-2">Estimated Affected Data Subjects</Label>
                  <Input
                    id="estimated-affected"
                    type="number"
                    min={0}
                    placeholder="0"
                    value={breachForm.estimatedAffected || ''}
                    onChange={e => setBreachForm(prev => ({ ...prev, estimatedAffected: parseInt(e.target.value) || 0 }))}
                  />
                </div>

                {/* Reporter Info */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Reporter Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="reporter-name" className="mb-2">Name *</Label>
                      <Input
                        id="reporter-name"
                        placeholder="Full name"
                        value={breachForm.reporterName}
                        onChange={e => setBreachForm(prev => ({ ...prev, reporterName: e.target.value }))}
                      />
                      {formErrors.reporterName && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.reporterName}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="reporter-email" className="mb-2">Email *</Label>
                      <Input
                        id="reporter-email"
                        type="email"
                        placeholder="email@example.com"
                        value={breachForm.reporterEmail}
                        onChange={e => setBreachForm(prev => ({ ...prev, reporterEmail: e.target.value }))}
                      />
                      {formErrors.reporterEmail && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.reporterEmail}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="reporter-dept" className="mb-2">Department</Label>
                      <Input
                        id="reporter-dept"
                        placeholder="e.g., IT Security"
                        value={breachForm.reporterDepartment}
                        onChange={e => setBreachForm(prev => ({ ...prev, reporterDepartment: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleStep1Submit}>
                    Continue to Risk Assessment
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Risk Assessment */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Risk Assessment</CardTitle>
              <CardDescription>
                Evaluate the impact of the breach across three dimensions to determine the overall risk
                level and whether NDPC notification is required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Breach Summary */}
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Breach Summary
                  </h4>
                  <p className="font-medium text-gray-900 dark:text-white">{breachForm.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Category: {BREACH_CATEGORIES.find(c => c.value === breachForm.category)?.label || 'N/A'}
                    {breachForm.estimatedAffected > 0 && (
                      <> &bull; {breachForm.estimatedAffected.toLocaleString()} estimated affected subjects</>
                    )}
                  </p>
                </div>

                {/* Sliders */}
                <div className="space-y-6">
                  <RiskSlider
                    label="Confidentiality Impact"
                    description="How severely was data confidentiality compromised?"
                    value={riskScores.confidentiality}
                    onChange={v => handleRiskSlider('confidentiality', v)}
                  />
                  <RiskSlider
                    label="Integrity Impact"
                    description="Was data altered, corrupted, or tampered with?"
                    value={riskScores.integrity}
                    onChange={v => handleRiskSlider('integrity', v)}
                  />
                  <RiskSlider
                    label="Availability Impact"
                    description="Was access to data or systems disrupted?"
                    value={riskScores.availability}
                    onChange={v => handleRiskSlider('availability', v)}
                  />
                </div>

                {/* Risk Score Result */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Risk Score</p>
                      <p className={`text-4xl font-bold ${getRiskLevelColor(riskLevel)}`}>{riskScore}%</p>
                    </div>
                    <div className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Risk Level</p>
                      <Badge variant={getRiskBadgeVariant(riskLevel)} className="text-lg px-4 py-1.5 mt-1">
                        {riskLevel.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">NDPC Notification</p>
                      {requiresNdpcNotification ? (
                        <Badge variant="danger" className="text-lg px-4 py-1.5 mt-1">REQUIRED</Badge>
                      ) : (
                        <Badge variant="success" className="text-lg px-4 py-1.5 mt-1">NOT REQUIRED</Badge>
                      )}
                    </div>
                  </div>

                  {requiresNdpcNotification && (
                    <div className="mt-4 p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-700 dark:text-red-300">
                        <strong>Action Required:</strong> Based on the risk assessment, this breach must be
                        reported to the Nigeria Data Protection Commission (NDPC) within 72 hours of discovery,
                        in accordance with NDPA Section 40.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </Button>
                  <Button onClick={() => setCurrentStep(3)}>
                    Continue to Notification
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: NDPC Notification */}
        {currentStep === 3 && (
          <div className="space-y-6">
            {/* Regulatory Report Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">NDPC Notification Report</CardTitle>
                <CardDescription>
                  Review the generated regulatory notification report before submission to the Nigeria
                  Data Protection Commission.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Generated Report */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 dark:bg-gray-800 px-5 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wider">
                          Regulatory Report Preview
                        </h4>
                        <Badge variant="warning">Draft</Badge>
                      </div>
                    </div>
                    <div className="p-5 space-y-4 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 font-medium">Reference Number</p>
                          <p className="text-gray-900 dark:text-white font-mono">
                            BR-{new Date(discoveryTime).getFullYear()}-{String(discoveryTime).slice(-6)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 font-medium">Date of Discovery</p>
                          <p className="text-gray-900 dark:text-white">
                            {new Date(discoveryTime).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Breach Title</p>
                        <p className="text-gray-900 dark:text-white">{breachForm.title || 'N/A'}</p>
                      </div>

                      <div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Description</p>
                        <p className="text-gray-900 dark:text-white">{breachForm.description || 'N/A'}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 font-medium">Category</p>
                          <p className="text-gray-900 dark:text-white">
                            {BREACH_CATEGORIES.find(c => c.value === breachForm.category)?.label || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 font-medium">Risk Level</p>
                          <Badge variant={getRiskBadgeVariant(riskLevel)}>
                            {riskLevel.toUpperCase()} ({riskScore}%)
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 font-medium">Affected Data Subjects</p>
                          <p className="text-gray-900 dark:text-white">
                            {breachForm.estimatedAffected > 0
                              ? breachForm.estimatedAffected.toLocaleString()
                              : 'Under investigation'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 font-medium">Data Types</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {breachForm.dataTypes.length > 0
                              ? breachForm.dataTypes.map(dt => (
                                  <Badge key={dt} variant="outline" className="text-xs">{dt}</Badge>
                                ))
                              : <span className="text-gray-900 dark:text-white">Not specified</span>
                            }
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Affected Systems</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {breachForm.affectedSystems.length > 0
                            ? breachForm.affectedSystems.map(s => (
                                <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                              ))
                            : <span className="text-gray-900 dark:text-white">Not specified</span>
                          }
                        </div>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Reported By</p>
                        <p className="text-gray-900 dark:text-white">
                          {breachForm.reporterName} ({breachForm.reporterEmail})
                          {breachForm.reporterDepartment && ` — ${breachForm.reporterDepartment}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notification Checklist */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Notification Checklist (NDPA Section 40)
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Verify that all required information is included before submitting the notification.
                    </p>
                    <div className="space-y-3">
                      {NOTIFICATION_CHECKLIST.map((item, idx) => (
                        <Checkbox
                          key={idx}
                          label={item}
                          checked={!!checkedItems[idx]}
                          onChange={() => setCheckedItems(prev => ({ ...prev, [idx]: !prev[idx] }))}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back
                    </Button>
                    <Button onClick={() => setCurrentStep(4)}>
                      Continue to Resolution
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Resolution */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Breach Resolution</CardTitle>
              <CardDescription>
                Document the containment actions, resolution steps, and preventive measures taken
                in response to the breach.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isResolved ? (
                <div className="space-y-6">
                  {/* Resolution Status */}
                  <div>
                    <Label htmlFor="resolution-status" className="mb-2">Resolution Status</Label>
                    <Select
                      id="resolution-status"
                      value={resolution.status}
                      onChange={e => setResolution(prev => ({ ...prev, status: e.target.value as 'contained' | 'resolved' }))}
                    >
                      <option value="contained">Contained — Breach stopped, investigation ongoing</option>
                      <option value="resolved">Resolved — Fully investigated and remediated</option>
                    </Select>
                  </div>

                  {/* Actions Taken */}
                  <div>
                    <Label htmlFor="actions-taken" className="mb-2">Actions Taken *</Label>
                    <TextArea
                      id="actions-taken"
                      placeholder="Describe the containment and remediation actions taken..."
                      rows={4}
                      value={resolution.actionsTaken}
                      onChange={e => setResolution(prev => ({ ...prev, actionsTaken: e.target.value }))}
                    />
                  </div>

                  {/* Lessons Learned */}
                  <div>
                    <Label htmlFor="lessons-learned" className="mb-2">Lessons Learned</Label>
                    <TextArea
                      id="lessons-learned"
                      placeholder="What can be learned from this incident?"
                      rows={3}
                      value={resolution.lessonsLearned}
                      onChange={e => setResolution(prev => ({ ...prev, lessonsLearned: e.target.value }))}
                    />
                  </div>

                  {/* Preventive Measures */}
                  <div>
                    <Label htmlFor="preventive-measures" className="mb-2">Preventive Measures</Label>
                    <TextArea
                      id="preventive-measures"
                      placeholder="What measures will be implemented to prevent recurrence?"
                      rows={3}
                      value={resolution.preventiveMeasures}
                      onChange={e => setResolution(prev => ({ ...prev, preventiveMeasures: e.target.value }))}
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setCurrentStep(3)}>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back
                    </Button>
                    <Button onClick={handleResolve}>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Mark as {resolution.status === 'resolved' ? 'Resolved' : 'Contained'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Breach {resolution.status === 'resolved' ? 'Resolved' : 'Contained'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    This breach has been marked as {resolution.status}. All documentation has been recorded
                    and the regulatory notification process is complete.
                  </p>
                  <div className="pt-4 flex justify-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsResolved(false);
                        setCurrentStep(1);
                        setBreachForm({
                          title: '', description: '', category: '',
                          affectedSystems: [], dataTypes: [],
                          estimatedAffected: 0, reporterName: '',
                          reporterEmail: '', reporterDepartment: '',
                        });
                        setRiskScores({ confidentiality: 1, integrity: 1, availability: 1 });
                        setCheckedItems({});
                        setResolution({
                          status: 'contained', actionsTaken: '',
                          lessonsLearned: '', preventiveMeasures: '',
                        });
                      }}
                    >
                      Report Another Breach
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Breach Statistics Dashboard */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Breach Statistics</CardTitle>
          <CardDescription>
            Sample organizational breach metrics for compliance monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Total Breaches"
              value={SAMPLE_STATS.totalBreaches.toString()}
              subtext="Last 12 months"
            />
            <StatCard
              label="Avg. Resolution"
              value={`${SAMPLE_STATS.avgResolutionDays}d`}
              subtext="Mean time to resolve"
            />
            <StatCard
              label="Compliance Rate"
              value={`${SAMPLE_STATS.complianceRate}%`}
              subtext="72-hour notification"
              highlight
            />
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">By Severity</p>
              <div className="space-y-2">
                <SeverityBar label="Low" count={SAMPLE_STATS.bySeverity.low} total={SAMPLE_STATS.totalBreaches} color="bg-green-500" />
                <SeverityBar label="Medium" count={SAMPLE_STATS.bySeverity.medium} total={SAMPLE_STATS.totalBreaches} color="bg-amber-500" />
                <SeverityBar label="High" count={SAMPLE_STATS.bySeverity.high} total={SAMPLE_STATS.totalBreaches} color="bg-red-500" />
                <SeverityBar label="Critical" count={SAMPLE_STATS.bySeverity.critical} total={SAMPLE_STATS.totalBreaches} color="bg-purple-500" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NDPA Section 40 Reference */}
      <div className="p-5 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
        <div className="flex gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
              NDPA Section 40 — Notification of Personal Data Breach
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
              Under the Nigeria Data Protection Act, data controllers are required to notify the Nigeria
              Data Protection Commission (NDPC) of a personal data breach within <strong>72 hours</strong> of
              becoming aware of it. The notification must include:
            </p>
            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc pl-5">
              <li>The nature of the personal data breach including categories and approximate number of data subjects affected</li>
              <li>The name and contact details of the Data Protection Officer or other contact point</li>
              <li>A description of the likely consequences of the breach</li>
              <li>A description of the measures taken or proposed to address the breach and mitigate its effects</li>
            </ul>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-3">
              Where the breach is likely to result in a high risk to the rights and freedoms of data
              subjects, the controller must also communicate the breach to the affected data subjects
              without undue delay.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Sub-components ----------

function CountdownUnit({
  value,
  label,
  urgency,
}: {
  value: number;
  label: string;
  urgency: 'green' | 'yellow' | 'red';
}) {
  const bgColor = urgency === 'green'
    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
    : urgency === 'yellow'
      ? 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';

  return (
    <div className={`flex flex-col items-center rounded-lg px-3 py-2 ${bgColor}`}>
      <span className="text-2xl font-bold font-mono tabular-nums leading-none">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[10px] uppercase font-medium mt-1 opacity-75">{label}</span>
    </div>
  );
}

function RiskSlider({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const colors = ['bg-green-500', 'bg-yellow-500', 'bg-amber-500', 'bg-orange-500', 'bg-red-500'];
  const labels = ['Minimal', 'Low', 'Moderate', 'Significant', 'Severe'];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <Label className="font-medium">{label}</Label>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${
            value <= 2 ? 'text-green-600 dark:text-green-400' :
            value <= 3 ? 'text-amber-600 dark:text-amber-400' :
            'text-red-600 dark:text-red-400'
          }`}>
            {labels[value - 1]}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={1}
          max={5}
          value={value}
          onChange={e => onChange(parseInt(e.target.value))}
          aria-label={`${label}: ${labels[value - 1]}`}
          aria-valuemin={1}
          aria-valuemax={5}
          aria-valuenow={value}
          aria-valuetext={labels[value - 1]}
          className="w-full h-2 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-600
            [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer
            bg-gradient-to-r from-green-400 via-amber-400 to-red-500"
        />
        <span className="text-sm font-mono w-6 text-center text-gray-700 dark:text-gray-300">{value}</span>
      </div>
      <div className="flex justify-between mt-1">
        {colors.map((color, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div className={`w-2 h-2 rounded-full ${color} ${idx + 1 === value ? 'ring-2 ring-offset-1 ring-blue-500' : 'opacity-40'}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  subtext,
  highlight,
}: {
  label: string;
  value: string;
  subtext: string;
  highlight?: boolean;
}) {
  return (
    <div className={`p-4 rounded-xl border ${
      highlight
        ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
    }`}>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${
        highlight
          ? 'text-green-700 dark:text-green-400'
          : 'text-gray-900 dark:text-white'
      }`}>{value}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtext}</p>
    </div>
  );
}

function SeverityBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = Math.round((count / total) * 100);
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-14 text-gray-600 dark:text-gray-400">{label}</span>
      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-5 text-right font-mono text-gray-600 dark:text-gray-400">{count}</span>
    </div>
  );
}
