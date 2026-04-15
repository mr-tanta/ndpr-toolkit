'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ShieldCheck } from '@phosphor-icons/react';
import { DemoLayout } from '@/components/site/DemoLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
// Local types matching what the demo actually uses
type TransferMechanism = 'adequacy_decision' | 'standard_contractual_clauses' | 'binding_corporate_rules' | 'ndpc_authorization' | 'derogation' | 'other';
type TransferStatus = 'pending' | 'approved' | 'rejected' | 'under_review';
type AdequacyStatus = 'adequate' | 'inadequate' | 'pending_review' | 'unknown';

interface CrossBorderTransfer {
  id: string;
  name: string;
  description?: string;
  destinationCountry: string;
  recipientOrganisation: string;
  transferMechanism: TransferMechanism;
  dataCategories: string[];
  dataSubjects: string;
  purpose: string;
  safeguards: string[];
  status: TransferStatus;
  riskScore: number;
  createdAt: number;
  reviewDate?: number;
  notes?: string;
}
type AdequacyLevel = 'adequate' | 'conditional' | 'inadequate';

interface CountryInfo {
  name: string;
  region: string;
  adequacy: AdequacyLevel;
  flag: string;
}

const COUNTRY_DATABASE: Record<string, CountryInfo> = {
  'United Kingdom': { name: 'United Kingdom', region: 'Europe', adequacy: 'adequate', flag: '\uD83C\uDDEC\uD83C\uDDE7' },
  'Germany': { name: 'Germany', region: 'Europe', adequacy: 'adequate', flag: '\uD83C\uDDE9\uD83C\uDDEA' },
  'France': { name: 'France', region: 'Europe', adequacy: 'adequate', flag: '\uD83C\uDDEB\uD83C\uDDF7' },
  'Canada': { name: 'Canada', region: 'North America', adequacy: 'adequate', flag: '\uD83C\uDDE8\uD83C\uDDE6' },
  'United States': { name: 'United States', region: 'North America', adequacy: 'conditional', flag: '\uD83C\uDDFA\uD83C\uDDF8' },
  'South Africa': { name: 'South Africa', region: 'Africa', adequacy: 'conditional', flag: '\uD83C\uDDFF\uD83C\uDDE6' },
  'Ghana': { name: 'Ghana', region: 'Africa', adequacy: 'conditional', flag: '\uD83C\uDDEC\uD83C\uDDED' },
  'Kenya': { name: 'Kenya', region: 'Africa', adequacy: 'conditional', flag: '\uD83C\uDDF0\uD83C\uDDEA' },
  'India': { name: 'India', region: 'Asia', adequacy: 'conditional', flag: '\uD83C\uDDEE\uD83C\uDDF3' },
  'Singapore': { name: 'Singapore', region: 'Asia', adequacy: 'adequate', flag: '\uD83C\uDDF8\uD83C\uDDEC' },
  'UAE': { name: 'UAE', region: 'Middle East', adequacy: 'conditional', flag: '\uD83C\uDDE6\uD83C\uDDEA' },
  'Brazil': { name: 'Brazil', region: 'South America', adequacy: 'conditional', flag: '\uD83C\uDDE7\uD83C\uDDF7' },
  'China': { name: 'China', region: 'Asia', adequacy: 'inadequate', flag: '\uD83C\uDDE8\uD83C\uDDF3' },
  'Russia': { name: 'Russia', region: 'Europe/Asia', adequacy: 'inadequate', flag: '\uD83C\uDDF7\uD83C\uDDFA' },
};

