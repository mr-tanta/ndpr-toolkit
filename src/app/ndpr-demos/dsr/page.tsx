'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TextArea } from '@/components/ui/TextArea';
import { Label } from '@/components/ui/label';
import type { DSRRequest, DSRStatus, DSRType } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

interface RightDefinition {
  id: DSRType;
  name: string;
  section: string;
  icon: string;
  description: string;
}

const RIGHTS: RightDefinition[] = [
  {
    id: 'information',
    name: 'Right to be Informed',
    section: 'Section 29',
    icon: '\u{1F4CB}',
    description: 'Know what personal data is collected and how it is processed.',
  },
  {
    id: 'access',
    name: 'Right of Access',
    section: 'Section 30',
    icon: '\u{1F50D}',
    description: 'Obtain a copy of your personal data held by a controller.',
  },
  {
    id: 'rectification',
    name: 'Right to Rectification',
    section: 'Section 31',
    icon: '\u{270F}\u{FE0F}',
    description: 'Correct inaccurate or incomplete personal data.',
  },
  {
    id: 'erasure',
    name: 'Right to Erasure',
    section: 'Section 32',
    icon: '\u{1F5D1}\u{FE0F}',
    description: 'Request deletion of personal data when no longer necessary.',
  },
  {
    id: 'restriction',
    name: 'Right to Restriction',
    section: 'Section 33',
    icon: '\u{1F6D1}',
    description: 'Restrict processing of personal data in certain circumstances.',
  },
  {
    id: 'portability',
    name: 'Right to Data Portability',
    section: 'Section 34',
    icon: '\u{1F4E6}',
    description: 'Receive personal data in a structured, machine-readable format.',
  },
  {
    id: 'objection',
    name: 'Right to Object',
    section: 'Section 35',
    icon: '\u{270B}',
    description: 'Object to the processing of personal data for specific purposes.',
  },
  {
    id: 'automated_decision_making',
    name: 'Automated Decision-Making',
    section: 'Section 36',
    icon: '\u{1F916}',
    description: 'Not be subject to decisions based solely on automated processing.',
  },
];

const STATUS_CONFIG: Record<DSRStatus, { label: string; variant: 'warning' | 'info' | 'success' | 'danger'; dotClass: string }> = {
  pending: { label: 'Pending', variant: 'warning', dotClass: 'bg-amber-500' },
  'in-progress': { label: 'In Progress', variant: 'info', dotClass: 'bg-blue-500' },
  completed: { label: 'Completed', variant: 'success', dotClass: 'bg-green-500' },
  rejected: { label: 'Rejected', variant: 'danger', dotClass: 'bg-red-500' },
};

const COMPLIANCE_DAYS = 30;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function daysRemaining(dueDate: number): number {
  return Math.ceil((dueDate - Date.now()) / (1000 * 60 * 60 * 24));
}

function daysElapsed(createdAt: number): number {
  return Math.floor((Date.now() - createdAt) / (1000 * 60 * 60 * 24));
}

function progressPercent(createdAt: number, dueDate: number): number {
  const total = dueDate - createdAt;
  if (total <= 0) return 100;
  const elapsed = Date.now() - createdAt;
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}

function shortId(id: string): string {
  return `DSR-${id.slice(0, 8).toUpperCase()}`;
}

function rightLabel(type: DSRType): string {
  const r = RIGHTS.find((r) => r.id === type);
  return r ? r.name : type;
}

// ---------------------------------------------------------------------------
// Timeline step definition
// ---------------------------------------------------------------------------

interface TimelineStep {
  label: string;
  timestamp: number | null;
  note: string;
  active: boolean;
  completed: boolean;
}

