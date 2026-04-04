"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OrgDetails {
  orgName: string;
  website: string;
  email: string;
  dpoName: string;
  industry: string;
}

type TemplateType = "business" | "nonprofit" | "government" | "educational";
type ExportView = "styled" | "markdown" | "plaintext";

interface SectionDef {
  id: string;
  label: string;
  enabled: boolean;
}

// ---------------------------------------------------------------------------
// Section content generators
// ---------------------------------------------------------------------------

function sectionContent(
  id: string,
  org: OrgDetails,
  templateType: TemplateType,
): string {
  const name = org.orgName || "[Organization Name]";
  const site = org.website || "[website]";
  const email = org.email || "[email]";
  const dpo = org.dpoName || "[DPO Name]";
  const industry = org.industry || "[industry]";

  const entityLabel: Record<TemplateType, string> = {
    business: "company",
    nonprofit: "organization",
    government: "agency",
    educational: "institution",
  };
  const entity = entityLabel[templateType];

  const today = new Date().toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const templates: Record<string, string> = {
    "data-collection": [
      `${name} ("we", "us", or "our") collects personal data to provide and improve our services. As a ${industry} ${entity}, we are committed to transparent data practices in accordance with the Nigeria Data Protection Act (NDPA) 2023.`,
      "",
      "We collect the following categories of personal data:",
      "",
      "\u2022 Identity Data \u2014 full name, date of birth, government-issued identifiers",
      "\u2022 Contact Data \u2014 email address, phone number, postal address",
      "\u2022 Technical Data \u2014 IP address, browser type, device identifiers, login data",
      "\u2022 Usage Data \u2014 information about how you use our website and services",
      "\u2022 Financial Data \u2014 payment card details, bank account information (where applicable)",
      "\u2022 Communications Data \u2014 preferences for receiving communications from us",
      "",
      "We collect this data directly from you, through automated technologies (cookies, server logs), and occasionally from third-party sources such as public databases or partner organizations.",
    ].join("\n"),

    usage: [
      "We process your personal data only for lawful purposes. Specifically, we use your data to:",
      "",
      "\u2022 Provide, operate, and maintain our services",
      "\u2022 Process transactions and send related information",
      "\u2022 Respond to your requests, comments, or questions",
      "\u2022 Send administrative information, such as updates to our terms and policies",
      "\u2022 Improve and personalize your experience",
      "\u2022 Conduct analytics and research to enhance our offerings",
      "\u2022 Comply with legal obligations under Nigerian law and the NDPA",
      "",
      `Under the NDPA, ${name} relies on one or more of the following legal bases for processing: your consent, contractual necessity, compliance with legal obligations, protection of vital interests, performance of a task in the public interest, and legitimate interests pursued by ${name} (provided they do not override your fundamental rights).`,
    ].join("\n"),

    sharing: [
      "We may share your personal data with the following categories of recipients:",
      "",
      `\u2022 Service providers \u2014 companies that perform services on behalf of ${name}, such as payment processors, hosting providers, and analytics platforms`,
      "\u2022 Professional advisers \u2014 lawyers, auditors, and insurers who provide consultancy, banking, legal, insurance, and accounting services",
      "\u2022 Regulatory authorities \u2014 the Nigeria Data Protection Commission (NDPC) and other bodies as required by law",
      templateType === "government"
        ? "\u2022 Other government agencies \u2014 as required for inter-agency data sharing under applicable law"
        : "",
      "",
      "We require all third parties to respect the security of your personal data and to treat it in accordance with the NDPA. We do not permit our third-party service providers to use your personal data for their own purposes; they may only process your data for specified purposes and in accordance with our instructions.",
    ].join("\n"),

    retention: [
      `${name} retains personal data only for as long as necessary to fulfil the purposes for which it was collected, including to satisfy legal, regulatory, accounting, or reporting requirements.`,
      "",
      "To determine the appropriate retention period, we consider:",
      "",
      "\u2022 The amount, nature, and sensitivity of the personal data",
      "\u2022 The potential risk of harm from unauthorized use or disclosure",
      "\u2022 The purposes for which we process the data and whether we can achieve those purposes through other means",
      "\u2022 Applicable legal, regulatory, and contractual requirements",
      "",
      "When personal data is no longer required, we will securely delete or anonymize it. If deletion is not immediately possible (for example, because data has been stored in backup archives), we will securely store and isolate the data from any further processing until deletion is feasible.",
    ].join("\n"),

    rights: [
      "Under the NDPA, you have the following rights with respect to your personal data:",
      "",
      "\u2022 Right of Access \u2014 you may request a copy of the personal data we hold about you",
      "\u2022 Right to Rectification \u2014 you may request correction of inaccurate or incomplete data",
      "\u2022 Right to Erasure \u2014 you may request deletion of your personal data in certain circumstances",
      "\u2022 Right to Restrict Processing \u2014 you may request that we limit how we use your data",
      "\u2022 Right to Data Portability \u2014 you may request transfer of your data in a structured, commonly used format",
      "\u2022 Right to Object \u2014 you may object to processing based on legitimate interests or for direct marketing",
      "\u2022 Right to Withdraw Consent \u2014 where processing is based on consent, you may withdraw it at any time without affecting the lawfulness of prior processing",
      "",
      `To exercise any of these rights, please contact our Data Protection Officer at ${email}. We will respond to your request within 30 days, as required by the NDPA.`,
      "",
      "You also have the right to lodge a complaint with the Nigeria Data Protection Commission (NDPC) if you believe your data protection rights have been violated.",
    ].join("\n"),

    cookies: [
      `${name} uses cookies and similar tracking technologies on ${site} to enhance your experience and gather information about usage patterns.`,
      "",
      "Types of cookies we use:",
      "",
      "\u2022 Strictly Necessary Cookies \u2014 required for the operation of our website; they enable core functionality such as security, network management, and accessibility",
      "\u2022 Analytics Cookies \u2014 help us understand how visitors interact with our website by collecting and reporting information anonymously",
      "\u2022 Functionality Cookies \u2014 allow us to remember choices you make (such as language or region) to provide enhanced, personalized features",
      "\u2022 Marketing Cookies \u2014 used to track visitors across websites to display relevant advertisements (only with your explicit consent)",
      "",
      "You can control cookie preferences through your browser settings. Note that disabling certain cookies may affect the functionality of our website. Under the NDPA, we obtain your consent before placing non-essential cookies on your device.",
    ].join("\n"),

    "cross-border": [
      `${name} may transfer your personal data to recipients located outside Nigeria. When we do, we ensure that appropriate safeguards are in place in accordance with the NDPA (Sections 41\u201345).`,
      "",
      "These safeguards include:",
      "",
      "\u2022 Transferring data only to countries that the NDPC has determined provide an adequate level of data protection",
      "\u2022 Using NDPC-approved standard contractual clauses with the data recipient",
      "\u2022 Obtaining your explicit consent after informing you of the possible risks of such transfers",
      "\u2022 Ensuring the transfer is necessary for the performance of a contract between you and us",
      "",
      `For details about our international data transfers and the specific safeguards applied, please contact ${dpo} at ${email}.`,
    ].join("\n"),

    contact: [
      `If you have any questions about this Privacy Policy or our data practices, please contact us:`,
      "",
      `${name}`,
      `Website: ${site}`,
      `Email: ${email}`,
      "",
      "Data Protection Officer:",
      `${dpo}`,
      `Email: ${email}`,
      "",
      `This policy is effective as of ${today} and will be reviewed and updated periodically. Changes will be posted on ${site} and, where appropriate, notified to you by email.`,
      "",
      `\u00A9 ${new Date().getFullYear()} ${name}. All rights reserved.`,
    ].join("\n"),
  };

  return templates[id] ?? "";
}