const TRANSFER_MECHANISMS: Record<TransferMechanism, { label: string; description: string; ndpaRef: string; icon: string }> = {
  adequacy_decision: {
    label: 'Adequacy Decision',
    description:
      'The destination country has been determined by the NDPC to provide an adequate level of data protection.',
    ndpaRef: 'NDPA Section 42',
    icon: '\u2713',
  },
  standard_contractual_clauses: {
    label: 'Standard Contractual Clauses',
    description:
      'Contractual clauses approved by the NDPC providing appropriate safeguards for cross-border transfers.',
    ndpaRef: 'NDPA Section 43',
    icon: '\uD83D\uDCDC',
  },
  binding_corporate_rules: {
    label: 'Binding Corporate Rules',
    description:
      'Internal rules adopted by a group of companies for transfers within the group to entities without adequate protection.',
    ndpaRef: 'NDPA Section 43',
    icon: '\uD83C\uDFE2',
  },
  ndpc_authorization: {
    label: 'NDPC Authorization',
    description:
      'Specific authorization obtained from the Nigeria Data Protection Commission for the transfer.',
    ndpaRef: 'NDPA Section 44',
    icon: '\uD83D\uDEE1',
  },
  derogation: {
    label: 'Derogation',
    description:
      'Transfer permitted under specific derogations such as explicit consent, contractual necessity, or public interest.',
    ndpaRef: 'NDPA Section 45',
    icon: '\u26A0',
  },
  other: {
    label: 'Other Safeguard',
    description:
      'Another appropriate safeguard mechanism approved or recognized under the NDPA framework.',
    ndpaRef: 'NDPA Part VI',
    icon: '\u2699',
  },
};

const DATA_CATEGORY_OPTIONS = [
  'Basic Personal Information',
  'Contact Details',
  'Financial Information',
  'Health Data',
  'Employment Data',
  'Customer Behavioural Data',
  'Online Identifiers',
  'Communication Data',
];

const SAFEGUARD_OPTIONS = [
  'Encryption in transit',
  'Encryption at rest',
  'Access controls and authentication',
  'Data minimization applied',
  'Pseudonymization or anonymization',
  'Regular security audits',
  'Contractual obligations on recipient',
  'Data subject notification',
  'Right to withdrawal mechanism',
  'Data breach notification procedures',
];

const SAMPLE_TRANSFERS: CrossBorderTransfer[] = [
  {
    id: 'xfer-1',
    name: 'Cloud Infrastructure Hosting',
    description: 'Customer data stored on cloud servers hosted outside Nigeria for service delivery',
    destinationCountry: 'United States',
    recipientOrganisation: 'AWS Inc.',
    transferMechanism: 'standard_contractual_clauses',
    dataCategories: ['Basic Personal Information', 'Contact Details', 'Customer Behavioural Data'],
    dataSubjects: 'Platform Users',
    purpose: 'Cloud hosting and data storage for the main application platform',
    safeguards: [
      'Encryption in transit',
      'Encryption at rest',
      'Access controls and authentication',
      'Contractual obligations on recipient',
      'Regular security audits',
    ],
    status: 'approved',
    riskScore: 35,
    createdAt: Date.now() - 180 * 24 * 60 * 60 * 1000,
    reviewDate: Date.now() + 180 * 24 * 60 * 60 * 1000,
    notes: 'SCCs signed and filed. Annual review scheduled.',
  },
  {
    id: 'xfer-2',
    name: 'Payroll Processing',
    description: 'Employee payroll data shared with group HR for multi-country payroll processing',
    destinationCountry: 'United Kingdom',
    recipientOrganisation: 'Parent Company UK Ltd.',
    transferMechanism: 'binding_corporate_rules',
    dataCategories: ['Basic Personal Information', 'Financial Information', 'Employment Data'],
    dataSubjects: 'Employees',
    purpose: 'Centralized payroll processing for the corporate group',
    safeguards: [
      'Encryption in transit',
      'Access controls and authentication',
      'Contractual obligations on recipient',
      'Data minimization applied',
    ],
    status: 'approved',
    riskScore: 20,
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
    reviewDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
    notes: 'BCRs approved by NDPC. Renewal due within 30 days.',
  },
  {
    id: 'xfer-3',
    name: 'Marketing Analytics Partner',
    description: 'Sharing anonymized user analytics data with third-party marketing partner',
    destinationCountry: 'South Africa',
    recipientOrganisation: 'Analytics SA (Pty) Ltd.',
    transferMechanism: 'adequacy_decision',
    dataCategories: ['Online Identifiers', 'Customer Behavioural Data'],
    dataSubjects: 'Website Visitors',
    purpose: 'Marketing campaign analytics and performance tracking',
    safeguards: [
      'Pseudonymization or anonymization',
      'Data minimization applied',
      'Contractual obligations on recipient',
    ],
    status: 'under_review',
    riskScore: 50,
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    notes: 'Pending confirmation of NDPC adequacy determination for South Africa.',
  },
  {
    id: 'xfer-4',
    name: 'Customer Support Platform',
    description: 'Customer support tickets and interaction data stored on SaaS platform',
    destinationCountry: 'Canada',
    recipientOrganisation: 'SupportDesk Inc.',
    transferMechanism: 'standard_contractual_clauses',
    dataCategories: ['Basic Personal Information', 'Contact Details', 'Communication Data'],
    dataSubjects: 'Customers',
    purpose: 'Providing customer support and issue tracking',
    safeguards: [
      'Encryption in transit',
      'Encryption at rest',
      'Access controls and authentication',
      'Data breach notification procedures',
    ],
    status: 'approved',
    riskScore: 25,
    createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
    reviewDate: Date.now() + 270 * 24 * 60 * 60 * 1000,
    notes: 'Canada recognized as adequate jurisdiction.',
  },
];