function buildTimeline(req: DSRRequest): TimelineStep[] {
  const steps: TimelineStep[] = [
    {
      label: 'Submitted',
      timestamp: req.createdAt,
      note: `Request submitted by ${req.subject.name}`,
      active: req.status === 'pending',
      completed: true,
    },
    {
      label: 'Identity Verification',
      timestamp: req.status !== 'pending' ? req.createdAt + 1 * 24 * 60 * 60 * 1000 : null,
      note: req.status === 'pending' ? 'Awaiting verification' : 'Identity verified via email confirmation',
      active: req.status === 'pending',
      completed: req.status !== 'pending',
    },
    {
      label: 'In Progress',
      timestamp: req.status === 'in-progress' || req.status === 'completed' ? req.updatedAt : null,
      note:
        req.status === 'in-progress'
          ? 'Request is being processed'
          : req.status === 'completed'
            ? 'Processing completed'
            : 'Waiting for previous steps',
      active: req.status === 'in-progress',
      completed: req.status === 'completed',
    },
    {
      label: 'Completed',
      timestamp: req.completedAt ?? null,
      note: req.status === 'completed' ? 'Request fulfilled and response sent' : 'Pending completion',
      active: false,
      completed: req.status === 'completed',
    },
  ];
  return steps;
}

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