// ---------------------------------------------------------------------------
// Compliance rules
// ---------------------------------------------------------------------------

interface ComplianceItem {
  id: string;
  label: string;
  section: string | null; // section id that satisfies it, or null if satisfied by org details
  orgField?: keyof OrgDetails;
}

const COMPLIANCE_ITEMS: ComplianceItem[] = [
  { id: "c1", label: "Data collection purposes disclosed", section: "data-collection" },
  { id: "c2", label: "Legal basis for processing stated", section: "usage" },
  { id: "c3", label: "Third-party data sharing disclosed", section: "sharing" },
  { id: "c4", label: "Data retention periods specified", section: "retention" },
  { id: "c5", label: "Data subject rights documented", section: "rights" },
  { id: "c6", label: "Cookie usage disclosed", section: "cookies" },
  { id: "c7", label: "Cross-border transfer safeguards", section: "cross-border" },
  { id: "c8", label: "Contact information provided", section: "contact" },
  { id: "c9", label: "Organization identified", section: null, orgField: "orgName" },
  { id: "c10", label: "DPO contact designated", section: null, orgField: "dpoName" },
];

// ---------------------------------------------------------------------------
// Default section order
// ---------------------------------------------------------------------------

const DEFAULT_SECTIONS: SectionDef[] = [
  { id: "data-collection", label: "Data Collection", enabled: true },
  { id: "usage", label: "Usage & Legal Basis", enabled: true },
  { id: "sharing", label: "Data Sharing", enabled: true },
  { id: "retention", label: "Data Retention", enabled: true },
  { id: "rights", label: "Data Subject Rights", enabled: true },
  { id: "cookies", label: "Cookies & Tracking", enabled: true },
  { id: "cross-border", label: "Cross-Border Transfers", enabled: false },
  { id: "contact", label: "Contact Information", enabled: true },
];

