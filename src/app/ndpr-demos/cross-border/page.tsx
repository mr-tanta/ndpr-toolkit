'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

type TransferMechanism =
  | 'adequacy_decision'
  | 'standard_contractual_clauses'
  | 'binding_corporate_rules'
  | 'ndpc_authorization'
  | 'derogation'
  | 'other';

type TransferStatus = 'pending' | 'approved' | 'rejected' | 'under_review';

interface CrossBorderTransfer {
  id: string;
  name: string;
  description: string;
  destinationCountry: string;
  recipientOrganisation: string;
  transferMechanism: TransferMechanism;
  dataCategories: string[];
  dataSubjects: string;
  purpose: string;
  safeguards: string[];
  status: TransferStatus;
  createdAt: number;
  reviewDate?: number;
  notes: string;
}

const TRANSFER_MECHANISMS: Record<TransferMechanism, { label: string; description: string; ndpaRef: string }> = {
  adequacy_decision: {
    label: 'Adequacy Decision',
    description:
      'The destination country has been determined by the NDPC to provide an adequate level of data protection.',
    ndpaRef: 'NDPA Section 42',
  },
  standard_contractual_clauses: {
    label: 'Standard Contractual Clauses (SCCs)',
    description:
      'Contractual clauses approved by the NDPC that provide appropriate safeguards for cross-border transfers.',
    ndpaRef: 'NDPA Section 43',
  },
  binding_corporate_rules: {
    label: 'Binding Corporate Rules (BCRs)',
    description:
      'Internal rules adopted by a group of companies for transfers within the group to entities in countries without adequate protection.',
    ndpaRef: 'NDPA Section 43',
  },
  ndpc_authorization: {
    label: 'NDPC Authorization',
    description:
      'Specific authorization obtained from the Nigeria Data Protection Commission for the transfer.',
    ndpaRef: 'NDPA Section 44',
  },
  derogation: {
    label: 'Derogation',
    description:
      'Transfer permitted under specific derogations such as explicit consent, contractual necessity, or important reasons of public interest.',
    ndpaRef: 'NDPA Section 45',
  },
  other: {
    label: 'Other Safeguard',
    description:
      'Another appropriate safeguard mechanism approved or recognized under the NDPA framework.',
    ndpaRef: 'NDPA Part VI',
  },
};

const SAMPLE_COUNTRIES = [
  'United Kingdom',
  'United States',
  'South Africa',
  'Ghana',
  'Kenya',
  'Germany',
  'France',
  'Canada',
  'India',
  'Singapore',
  'UAE',
  'Brazil',
];

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