function calculateRiskScore(safeguards: string[], country: string, mechanism: TransferMechanism): number {
  let risk = 50;
  const countryInfo = COUNTRY_DATABASE[country];
  if (countryInfo) {
    if (countryInfo.adequacy === 'adequate') risk -= 20;
    else if (countryInfo.adequacy === 'conditional') risk -= 5;
    else risk += 15;
  }
  if (mechanism === 'adequacy_decision') risk -= 10;
  if (mechanism === 'standard_contractual_clauses') risk -= 8;
  if (mechanism === 'binding_corporate_rules') risk -= 8;
  if (mechanism === 'derogation') risk += 5;
  risk -= Math.min(safeguards.length * 3, 25);
  return Math.max(0, Math.min(100, risk));
}

export default function CrossBorderDemoPage() {
  const [activeTab, setActiveTab] = useState('map');
  const [isClient, setIsClient] = useState(false);
  const [transfers, setTransfers] = useState<CrossBorderTransfer[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCountry, setFormCountry] = useState('');
  const [formRecipient, setFormRecipient] = useState('');
  const [formMechanism, setFormMechanism] = useState<TransferMechanism>('standard_contractual_clauses');
  const [formCategories, setFormCategories] = useState<string[]>([]);
  const [formSubjects, setFormSubjects] = useState('');
  const [formPurpose, setFormPurpose] = useState('');
  const [formSafeguards, setFormSafeguards] = useState<string[]>([]);
  const [formNotes, setFormNotes] = useState('');
  const [formNdpcRef, setFormNdpcRef] = useState('');
  const [formNdpcDate, setFormNdpcDate] = useState('');

  useEffect(() => {
    setIsClient(true);
    setTransfers(SAMPLE_TRANSFERS);
  }, []);

  const formRiskScore = useMemo(() => {
    if (!formCountry) return null;
    return calculateRiskScore(formSafeguards, formCountry, formMechanism);
  }, [formCountry, formSafeguards, formMechanism]);

  const handleToggleCategory = (category: string) => {
    setFormCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleToggleSafeguard = (safeguard: string) => {
    setFormSafeguards((prev) =>
      prev.includes(safeguard) ? prev.filter((s) => s !== safeguard) : [...prev, safeguard]
    );
  };

  const handleAddTransfer = () => {
    if (!formName.trim() || !formCountry.trim() || !formRecipient.trim() || !formPurpose.trim()) return;
    if (formMechanism === 'ndpc_authorization' && (!formNdpcRef.trim() || !formNdpcDate)) return;

    const ndpcNote = formMechanism === 'ndpc_authorization'
      ? `NDPC Ref: ${formNdpcRef} | Authorized: ${formNdpcDate}. ${formNotes}`
      : formNotes;

    const newTransfer: CrossBorderTransfer = {
      id: `xfer-${Date.now()}`,
      name: formName,
      description: formDescription,
      destinationCountry: formCountry,
      recipientOrganisation: formRecipient,
      transferMechanism: formMechanism,
      dataCategories: formCategories,
      dataSubjects: formSubjects,
      purpose: formPurpose,
      safeguards: formSafeguards,
      status: 'pending',
      riskScore: formRiskScore ?? 50,
      createdAt: Date.now(),
      notes: ndpcNote,
    };

    setTransfers((prev) => [newTransfer, ...prev]);
    setFormName('');
    setFormDescription('');
    setFormCountry('');
    setFormRecipient('');
    setFormMechanism('standard_contractual_clauses');
    setFormCategories([]);
    setFormSubjects('');
    setFormPurpose('');
    setFormSafeguards([]);
    setFormNotes('');
    setFormNdpcRef('');
    setFormNdpcDate('');
    setActiveTab('register');
  };

  const handleUpdateStatus = (id: string, status: TransferStatus) => {
    setTransfers((prev) =>
      prev.map((transfer) => (transfer.id === id ? { ...transfer, status } : transfer))
    );
  };

  const getStatusConfig = (status: TransferStatus) => {
    const configs: Record<TransferStatus, { variant: 'warning' | 'success' | 'danger' | 'info'; label: string }> = {
      pending: { variant: 'warning', label: 'Pending' },
      approved: { variant: 'success', label: 'Approved' },
      rejected: { variant: 'danger', label: 'Rejected' },
      under_review: { variant: 'info', label: 'Under Review' },
    };
    return configs[status];
  };

  const getAdequacyConfig = (level: AdequacyLevel) => {
    const configs: Record<AdequacyLevel, { color: string; bg: string; border: string; label: string; arrow: string }> = {
      adequate: { color: 'text-green-700 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-800', label: 'Adequate', arrow: 'bg-green-500' },
      conditional: { color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', label: 'Conditional', arrow: 'bg-amber-500' },
      inadequate: { color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-800', label: 'Inadequate', arrow: 'bg-red-500' },
    };
    return configs[level];
  };

  const getRiskColor = (score: number) => {
    if (score <= 30) return 'text-green-600';
    if (score <= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getRiskLabel = (score: number) => {
    if (score <= 30) return 'Low Risk';
    if (score <= 60) return 'Medium Risk';
    return 'High Risk';
  };

  const getRiskBg = (score: number) => {
    if (score <= 30) return 'bg-green-500';
    if (score <= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  // Group transfers by destination country
  const transfersByCountry = useMemo(() => {
    const grouped: Record<string, CrossBorderTransfer[]> = {};
    transfers.forEach((t) => {
      if (!grouped[t.destinationCountry]) grouped[t.destinationCountry] = [];
      grouped[t.destinationCountry].push(t);
    });
    return grouped;
  }, [transfers]);

  if (!isClient) {
    return (
      <DemoLayout
        title="Cross-Border Transfer Assessment"
        description="Assess, document, and manage international transfers of personal data outside Nigeria. Ensure compliance with NDPA cross-border transfer requirements."
        ndpaSection="Sections 41-45"
        code={`import { CrossBorderTransfer } from '@tantainnovative/ndpr-toolkit/cross-border';`}
      >
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      </DemoLayout>
    );
  }

  return (
    <DemoLayout
      title="Cross-Border Transfer Assessment"
      description="Assess, document, and manage international transfers of personal data outside Nigeria. Ensure compliance with NDPA cross-border transfer requirements."
      ndpaSection="Sections 41-45"
      code={`import { CrossBorderTransfer } from '@tantainnovative/ndpr-toolkit/cross-border';`}
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
            <span className="text-2xl font-bold">{transfers.length}</span>
            <span className="text-gray-500 dark:text-gray-400">Transfers</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 text-sm">
            <span className="text-2xl font-bold">{new Set(transfers.map((t) => t.destinationCountry)).size}</span>
            <span className="text-gray-500 dark:text-gray-400">Countries</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 text-sm">
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">{transfers.filter((t) => t.status === 'approved').length}</span>
            <span className="text-gray-500 dark:text-gray-400">Approved</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 text-sm">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{transfers.filter((t) => t.status === 'pending' || t.status === 'under_review').length}</span>
            <span className="text-gray-500 dark:text-gray-400">Pending</span>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="map">Transfer Map</TabsTrigger>
            <TabsTrigger value="mechanisms">Mechanisms</TabsTrigger>
            <TabsTrigger value="add">Add Transfer</TabsTrigger>
            <TabsTrigger value="register">Transfer Dashboard</TabsTrigger>
          </TabsList>

          {/* Transfer Map Tab */}
          <TabsContent value="map">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Country destination visualization */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Data Transfer Destinations</CardTitle>
                  <CardDescription>Nigeria &rarr; Destination countries with adequacy indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(transfersByCountry).map(([country, countryTransfers]) => {
                      const countryInfo = COUNTRY_DATABASE[country];
                      const adequacyConfig = countryInfo ? getAdequacyConfig(countryInfo.adequacy) : getAdequacyConfig('conditional');
                      const isSelected = selectedCountry === country;

                      return (
                        <div
                          key={country}
                          onClick={() => setSelectedCountry(isSelected ? null : country)}
                          className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${
                            isSelected
                              ? `${adequacyConfig.bg} ${adequacyConfig.border} shadow-md`
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            {/* Origin */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-lg">{'\uD83C\uDDF3\uD83C\uDDEC'}</span>
                              <span className="text-sm font-medium hidden sm:inline">Nigeria</span>
                            </div>

                            {/* Arrow */}
                            <div className="flex-1 flex items-center gap-1 min-w-0">
                              <div className={`h-0.5 flex-1 ${adequacyConfig.arrow} rounded-full opacity-60`}></div>
                              <div className={`w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] ${
                                countryInfo?.adequacy === 'adequate' ? 'border-l-green-500' :
                                countryInfo?.adequacy === 'conditional' ? 'border-l-amber-500' :
                                'border-l-red-500'
                              }`}></div>
                            </div>

                            {/* Destination */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-lg">{countryInfo?.flag || '\uD83C\uDFF3'}</span>
                              <span className="text-sm font-medium">{country}</span>
                            </div>

                            {/* Adequacy Badge */}
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${adequacyConfig.bg} ${adequacyConfig.color} ${adequacyConfig.border} border hidden sm:inline`}>
                              {adequacyConfig.label}
                            </span>

                            {/* Transfer count */}
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {countryTransfers.length} {countryTransfers.length === 1 ? 'transfer' : 'transfers'}
                            </span>
                          </div>

                          {/* Expanded details */}
                          {isSelected && (
                            <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50 space-y-2">
                              {countryTransfers.map((t) => {
                                const statusConfig = getStatusConfig(t.status);
                                return (
                                  <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-white/60 dark:bg-gray-800/40">
                                    <div>
                                      <span className="text-sm font-medium">{t.name}</span>
                                      <span className="text-xs text-gray-500 ml-2">{t.recipientOrganisation}</span>
                                    </div>
                                    <div className="flex gap-2">
                                      <span className={`text-xs font-medium ${getRiskColor(t.riskScore)}`}>
                                        {getRiskLabel(t.riskScore)}
                                      </span>
                                      <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500 font-medium">Adequacy Level:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 bg-green-500 rounded-full"></span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Adequate</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 bg-amber-500 rounded-full"></span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Conditional</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 bg-red-500 rounded-full"></span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Inadequate</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Country database */}
              <Card>
                <CardHeader>
                  <CardTitle>Country Database</CardTitle>
                  <CardDescription>Adequacy status of common destinations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1.5">
                    {Object.entries(COUNTRY_DATABASE)
                      .sort((a, b) => {
                        const order: Record<AdequacyLevel, number> = { adequate: 0, conditional: 1, inadequate: 2 };
                        return order[a[1].adequacy] - order[b[1].adequacy];
                      })
                      .map(([, info]) => {
                        const config = getAdequacyConfig(info.adequacy);
                        const hasTransfers = transfersByCountry[info.name];
                        return (
                          <div
                            key={info.name}
                            className={`flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
                              hasTransfers ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{info.flag}</span>
                              <span className={hasTransfers ? 'font-medium' : 'text-gray-600 dark:text-gray-400'}>
                                {info.name}
                              </span>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                              {config.label}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Mechanisms Tab */}
          <TabsContent value="mechanisms">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(Object.entries(TRANSFER_MECHANISMS) as [TransferMechanism, typeof TRANSFER_MECHANISMS[TransferMechanism]][]).map(
                ([key, mechanism]) => {
                  const count = transfers.filter((t) => t.transferMechanism === key).length;
                  return (
                    <Card key={key} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-lg">
                            {mechanism.icon}
                          </div>
                          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            {mechanism.ndpaRef}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm mb-2">{mechanism.label}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                          {mechanism.description}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                          <span className="text-xs text-gray-500">
                            {count} {count === 1 ? 'transfer' : 'transfers'} using this
                          </span>
                          <button
                            onClick={() => {
                              setFormMechanism(key);
                              setActiveTab('add');
                            }}
                            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Use this &rarr;
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }
              )}
            </div>
          </TabsContent>

          {/* Add Transfer Tab */}
          <TabsContent value="add">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Risk Assessment Sidebar */}
              <div className="lg:col-span-1 order-2 lg:order-1">
                <div className="sticky top-6 space-y-4">
                  {/* Risk Score */}
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-sm mb-4">Risk Assessment</h3>
                      {formRiskScore !== null ? (
                        <div className="text-center">
                          <div className="relative w-28 h-28 mx-auto mb-3">
                            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 112 112">
                              <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200 dark:text-gray-700" />
                              <circle
                                cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="8" fill="none"
                                strokeDasharray={`${(formRiskScore / 100) * 301.6} 301.6`}
                                strokeLinecap="round"
                                className={getRiskColor(formRiskScore)}
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className={`text-2xl font-bold ${getRiskColor(formRiskScore)}`}>{formRiskScore}</span>
                              <span className="text-xs text-gray-500">/100</span>
                            </div>
                          </div>
                          <span className={`text-sm font-semibold ${getRiskColor(formRiskScore)}`}>
                            {getRiskLabel(formRiskScore)}
                          </span>
                          <div className="mt-4 space-y-2 text-left text-xs">
                            <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
                              <span className="text-gray-500">Country adequacy</span>
                              <span className="font-medium">
                                {formCountry && COUNTRY_DATABASE[formCountry]
                                  ? getAdequacyConfig(COUNTRY_DATABASE[formCountry].adequacy).label
                                  : '--'}
                              </span>
                            </div>
                            <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
                              <span className="text-gray-500">Safeguards applied</span>
                              <span className="font-medium">{formSafeguards.length}/{SAFEGUARD_OPTIONS.length}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
                              <span className="text-gray-500">Mechanism</span>
                              <span className="font-medium">{TRANSFER_MECHANISMS[formMechanism].label}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-400 text-sm">
                          Select a destination country to see the risk assessment
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Selected mechanism info */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{TRANSFER_MECHANISMS[formMechanism].icon}</span>
                        <h3 className="font-semibold text-sm">{TRANSFER_MECHANISMS[formMechanism].label}</h3>
                      </div>
                      <p className="text-xs text-gray-500 font-mono mb-2">{TRANSFER_MECHANISMS[formMechanism].ndpaRef}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {TRANSFER_MECHANISMS[formMechanism].description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Form */}
              <Card className="lg:col-span-2 order-1 lg:order-2">
                <CardHeader>
                  <CardTitle>Add Cross-Border Transfer</CardTitle>
                  <CardDescription>
                    Document a new international data transfer and assess compliance under NDPA Part VI.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="cb-transfer-name" className="block text-sm font-medium mb-1.5">Transfer Name *</label>
                        <input
                          id="cb-transfer-name"
                          type="text"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder="e.g., Cloud Data Hosting"
                          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        />
                      </div>
                      <div>
                        <label htmlFor="cb-dest-country" className="block text-sm font-medium mb-1.5">Destination Country *</label>
                        <select
                          id="cb-dest-country"
                          value={formCountry}
                          onChange={(e) => setFormCountry(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        >
                          <option value="">Select a country</option>
                          {Object.keys(COUNTRY_DATABASE).map((country) => (
                            <option key={country} value={country}>
                              {COUNTRY_DATABASE[country].flag} {country}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="cb-description" className="block text-sm font-medium mb-1.5">Description</label>
                      <textarea
                        id="cb-description"
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Describe the nature and context of the transfer"
                        rows={2}
                        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="cb-recipient" className="block text-sm font-medium mb-1.5">Recipient Organisation *</label>
                        <input
                          id="cb-recipient"
                          type="text"
                          value={formRecipient}
                          onChange={(e) => setFormRecipient(e.target.value)}
                          placeholder="e.g., Partner Corp. Ltd."
                          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        />
                      </div>
                      <div>
                        <label htmlFor="cb-subjects" className="block text-sm font-medium mb-1.5">Data Subjects</label>
                        <input
                          id="cb-subjects"
                          type="text"
                          value={formSubjects}
                          onChange={(e) => setFormSubjects(e.target.value)}
                          placeholder="e.g., Customers, Employees"
                          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="cb-purpose" className="block text-sm font-medium mb-1.5">Purpose of Transfer *</label>
                      <textarea
                        id="cb-purpose"
                        value={formPurpose}
                        onChange={(e) => setFormPurpose(e.target.value)}
                        placeholder="Describe the purpose of this cross-border data transfer"
                        rows={2}
                        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Transfer Mechanism *</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {(Object.entries(TRANSFER_MECHANISMS) as [TransferMechanism, typeof TRANSFER_MECHANISMS[TransferMechanism]][]).map(
                          ([key, mechanism]) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setFormMechanism(key)}
                              className={`p-3 rounded-lg border-2 text-left transition-all ${
                                formMechanism === key
                                  ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 shadow-md'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                              }`}
                            >
                              <span className="text-base block mb-1">{mechanism.icon}</span>
                              <div className={`text-xs font-medium ${formMechanism === key ? 'text-blue-700 dark:text-blue-300' : ''}`}>
                                {mechanism.label}
                              </div>
                              <div className="text-[10px] text-gray-400 mt-0.5">{mechanism.ndpaRef}</div>
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
                            <input type="checkbox" checked={formCategories.includes(category)} onChange={() => handleToggleCategory(category)} className="rounded text-blue-600" />
                            {category}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Safeguards in Place</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {SAFEGUARD_OPTIONS.map((safeguard) => (
                          <label
                            key={safeguard}
                            className={`flex items-center gap-2 text-sm cursor-pointer p-2 rounded-lg border transition-colors ${
                              formSafeguards.includes(safeguard)
                                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                                : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50'
                            }`}
                          >
                            <input type="checkbox" checked={formSafeguards.includes(safeguard)} onChange={() => handleToggleSafeguard(safeguard)} className="rounded text-green-600" />
                            {safeguard}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* NDPC Authorization fields — shown only when mechanism is ndpc_authorization */}
                    {formMechanism === 'ndpc_authorization' && (
                      <div className="rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-4 space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                          <ShieldCheck size={18} weight="duotone" className="text-blue-500" />
                          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200">NDPC Authorization Details</h4>
                        </div>
                        <p className="text-xs text-blue-700 dark:text-blue-400">
                          When relying on NDPC Authorization (NDPA Section 44), you must provide the authorization reference and date issued by the Nigeria Data Protection Commission.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="cb-ndpc-ref" className="block text-sm font-medium mb-1.5">NDPC Reference Number *</label>
                            <input
                              id="cb-ndpc-ref"
                              type="text"
                              value={formNdpcRef}
                              onChange={(e) => setFormNdpcRef(e.target.value)}
                              placeholder="e.g., NDPC/AUTH/2025/0042"
                              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                            />
                          </div>
                          <div>
                            <label htmlFor="cb-ndpc-date" className="block text-sm font-medium mb-1.5">Authorization Date *</label>
                            <input
                              id="cb-ndpc-date"
                              type="date"
                              value={formNdpcDate}
                              onChange={(e) => setFormNdpcDate(e.target.value)}
                              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label htmlFor="cb-notes" className="block text-sm font-medium mb-1.5">Additional Notes</label>
                      <textarea
                        id="cb-notes"
                        value={formNotes}
                        onChange={(e) => setFormNotes(e.target.value)}
                        placeholder="Any additional notes or context for this transfer"
                        rows={2}
                        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                      />
                    </div>

                    <Button
                      onClick={handleAddTransfer}
                      disabled={
                        !formName.trim() ||
                        !formCountry.trim() ||
                        !formRecipient.trim() ||
                        !formPurpose.trim() ||
                        (formMechanism === 'ndpc_authorization' && (!formNdpcRef.trim() || !formNdpcDate))
                      }
                      className="w-full md:w-auto"
                    >
                      Add Transfer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Transfer Dashboard Tab */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Transfer Dashboard</CardTitle>
                <CardDescription>All documented cross-border data transfers and their current status.</CardDescription>
              </CardHeader>
              <CardContent>
                {transfers.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    No transfers recorded yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transfers.map((transfer) => {
                      const countryInfo = COUNTRY_DATABASE[transfer.destinationCountry];
                      const adequacyConfig = countryInfo ? getAdequacyConfig(countryInfo.adequacy) : null;
                      const statusConfig = getStatusConfig(transfer.status);

                      return (
                        <div key={transfer.id} className="border rounded-xl p-5 hover:shadow-sm transition-shadow">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                            <div>
                              <h4 className="font-semibold text-base">{transfer.name}</h4>
                              <p className="text-sm text-gray-500 mt-0.5">{transfer.description}</p>
                            </div>
                            <div className="flex flex-wrap gap-2 flex-shrink-0">
                              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                              <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${getRiskBg(transfer.riskScore)} text-white`}>
                                Risk: {transfer.riskScore}/100
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                              <span className="block text-xs text-gray-500 mb-0.5">Destination</span>
                              <span className="font-medium flex items-center gap-1">
                                {countryInfo?.flag} {transfer.destinationCountry}
                              </span>
                              {adequacyConfig && (
                                <span className={`text-xs ${adequacyConfig.color}`}>{adequacyConfig.label}</span>
                              )}
                            </div>
                            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                              <span className="block text-xs text-gray-500 mb-0.5">Recipient</span>
                              <span className="font-medium">{transfer.recipientOrganisation}</span>
                            </div>
                            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                              <span className="block text-xs text-gray-500 mb-0.5">Mechanism</span>
                              <span className="font-medium text-xs">{TRANSFER_MECHANISMS[transfer.transferMechanism].label}</span>
                            </div>
                            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                              <span className="block text-xs text-gray-500 mb-0.5">Safeguards</span>
                              <span className="font-medium">{transfer.safeguards.length} applied</span>
                            </div>
                          </div>

                          {transfer.safeguards.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {transfer.safeguards.map((s) => (
                                <span key={s} className="px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs rounded-full">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            <div className="flex gap-2">
                              {transfer.status !== 'approved' && (
                                <button onClick={() => handleUpdateStatus(transfer.id, 'approved')} className="text-xs px-3 py-1.5 rounded-lg border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300 transition-colors">
                                  Approve
                                </button>
                              )}
                              {transfer.status !== 'under_review' && (
                                <button onClick={() => handleUpdateStatus(transfer.id, 'under_review')} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                  Review
                                </button>
                              )}
                              {transfer.status !== 'rejected' && (
                                <button onClick={() => handleUpdateStatus(transfer.id, 'rejected')} className="text-xs px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300 transition-colors">
                                  Reject
                                </button>
                              )}
                            </div>
                            {transfer.reviewDate && (
                              <span className="text-xs text-gray-400 ml-auto">
                                Next review: {new Date(transfer.reviewDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
                Cross-border data transfer management is governed by <strong>NDPA Part VI (Sections 41-45)</strong>.
                Data controllers must ensure that personal data transferred outside Nigeria receives an adequate level
                of protection. The <strong>Nigeria Data Protection Commission (NDPC)</strong> has authority to issue
                adequacy decisions, approve transfer mechanisms, and authorize specific transfers.
              </p>
              <Link
                href="/docs/components/cross-border-transfers"
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