// ---------------------------------------------------------------------------
// Section heading labels for the document preview
// ---------------------------------------------------------------------------

const SECTION_HEADINGS: Record<string, string> = {
  "data-collection": "Personal Data We Collect",
  usage: "How We Use Your Data",
  sharing: "Data Sharing & Disclosure",
  retention: "Data Retention",
  rights: "Your Rights Under the NDPA",
  cookies: "Cookies & Tracking Technologies",
  "cross-border": "International Data Transfers",
  contact: "Contact Us",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PolicyDemoPage() {
  // Org details
  const [org, setOrg] = useState<OrgDetails>({
    orgName: "Acme Nigeria Ltd",
    website: "https://acme.ng",
    email: "privacy@acme.ng",
    dpoName: "Chidi Okafor",
    industry: "Technology",
  });

  // Sections
  const [sections, setSections] = useState<SectionDef[]>(
    DEFAULT_SECTIONS.map((s) => ({ ...s })),
  );

  // Template type
  const [templateType, setTemplateType] = useState<TemplateType>("business");

  // Export view
  const [exportView, setExportView] = useState<ExportView>("styled");

  // ---- callbacks ----

  const updateOrg = useCallback(
    (field: keyof OrgDetails, value: string) => {
      setOrg((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const toggleSection = useCallback((id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    );
  }, []);

  const moveSection = useCallback((index: number, direction: "up" | "down") => {
    setSections((prev) => {
      const next = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  // ---- derived state ----

  const enabledSections = useMemo(
    () => sections.filter((s) => s.enabled),
    [sections],
  );

  const complianceResults = useMemo(() => {
    return COMPLIANCE_ITEMS.map((item) => {
      let satisfied = false;
      if (item.section) {
        satisfied = enabledSections.some((s) => s.id === item.section);
      } else if (item.orgField) {
        satisfied = (org[item.orgField] ?? "").trim().length > 0;
      }
      return { ...item, satisfied };
    });
  }, [enabledSections, org]);

  const satisfiedCount = complianceResults.filter((r) => r.satisfied).length;

  // ---- content builders ----

  const buildDocumentSections = useCallback(() => {
    return enabledSections.map((s, i) => ({
      number: i + 1,
      heading: SECTION_HEADINGS[s.id] || s.label,
      body: sectionContent(s.id, org, templateType),
    }));
  }, [enabledSections, org, templateType]);

  const toMarkdown = useCallback(() => {
    const date = new Date().toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const docSections = buildDocumentSections();
    const lines: string[] = [];

    lines.push(`# ${org.orgName || "[Organization Name]"} Privacy Policy`);
    lines.push("");
    lines.push(`*Effective Date: ${date}*`);
    lines.push("");
    lines.push(
      `*This privacy policy has been prepared in compliance with the Nigeria Data Protection Act (NDPA) 2023.*`,
    );
    lines.push("");
    lines.push("## Table of Contents");
    lines.push("");
    docSections.forEach((s) => {
      lines.push(`${s.number}. ${s.heading}`);
    });
    lines.push("");

    docSections.forEach((s) => {
      lines.push(`## ${s.number}. ${s.heading}`);
      lines.push("");
      lines.push(s.body);
      lines.push("");
    });

    lines.push("---");
    lines.push("");
    lines.push(
      `\u00A9 ${new Date().getFullYear()} ${org.orgName || "[Organization Name]"}. All rights reserved.`,
    );

    return lines.join("\n");
  }, [buildDocumentSections, org.orgName]);

  const toPlainText = useCallback(() => {
    const md = toMarkdown();
    return md
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  }, [toMarkdown]);

  // ---- template tabs ----

  const TEMPLATE_OPTIONS: { value: TemplateType; label: string }[] = [
    { value: "business", label: "Business" },
    { value: "nonprofit", label: "Nonprofit" },
    { value: "government", label: "Government" },
    { value: "educational", label: "Educational" },
  ];

  // ---- render helpers ----

  const docSections = buildDocumentSections();
  const today = new Date().toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ----------------------------------------------------------------- */}
      {/* Hero */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/ndpr-demos"
            className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to NDPR Demos
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Privacy Policy Generator
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl">
            Build NDPA-compliant privacy policies interactively. Toggle sections,
            fill in your organization details, and preview the generated document
            in real time.
          </p>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Template Selector */}
      {/* ----------------------------------------------------------------- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
            Template:
          </span>
          {TEMPLATE_OPTIONS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTemplateType(t.value)}
              className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${
                templateType === t.value
                  ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 3-panel layout */}
      {/* ----------------------------------------------------------------- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ============================================================= */}
          {/* Left panel: Section selector */}
          {/* ============================================================= */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                  Policy Sections
                </h2>
              </div>
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {sections.map((s, idx) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-2 px-4 py-3 min-h-[44px] group"
                  >
                    {/* checkbox */}
                    <label className="flex items-center cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={s.enabled}
                        onChange={() => toggleSection(s.id)}
                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-800"
                      />
                      <span
                        className={`ml-2 text-sm truncate ${
                          s.enabled
                            ? "text-gray-900 dark:text-white font-medium"
                            : "text-gray-400 dark:text-gray-500 line-through"
                        }`}
                      >
                        {s.label}
                      </span>
                    </label>
                    {/* reorder buttons */}
                    <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => moveSection(idx, "up")}
                        disabled={idx === 0}
                        className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-20 disabled:cursor-not-allowed leading-none text-xs"
                        aria-label={`Move ${s.label} up`}
                      >
                        &#9650;
                      </button>
                      <button
                        onClick={() => moveSection(idx, "down")}
                        disabled={idx === sections.length - 1}
                        className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-20 disabled:cursor-not-allowed leading-none text-xs"
                        aria-label={`Move ${s.label} down`}
                      >
                        &#9660;
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
                {enabledSections.length} of {sections.length} sections enabled
              </div>
            </div>

            {/* ----- Compliance Checklist ----- */}
            <div className="mt-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                  NDPA Compliance
                </h2>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    satisfiedCount === COMPLIANCE_ITEMS.length
                      ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400"
                  }`}
                >
                  {satisfiedCount}/{COMPLIANCE_ITEMS.length}
                </span>
              </div>
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {complianceResults.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-start gap-2 px-4 py-2.5 text-sm"
                  >
                    {c.satisfied ? (
                      <span className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    ) : (
                      <span className="text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    )}
                    <span
                      className={
                        c.satisfied
                          ? "text-gray-700 dark:text-gray-300"
                          : "text-gray-400 dark:text-gray-500"
                      }
                    >
                      {c.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ============================================================= */}
          {/* Center panel: Live preview */}
          {/* ============================================================= */}
          <div className="lg:col-span-6">
            {/* Export view tabs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-full sm:w-auto overflow-x-auto">
                {(
                  [
                    { value: "styled", label: "Full Preview" },
                    { value: "markdown", label: "Markdown" },
                    { value: "plaintext", label: "Plain Text" },
                  ] as { value: ExportView; label: string }[]
                ).map((v) => (
                  <button
                    key={v.value}
                    onClick={() => setExportView(v.value)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      exportView === v.value
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  alert(
                    "In production, this would use the PolicyExporter component to generate a downloadable PDF.",
                  );
                }}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download PDF
              </button>
            </div>

            {/* Document container */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
              {exportView === "styled" ? (
                /* ---------- Styled document preview ---------- */
                <div className="p-8 sm:p-12">
                  {/* Document header */}
                  <div className="border-b-2 border-gray-800 dark:border-gray-200 pb-6 mb-8">
                    <h1
                      className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white"
                      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                    >
                      {org.orgName || "[Organization Name]"} Privacy Policy
                    </h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic">
                      Effective Date: {today}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 italic">
                      Prepared in compliance with the Nigeria Data Protection Act
                      (NDPA) 2023
                    </p>
                  </div>

                  {/* Table of contents */}
                  {docSections.length > 0 && (
                    <div className="mb-10">
                      <h2
                        className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3"
                        style={{
                          fontFamily: "Georgia, 'Times New Roman', serif",
                        }}
                      >
                        Table of Contents
                      </h2>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700 dark:text-blue-400">
                        {docSections.map((s) => (
                          <li key={s.number}>
                            <a
                              href={`#section-${s.number}`}
                              className="hover:underline"
                            >
                              {s.heading}
                            </a>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Sections */}
                  {docSections.length === 0 ? (
                    <p className="text-gray-400 dark:text-gray-500 italic text-center py-12">
                      Enable at least one section to preview the policy.
                    </p>
                  ) : (
                    <div className="space-y-10">
                      {docSections.map((s) => (
                        <section key={s.number} id={`section-${s.number}`}>
                          <h2
                            className="text-xl font-semibold text-gray-900 dark:text-white mb-4"
                            style={{
                              fontFamily: "Georgia, 'Times New Roman', serif",
                            }}
                          >
                            {s.number}. {s.heading}
                          </h2>
                          <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
                            {s.body}
                          </div>
                        </section>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  {docSections.length > 0 && (
                    <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500">
                      <p>
                        &copy; {new Date().getFullYear()}{" "}
                        {org.orgName || "[Organization Name]"}. All rights
                        reserved.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* ---------- Markdown / Plain text view ---------- */
                <div className="p-6">
                  <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800 dark:text-gray-200 leading-relaxed overflow-x-auto">
                    {exportView === "markdown" ? toMarkdown() : toPlainText()}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* ============================================================= */}
          {/* Right panel: Organization details */}
          {/* ============================================================= */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                  Organization Details
                </h2>
              </div>
              <div className="p-4 space-y-4">
                {/* Organization Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={org.orgName}
                    onChange={(e) => updateOrg("orgName", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="Your Organization"
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={org.website}
                    onChange={(e) => updateOrg("website", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="https://example.com"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={org.email}
                    onChange={(e) => updateOrg("email", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="privacy@example.com"
                  />
                </div>

                {/* DPO Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data Protection Officer
                  </label>
                  <input
                    type="text"
                    value={org.dpoName}
                    onChange={(e) => updateOrg("dpoName", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="DPO Name"
                  />
                </div>

                {/* Industry */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Industry
                  </label>
                  <select
                    value={org.industry}
                    onChange={(e) => updateOrg("industry", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Financial Services">Financial Services</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Telecommunications">Telecommunications</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Government">Government</option>
                    <option value="Media & Entertainment">
                      Media &amp; Entertainment
                    </option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Non-profit">Non-profit</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Export options (secondary) */}
            <div className="mt-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                  Export Options
                </h2>
              </div>
              <div className="p-4 space-y-2">
                <button
                  onClick={() => {
                    const text = toMarkdown();
                    navigator.clipboard.writeText(text).then(() => {
                      alert("Markdown copied to clipboard.");
                    });
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy Markdown
                </button>
                <button
                  onClick={() => {
                    const text = toPlainText();
                    navigator.clipboard.writeText(text).then(() => {
                      alert("Plain text copied to clipboard.");
                    });
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Copy Plain Text
                </button>
                <button
                  onClick={() => {
                    alert(
                      "In production, this would use the PolicyExporter component to generate a downloadable PDF.",
                    );
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