export default function CrossBorderDemoPage() {
  const [activeTab, setActiveTab] = useState('mechanisms');
  const [isClient, setIsClient] = useState(false);
  const [transfers, setTransfers] = useState<CrossBorderTransfer[]>([]);

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

  useEffect(() => {
    setIsClient(true);

    const sampleTransfers: CrossBorderTransfer[] = [
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
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
        notes: 'Pending confirmation of NDPC adequacy determination for South Africa.',
      },
    ];

    setTransfers(sampleTransfers);
  }, []);

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
      createdAt: Date.now(),
      notes: formNotes,
    };

    setTransfers((prev) => [newTransfer, ...prev]);

    // Reset form
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
    setActiveTab('register');
  };

  const handleUpdateStatus = (id: string, status: TransferStatus) => {
    setTransfers((prev) =>
      prev.map((transfer) => (transfer.id === id ? { ...transfer, status } : transfer))
    );
  };

  const getMechanismBadgeVariant = (mechanism: TransferMechanism) => {
    const variants: Record<TransferMechanism, 'primary' | 'success' | 'warning' | 'info' | 'secondary' | 'danger'> = {
      adequacy_decision: 'success',
      standard_contractual_clauses: 'primary',
      binding_corporate_rules: 'info',
      ndpc_authorization: 'warning',
      derogation: 'secondary',
      other: 'default' as 'secondary',
    };
    return variants[mechanism];
  };

  const getStatusBadgeVariant = (status: TransferStatus) => {
    const variants: Record<TransferStatus, 'warning' | 'success' | 'danger' | 'info'> = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      under_review: 'info',
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

      <h1 className="text-3xl font-bold mb-4">Cross-Border Transfer Assessment</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Assess and manage international transfers of personal data in compliance with the Nigeria Data
        Protection Act (NDPA), Part VI (Sections 41&ndash;45). The NDPA restricts transfers of personal data
        outside Nigeria unless adequate safeguards are in place.
      </p>

      <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">NDPA Part VI &mdash; Transfer of Personal Data Outside Nigeria</h2>
        <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <li>
            <strong>Section 41</strong> &mdash; Prohibits transfer of personal data to a country or
            territory outside Nigeria unless appropriate safeguards are ensured.
          </li>
          <li>
            <strong>Section 42</strong> &mdash; The NDPC may determine that a country, territory, or
            international organisation ensures an adequate level of protection.
          </li>
          <li>
            <strong>Section 43</strong> &mdash; In the absence of an adequacy decision, transfers may
            proceed with appropriate safeguards (SCCs, BCRs, codes of conduct, certification mechanisms).
          </li>
          <li>
            <strong>Section 44</strong> &mdash; The NDPC may authorize specific transfers or categories
            of transfers where adequate safeguards are demonstrated.
          </li>
          <li>
            <strong>Section 45</strong> &mdash; Derogations for specific situations (explicit consent,
            contractual necessity, public interest, legal claims, vital interests).
          </li>
        </ul>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="mechanisms">Transfer Mechanisms</TabsTrigger>
          <TabsTrigger value="add">Add Transfer</TabsTrigger>
          <TabsTrigger value="register">Transfer Register</TabsTrigger>
        </TabsList>

        <TabsContent value="mechanisms" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Mechanisms Under NDPA</CardTitle>
              <CardDescription>
                Available mechanisms for lawfully transferring personal data outside Nigeria.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(
                  Object.entries(TRANSFER_MECHANISMS) as [
                    TransferMechanism,
                    { label: string; description: string; ndpaRef: string }
                  ][]
                ).map(([key, value]) => {
                  const count = transfers.filter((t) => t.transferMechanism === key).length;
                  return (
                    <div key={key} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={getMechanismBadgeVariant(key)}>{value.label}</Badge>
                          <span className="text-xs text-gray-500">({value.ndpaRef})</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {count} {count === 1 ? 'transfer' : 'transfers'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{value.description}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Cross-Border Transfer</CardTitle>
              <CardDescription>
                Document a new international data transfer and select the appropriate transfer mechanism.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Transfer Name *</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g., Cloud Data Hosting"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Destination Country *</label>
                    <select
                      value={formCountry}
                      onChange={(e) => setFormCountry(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a country</option>
                      {SAMPLE_COUNTRIES.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Describe the nature and context of the transfer"
                    rows={2}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Recipient Organisation *</label>
                    <input
                      type="text"
                      value={formRecipient}
                      onChange={(e) => setFormRecipient(e.target.value)}
                      placeholder="e.g., Partner Corp. Ltd."
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Data Subjects</label>
                    <input
                      type="text"
                      value={formSubjects}
                      onChange={(e) => setFormSubjects(e.target.value)}
                      placeholder="e.g., Customers, Employees"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Purpose of Transfer *</label>
                  <textarea
                    value={formPurpose}
                    onChange={(e) => setFormPurpose(e.target.value)}
                    placeholder="Describe the purpose of this cross-border data transfer"
                    rows={2}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Transfer Mechanism *</label>
                  <select
                    value={formMechanism}
                    onChange={(e) => setFormMechanism(e.target.value as TransferMechanism)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {(
                      Object.entries(TRANSFER_MECHANISMS) as [TransferMechanism, { label: string }][]
                    ).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    {TRANSFER_MECHANISMS[formMechanism].description} ({TRANSFER_MECHANISMS[formMechanism].ndpaRef})
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Data Categories</label>
                  <div className="grid grid-cols-2 gap-2">
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
                  <label className="block text-sm font-medium mb-1">Safeguards in Place</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {SAFEGUARD_OPTIONS.map((safeguard) => (
                      <label key={safeguard} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formSafeguards.includes(safeguard)}
                          onChange={() => handleToggleSafeguard(safeguard)}
                          className="rounded"
                        />
                        {safeguard}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Additional Notes</label>
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Any additional notes or context for this transfer"
                    rows={2}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <Button
                  onClick={handleAddTransfer}
                  disabled={
                    !formName.trim() || !formCountry.trim() || !formRecipient.trim() || !formPurpose.trim()
                  }
                >
                  Add Transfer
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="register" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Register</CardTitle>
              <CardDescription>
                All documented cross-border data transfers and their current status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 border rounded-md text-center">
                  <div className="text-2xl font-bold">{transfers.length}</div>
                  <div className="text-sm text-gray-500">Total Transfers</div>
                </div>
                <div className="p-4 border rounded-md text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {transfers.filter((t) => t.status === 'approved').length}
                  </div>
                  <div className="text-sm text-gray-500">Approved</div>
                </div>
                <div className="p-4 border rounded-md text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {transfers.filter((t) => t.status === 'pending' || t.status === 'under_review').length}
                  </div>
                  <div className="text-sm text-gray-500">Pending / Under Review</div>
                </div>
                <div className="p-4 border rounded-md text-center">
                  <div className="text-2xl font-bold">
                    {new Set(transfers.map((t) => t.destinationCountry)).size}
                  </div>
                  <div className="text-sm text-gray-500">Countries</div>
                </div>
              </div>

              {transfers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No transfers recorded yet. Add one from the &quot;Add Transfer&quot; tab.
                </div>
              ) : (
                <div className="space-y-4">
                  {transfers.map((transfer) => (
                    <div key={transfer.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-lg">{transfer.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {transfer.description}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Badge variant={getMechanismBadgeVariant(transfer.transferMechanism)}>
                            {TRANSFER_MECHANISMS[transfer.transferMechanism].label}
                          </Badge>
                          <Badge variant={getStatusBadgeVariant(transfer.status)}>
                            {transfer.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-sm">
                        <div>
                          <span className="font-medium">Destination:</span>{' '}
                          {transfer.destinationCountry}
                        </div>
                        <div>
                          <span className="font-medium">Recipient:</span>{' '}
                          {transfer.recipientOrganisation}
                        </div>
                        <div>
                          <span className="font-medium">Recorded:</span>{' '}
                          {new Date(transfer.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="mt-2 text-sm">
                        <span className="font-medium">Purpose:</span> {transfer.purpose}
                      </div>

                      {transfer.safeguards.length > 0 && (
                        <div className="mt-3">
                          <span className="text-sm font-medium">Safeguards:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {transfer.safeguards.map((safeguard) => (
                              <span
                                key={safeguard}
                                className="px-2 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full"
                              >
                                {safeguard}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {transfer.notes && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                          <span className="text-sm font-medium">Notes:</span>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {transfer.notes}
                          </p>
                        </div>
                      )}

                      {transfer.reviewDate && (
                        <div className="mt-2 text-xs text-gray-500">
                          Next review: {new Date(transfer.reviewDate).toLocaleDateString()}
                        </div>
                      )}

                      <div className="mt-3 flex gap-2">
                        {transfer.status !== 'approved' && (
                          <button
                            onClick={() => handleUpdateStatus(transfer.id, 'approved')}
                            className="text-xs px-3 py-1 border rounded bg-green-50 text-green-700 hover:bg-green-100"
                          >
                            Approve
                          </button>
                        )}
                        {transfer.status !== 'under_review' && (
                          <button
                            onClick={() => handleUpdateStatus(transfer.id, 'under_review')}
                            className="text-xs px-3 py-1 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            Mark for Review
                          </button>
                        )}
                        {transfer.status !== 'rejected' && (
                          <button
                            onClick={() => handleUpdateStatus(transfer.id, 'rejected')}
                            className="text-xs px-3 py-1 border rounded bg-red-50 text-red-700 hover:bg-red-100"
                          >
                            Reject
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
          This demo showcases cross-border transfer assessment and management capabilities for compliance
          with the Nigeria Data Protection Act (NDPA):
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Transfer Mechanism Selection</strong> &mdash; Choose the appropriate legal mechanism
            for each cross-border transfer based on NDPA Part VI requirements.
          </li>
          <li>
            <strong>Safeguard Documentation</strong> &mdash; Record the technical and organizational
            safeguards in place to protect transferred data.
          </li>
          <li>
            <strong>Transfer Register</strong> &mdash; Maintain a comprehensive register of all
            international data transfers for NDPC audit readiness.
          </li>
        </ul>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-sm font-semibold text-blue-800 mb-1">NDPA Compliance Reference</h3>
          <p className="text-sm text-blue-700">
            Cross-border data transfer management is governed by <strong>NDPA Part VI (Sections
            41&ndash;45)</strong>. Data controllers must ensure that personal data transferred outside
            Nigeria receives an adequate level of protection. The{' '}
            <strong>Nigeria Data Protection Commission (NDPC)</strong> has the authority to issue adequacy
            decisions, approve transfer mechanisms, and authorize specific transfers.
          </p>
        </div>
        <p className="mt-4">
          For detailed documentation, see the{' '}
          <Link href="/docs/components/cross-border-transfer" className="text-blue-600 hover:underline">
            Cross-Border Transfer documentation
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