function createSampleRequests(): DSRRequest[] {
  return [
    {
      id: uuidv4(),
      type: 'access',
      status: 'pending',
      createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
      dueDate: Date.now() + 27 * 24 * 60 * 60 * 1000,
      subject: { name: 'Adebayo Ogunlesi', email: 'adebayo@example.com', phone: '08012345678' },
      description: 'I want to access all my personal data stored in your systems.',
    },
    {
      id: uuidv4(),
      type: 'erasure',
      status: 'in-progress',
      createdAt: Date.now() - 12 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
      dueDate: Date.now() + 18 * 24 * 60 * 60 * 1000,
      subject: { name: 'Funke Adeyemi', email: 'funke@example.com' },
      description: 'Please delete all my personal data from your systems immediately.',
    },
    {
      id: uuidv4(),
      type: 'rectification',
      status: 'completed',
      createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
      completedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
      dueDate: Date.now() - 2 * 24 * 60 * 60 * 1000,
      subject: { name: 'Chidi Eze', email: 'chidi@example.com' },
      description: 'My phone number and address are outdated. Please update to +234 801 555 1234 and 15 Marina Street, Lagos.',
    },
    {
      id: uuidv4(),
      type: 'restriction',
      status: 'pending',
      createdAt: Date.now() - 25 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 25 * 24 * 60 * 60 * 1000,
      dueDate: Date.now() + 5 * 24 * 60 * 60 * 1000,
      subject: { name: 'Ngozi Okonkwo', email: 'ngozi@example.com', phone: '08098765432' },
      description: 'I want to restrict processing of my data for marketing purposes while I contest its accuracy.',
    },
    {
      id: uuidv4(),
      type: 'information',
      status: 'pending',
      createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
      dueDate: Date.now() + 28 * 24 * 60 * 60 * 1000,
      subject: { name: 'David Okafor', email: 'david@example.com' },
      description: 'I would like to know what personal data categories you process about me and the legal basis for processing.',
    },
    {
      id: uuidv4(),
      type: 'automated_decision_making',
      status: 'in-progress',
      createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
      dueDate: Date.now() + 23 * 24 * 60 * 60 * 1000,
      subject: { name: 'Grace Adeyemi', email: 'grace@example.com', phone: '08011223344' },
      description: 'I request human review of the automated decision regarding my loan application, per NDPA Section 36.',
    },
    {
      id: uuidv4(),
      type: 'portability',
      status: 'completed',
      createdAt: Date.now() - 18 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
      completedAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
      dueDate: Date.now() + 12 * 24 * 60 * 60 * 1000,
      subject: { name: 'Emeka Nwankwo', email: 'emeka@example.com' },
      description: 'I need all my data exported in JSON format so I can transfer to another provider.',
    },
    {
      id: uuidv4(),
      type: 'objection',
      status: 'rejected',
      createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
      dueDate: Date.now() + 16 * 24 * 60 * 60 * 1000,
      subject: { name: 'Amina Bello', email: 'amina@example.com' },
      description: 'I object to the processing of my data for profiling purposes.',
    },
  ];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DSRDemoPage() {
  const [isClient, setIsClient] = useState(false);
  const [requests, setRequests] = useState<DSRRequest[]>([]);

  // Form state
  const [formType, setFormType] = useState<DSRType>('access');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDragActive, setFormDragActive] = useState(false);
  const [formFiles, setFormFiles] = useState<string[]>([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [lastSubmittedId, setLastSubmittedId] = useState('');

  // Tracker state
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  // Refs
  const formRef = useRef<HTMLDivElement>(null);
  const trackerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    setRequests(createSampleRequests());
  }, []);

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  const scrollToForm = useCallback((type: DSRType) => {
    setFormType(type);
    setFormSubmitted(false);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = uuidv4();
    const newReq: DSRRequest = {
      id,
      type: formType,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      dueDate: Date.now() + COMPLIANCE_DAYS * 24 * 60 * 60 * 1000,
      subject: { name: formName, email: formEmail },
      description: formDescription || 'No description provided.',
    };
    setRequests((prev) => [newReq, ...prev]);
    setLastSubmittedId(id);
    setFormSubmitted(true);
    setFormName('');
    setFormEmail('');
    setFormDescription('');
    setFormFiles([]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setFormDragActive(true);
    if (e.type === 'dragleave') setFormDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFormDragActive(false);
    const files = Array.from(e.dataTransfer.files).map((f) => f.name);
    setFormFiles((prev) => [...prev, ...files]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).map((f) => f.name);
      setFormFiles((prev) => [...prev, ...files]);
    }
  };

  const handleUpdateStatus = (requestId: string, status: DSRStatus) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status, updatedAt: Date.now(), ...(status === 'completed' ? { completedAt: Date.now() } : {}) }
          : r
      )
    );
  };

  // -----------------------------------------------------------------------
  // Filtered requests
  // -----------------------------------------------------------------------

  const filteredRequests = requests.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (filterType !== 'all' && r.type !== filterType) return false;
    return true;
  });

  const selectedRequest = selectedRequestId ? requests.find((r) => r.id === selectedRequestId) ?? null : null;

  // -----------------------------------------------------------------------
  // Stats
  // -----------------------------------------------------------------------

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    inProgress: requests.filter((r) => r.status === 'in-progress').length,
    completed: requests.filter((r) => r.status === 'completed').length,
    overdue: requests.filter((r) => r.status !== 'completed' && r.status !== 'rejected' && daysRemaining(r.dueDate) < 0).length,
  };

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* ================================================================ */}
      {/* HERO                                                             */}
      {/* ================================================================ */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 dark:from-blue-800 dark:via-blue-900 dark:to-blue-950 text-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <Link
            href="/ndpr-demos"
            className="inline-flex items-center gap-1.5 text-blue-100 hover:text-white text-sm mb-6 transition-colors"
          >
            <span aria-hidden="true">&larr;</span> Back to NDPA Demos
          </Link>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">Data Subject Rights</h1>
          <p className="mt-3 text-blue-100 text-lg md:text-xl max-w-2xl">
            NDPA Part IV &mdash; Sections 29&ndash;36
          </p>
          <p className="mt-4 text-blue-200 max-w-3xl text-sm md:text-base leading-relaxed">
            Exercise and manage the eight fundamental rights granted to data subjects under the Nigeria Data Protection Act.
            Submit requests, track their progress, and ensure compliance within the statutory 30-day window.
          </p>

          {/* Quick stat pills */}
          <div className="flex flex-wrap gap-3 mt-8">
            <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> {stats.pending} Pending
            </span>
            <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-400" /> {stats.inProgress} In Progress
            </span>
            <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-green-400" /> {stats.completed} Completed
            </span>
            {stats.overdue > 0 && (
              <span className="inline-flex items-center gap-2 bg-red-500/30 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-red-400" /> {stats.overdue} Overdue
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 space-y-14">
        {/* ================================================================ */}
        {/* RIGHTS OVERVIEW GRID                                            */}
        {/* ================================================================ */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Your Rights Under the NDPA</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl">
            The Nigeria Data Protection Act grants data subjects eight core rights. Select any right below to submit a request.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {RIGHTS.map((right) => (
              <Card
                key={right.id}
                className="group hover:shadow-md transition-shadow duration-200 cursor-pointer border-gray-200 dark:border-gray-700"
              >
                <CardContent className="pt-6">
                  <div className="text-3xl mb-3">{right.icon}</div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 leading-snug">{right.name}</h3>
                  <p className="text-xs text-blue-700 dark:text-blue-400 font-medium mt-1">{right.section}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">{right.description}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full group-hover:bg-blue-50 group-hover:border-blue-300 group-hover:text-blue-700 dark:group-hover:bg-blue-950 dark:group-hover:border-blue-700 dark:group-hover:text-blue-300 transition-colors"
                    onClick={() => scrollToForm(right.id)}
                  >
                    Try it
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ================================================================ */}
        {/* REQUEST SUBMISSION FORM                                         */}
        {/* ================================================================ */}
        <section ref={formRef}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Submit a Request</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl">
            Fill out the form below to exercise your data subject rights. All requests are tracked against a 30-day compliance deadline.
          </p>

          {formSubmitted ? (
            /* ---- Success state ---- */
            <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/30">
              <CardContent className="py-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 text-3xl mb-4">
                  {'\u2713'}
                </div>
                <h3 className="text-xl font-semibold text-green-800 dark:text-green-200">Request Submitted Successfully</h3>
                <p className="text-green-700 dark:text-green-300 mt-2">Your request has been registered and is being processed.</p>
                <div className="mt-6 inline-block bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 rounded-lg px-6 py-4 text-left">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Request ID</span>
                    <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">{shortId(lastSubmittedId)}</span>
                    <span className="text-gray-500 dark:text-gray-400">Type</span>
                    <span className="text-gray-900 dark:text-gray-100">{rightLabel(formType)}</span>
                    <span className="text-gray-500 dark:text-gray-400">Status</span>
                    <Badge variant="warning">Pending</Badge>
                    <span className="text-gray-500 dark:text-gray-400">Due Date</span>
                    <span className="text-gray-900 dark:text-gray-100">{formatDate(Date.now() + COMPLIANCE_DAYS * 24 * 60 * 60 * 1000)}</span>
                  </div>
                </div>
                <div className="mt-6 flex justify-center gap-3">
                  <Button variant="outline" onClick={() => setFormSubmitted(false)}>
                    Submit Another
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedRequestId(lastSubmittedId);
                      trackerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    Track Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* ---- Form ---- */
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Right type selector */}
                  <div className="space-y-3">
                    <Label htmlFor="rightType" className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      Right Type
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {RIGHTS.map((right) => (
                        <button
                          key={right.id}
                          type="button"
                          onClick={() => setFormType(right.id)}
                          className={`
                            flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left text-sm transition-all duration-150
                            ${
                              formType === right.id
                                ? 'border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-600 dark:ring-blue-500/30'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-750'
                            }
                          `}
                        >
                          <span className="text-lg flex-shrink-0">{right.icon}</span>
                          <span className="truncate font-medium">{right.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Data subject details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subjectName">Full Name *</Label>
                      <Input
                        id="subjectName"
                        placeholder="e.g. Adebayo Ogunlesi"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subjectEmail">Email Address *</Label>
                      <Input
                        id="subjectEmail"
                        type="email"
                        placeholder="e.g. adebayo@example.com"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <TextArea
                      id="description"
                      rows={4}
                      placeholder="Describe your request in detail..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                    />
                  </div>

                  {/* File drop zone */}
                  <div className="space-y-2">
                    <Label>Supporting Documents</Label>
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`
                        relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 transition-colors
                        ${
                          formDragActive
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }
                      `}
                    >
                      <div className="text-3xl text-gray-400 mb-2">{'\u{1F4CE}'}</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                        <span className="font-medium text-blue-600 dark:text-blue-400 cursor-pointer">Click to upload</span> or drag and
                        drop
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PDF, DOC, PNG, JPG up to 10MB</p>
                      <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        multiple
                        onChange={handleFileInput}
                      />
                    </div>
                    {formFiles.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formFiles.map((f, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-md px-2.5 py-1 text-xs text-gray-700 dark:text-gray-300"
                          >
                            {'\u{1F4C4}'} {f}
                            <button
                              type="button"
                              onClick={() => setFormFiles((prev) => prev.filter((_, idx) => idx !== i))}
                              className="ml-1 text-gray-400 hover:text-red-500"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button type="submit" size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                    Submit Request
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </section>

        {/* ================================================================ */}
        {/* REQUEST TRACKER                                                 */}
        {/* ================================================================ */}
        <section ref={trackerRef}>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Request Tracker</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-40">
                <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </Select>
              </div>
              <div className="w-full sm:w-48">
                <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="all">All Types</option>
                  {RIGHTS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {/* Request list */}
          <div className="space-y-3">
            {filteredRequests.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center text-gray-500 dark:text-gray-400">
                  No requests match the selected filters.
                </CardContent>
              </Card>
            )}
            {filteredRequests.map((req) => {
              const days = daysRemaining(req.dueDate);
              const elapsed = daysElapsed(req.createdAt);
              const progress = progressPercent(req.createdAt, req.dueDate);
              const isOverdue = days < 0 && req.status !== 'completed' && req.status !== 'rejected';
              const isExpanded = expandedId === req.id;
              const cfg = STATUS_CONFIG[req.status];

              return (
                <Card
                  key={req.id}
                  className={`transition-all duration-200 ${
                    isOverdue ? 'border-red-300 dark:border-red-800' : 'border-gray-200 dark:border-gray-700'
                  } ${isExpanded ? 'ring-2 ring-blue-500/20' : ''}`}
                >
                  {/* Main row */}
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => setExpandedId(isExpanded ? null : req.id)}
                  >
                    <CardContent className="py-4">
                      <div className="flex flex-col md:flex-row md:items-center gap-3">
                        {/* ID & type */}
                        <div className="flex items-center gap-3 min-w-0 md:w-60">
                          <span className="text-2xl flex-shrink-0">{RIGHTS.find((r) => r.id === req.type)?.icon}</span>
                          <div className="min-w-0">
                            <p className="font-mono text-xs text-gray-500 dark:text-gray-400">{shortId(req.id)}</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{rightLabel(req.type)}</p>
                          </div>
                        </div>

                        {/* Subject */}
                        <div className="min-w-0 md:flex-1">
                          <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{req.subject.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{req.subject.email}</p>
                        </div>

                        {/* Status badge */}
                        <div className="flex items-center gap-3 md:w-28">
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        </div>

                        {/* Dates */}
                        <div className="text-xs text-gray-500 dark:text-gray-400 md:w-36 space-y-0.5">
                          <p>Submitted: {formatDate(req.createdAt)}</p>
                          <p>Due: {formatDate(req.dueDate)}</p>
                        </div>

                        {/* Progress bar */}
                        <div className="md:w-40">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className={isOverdue ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}>
                              {req.status === 'completed'
                                ? 'Done'
                                : req.status === 'rejected'
                                  ? 'Closed'
                                  : isOverdue
                                    ? `${Math.abs(days)}d overdue`
                                    : `${days}d remaining`}
                            </span>
                            <span className="text-gray-400 dark:text-gray-500">
                              {elapsed}/{COMPLIANCE_DAYS}d
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                req.status === 'completed'
                                  ? 'bg-green-500'
                                  : req.status === 'rejected'
                                    ? 'bg-gray-400'
                                    : isOverdue
                                      ? 'bg-red-500'
                                      : progress > 70
                                        ? 'bg-amber-500'
                                        : 'bg-blue-500'
                              }`}
                              style={{ width: `${req.status === 'completed' || req.status === 'rejected' ? 100 : progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Expand indicator */}
                        <span
                          className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                          aria-hidden="true"
                        >
                          &#9660;
                        </span>
                      </div>
                    </CardContent>
                  </button>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 dark:border-gray-800">
                      <CardContent className="py-5 space-y-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{req.description}</p>

                        {/* Action buttons */}
                        {req.status !== 'completed' && req.status !== 'rejected' && (
                          <div className="flex flex-wrap gap-2">
                            {req.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus(req.id, 'in-progress');
                                }}
                              >
                                Start Processing
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(req.id, 'completed');
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Mark Complete
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(req.id, 'rejected');
                              }}
                              className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRequestId(req.id);
                              }}
                            >
                              View Timeline
                            </Button>
                          </div>
                        )}
                        {(req.status === 'completed' || req.status === 'rejected') && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRequestId(req.id);
                            }}
                          >
                            View Timeline
                          </Button>
                        )}
                      </CardContent>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </section>

        {/* ================================================================ */}
        {/* TIMELINE + COMPLIANCE METER                                     */}
        {/* ================================================================ */}
        {selectedRequest && (
          <section className="scroll-mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Timeline */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <span className="text-xl">{RIGHTS.find((r) => r.id === selectedRequest.type)?.icon}</span>
                      Timeline &mdash; {shortId(selectedRequest.id)}
                    </CardTitle>
                    <CardDescription>
                      {rightLabel(selectedRequest.type)} for {selectedRequest.subject.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative pl-8">
                      {/* Vertical line */}
                      <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700" />

                      {buildTimeline(selectedRequest).map((step, i) => (
                        <div key={i} className="relative pb-8 last:pb-0">
                          {/* Dot */}
                          <div
                            className={`absolute -left-5 top-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 ${
                              step.completed
                                ? 'bg-blue-500'
                                : step.active
                                  ? 'bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-900'
                                  : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          />

                          <div>
                            <div className="flex items-center gap-2">
                              <h4
                                className={`font-semibold text-sm ${
                                  step.completed
                                    ? 'text-blue-700 dark:text-blue-400'
                                    : step.active
                                      ? 'text-blue-700 dark:text-blue-400'
                                      : 'text-gray-400 dark:text-gray-500'
                                }`}
                              >
                                {step.label}
                              </h4>
                              {step.completed && (
                                <span className="text-xs text-blue-600 dark:text-blue-500 font-medium">{'\u2713'}</span>
                              )}
                              {step.active && (
                                <span className="inline-flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                              )}
                            </div>
                            {step.timestamp && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatDate(step.timestamp)}</p>
                            )}
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{step.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 30-day compliance meter */}
              <div>
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle>30-Day Compliance</CardTitle>
                    <CardDescription>Statutory response window</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const days = daysRemaining(selectedRequest.dueDate);
                      const elapsed = daysElapsed(selectedRequest.createdAt);
                      const pct = progressPercent(selectedRequest.createdAt, selectedRequest.dueDate);
                      const isOverdue = days < 0 && selectedRequest.status !== 'completed' && selectedRequest.status !== 'rejected';
                      const isDone = selectedRequest.status === 'completed' || selectedRequest.status === 'rejected';

                      return (
                        <div className="space-y-6">
                          {/* Circular meter */}
                          <div className="flex justify-center">
                            <div className="relative w-40 h-40">
                              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="42"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="8"
                                  className="text-gray-100 dark:text-gray-800"
                                />
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="42"
                                  fill="none"
                                  strokeWidth="8"
                                  strokeLinecap="round"
                                  strokeDasharray={`${2 * Math.PI * 42}`}
                                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - (isDone ? 1 : pct / 100))}`}
                                  className={`transition-all duration-1000 ${
                                    isDone
                                      ? 'text-green-500'
                                      : isOverdue
                                        ? 'text-red-500'
                                        : pct > 70
                                          ? 'text-amber-500'
                                          : 'text-blue-500'
                                  }`}
                                  stroke="currentColor"
                                />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span
                                  className={`text-3xl font-bold ${
                                    isDone
                                      ? 'text-green-600 dark:text-green-400'
                                      : isOverdue
                                        ? 'text-red-600 dark:text-red-400'
                                        : 'text-gray-900 dark:text-gray-100'
                                  }`}
                                >
                                  {isDone ? '\u2713' : isOverdue ? Math.abs(days) : days}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  {isDone ? 'Complete' : isOverdue ? 'days overdue' : 'days left'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">Submitted</span>
                              <span className="text-gray-900 dark:text-gray-100 font-medium">{formatDate(selectedRequest.createdAt)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">Due Date</span>
                              <span className={`font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
                                {formatDate(selectedRequest.dueDate)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">Days Elapsed</span>
                              <span className="text-gray-900 dark:text-gray-100 font-medium">
                                {elapsed} of {COMPLIANCE_DAYS}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">Status</span>
                              <Badge variant={STATUS_CONFIG[selectedRequest.status].variant}>
                                {STATUS_CONFIG[selectedRequest.status].label}
                              </Badge>
                            </div>
                            {selectedRequest.completedAt && (
                              <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Completed</span>
                                <span className="text-green-600 dark:text-green-400 font-medium">{formatDate(selectedRequest.completedAt)}</span>
                              </div>
                            )}
                          </div>

                          {/* Warning */}
                          {isOverdue && (
                            <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
                              <p className="font-semibold">Compliance Deadline Exceeded</p>
                              <p className="mt-1">This request is {Math.abs(days)} day{Math.abs(days) !== 1 ? 's' : ''} past the NDPA 30-day statutory deadline. Immediate action required.</p>
                            </div>
                          )}
                          {!isDone && !isOverdue && days <= 5 && (
                            <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-700 dark:text-amber-300">
                              <p className="font-semibold">Deadline Approaching</p>
                              <p className="mt-1">Only {days} day{days !== 1 ? 's' : ''} remaining to comply with the NDPA deadline.</p>
                            </div>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            onClick={() => setSelectedRequestId(null)}
                          >
                            Close
                          </Button>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* ================================================================ */}
        {/* FOOTER NOTES                                                    */}
        {/* ================================================================ */}
        <section className="border-t border-gray-200 dark:border-gray-800 pt-8">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">About This Demo</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              This interactive demo showcases the Data Subject Rights management components from the NDPR Toolkit.
              All data is generated in-browser for demonstration purposes only &mdash; no actual personal data is
              collected or transmitted.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="space-y-1">
                <p className="font-medium text-gray-700 dark:text-gray-300">Request Submission</p>
                <p className="text-gray-500 dark:text-gray-400">Submit DSR requests with type selection, subject details, and file attachments.</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-gray-700 dark:text-gray-300">Request Tracking</p>
                <p className="text-gray-500 dark:text-gray-400">Filter, expand, and manage requests with status updates and deadline monitoring.</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-gray-700 dark:text-gray-300">Compliance Timeline</p>
                <p className="text-gray-500 dark:text-gray-400">Track the full lifecycle with a 30-day compliance meter per NDPA requirements.</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              For detailed documentation, see the{' '}
              <Link href="/docs/components/data-subject-rights" className="text-blue-600 hover:underline dark:text-blue-400">
                DSR documentation
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
