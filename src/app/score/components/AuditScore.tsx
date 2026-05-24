'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  getComplianceScore,
  type ComplianceInput,
  type ComplianceReport,
  type RecommendationPriority,
} from '@tantainnovative/ndpr-toolkit/server';

/* ──────────────────────────────────────────────────────────────────────────
 * Default state — every flag starts at false ("haven't done it") so the
 * initial score is honestly bad. Users adjust each section as they walk
 * through the questionnaire. Dates default to today (treats existing
 * policy/RoPA as fresh; if user hasn't reviewed at all they should leave
 * the date far in the past — we surface a hint to that effect).
 * ────────────────────────────────────────────────────────────────────────── */

const today = new Date().toISOString().slice(0, 10);

const DEFAULT_INPUT: ComplianceInput = {
  consent: {
    hasConsentMechanism: false,
    hasPurposeSpecification: false,
    hasWithdrawalMechanism: false,
    hasMinorProtection: false,
    consentRecordsRetained: false,
  },
  dsr: {
    hasRequestMechanism: false,
    supportsAccess: false,
    supportsRectification: false,
    supportsErasure: false,
    supportsPortability: false,
    supportsObjection: false,
    responseTimelineDays: 30,
  },
  dpia: {
    conductedForHighRisk: false,
    documentedRisks: false,
    mitigationMeasures: false,
  },
  breach: {
    hasNotificationProcess: false,
    notifiesWithin72Hours: false,
    hasRiskAssessment: false,
    hasRecordKeeping: false,
  },
  policy: {
    hasPrivacyPolicy: false,
    isPubliclyAccessible: false,
    lastUpdated: today,
    coversAllSections: false,
  },
  lawfulBasis: {
    documentedForAllProcessing: false,
    hasLegitimateInterestAssessment: false,
  },
  crossBorder: {
    hasTransferMechanisms: false,
    adequacyAssessed: false,
    ndpcApprovalObtained: false,
  },
  ropa: {
    maintained: false,
    includesAllProcessing: false,
    lastReviewed: today,
  },
};

/* Per-flag prompt labels — what the user actually reads. */
type SectionConfig = {
  id: keyof ComplianceInput;
  title: string;
  ndpa: string;
  questions: ReadonlyArray<{
    key: string;
    label: string;
    hint?: string;
  }>;
};

const SECTIONS: SectionConfig[] = [
  {
    id: 'consent',
    title: 'Consent',
    ndpa: 'NDPA Section 26',
    questions: [
      { key: 'hasConsentMechanism', label: 'We have a cookie / consent banner on every public-facing page.' },
      { key: 'hasPurposeSpecification', label: 'Each consent option lists a specific, named purpose.' },
      { key: 'hasWithdrawalMechanism', label: 'Users can withdraw consent as easily as they gave it (Section 26).' },
      { key: 'hasMinorProtection', label: 'Where applicable, we collect parental consent for minors (Section 31).' },
      { key: 'consentRecordsRetained', label: 'We keep an audit log of every consent decision (who, when, what, version).' },
    ],
  },
  {
    id: 'dsr',
    title: 'Data Subject Rights',
    ndpa: 'NDPA Part VI (Sections 34–38)',
    questions: [
      { key: 'hasRequestMechanism', label: 'We have a published DSR submission channel (form or email).' },
      { key: 'supportsAccess', label: 'We can fulfil access requests (Section 34(1)(a)).' },
      { key: 'supportsRectification', label: 'We can fulfil rectification requests (Section 34(1)(c)).' },
      { key: 'supportsErasure', label: 'We can fulfil erasure requests (Section 34(1)(d)).' },
      { key: 'supportsPortability', label: 'We can fulfil portability requests (Section 38).' },
      { key: 'supportsObjection', label: 'We can fulfil objection requests (Section 36).' },
    ],
  },
  {
    id: 'dpia',
    title: 'DPIA',
    ndpa: 'NDPA Section 28',
    questions: [
      { key: 'conductedForHighRisk', label: 'We complete a DPIA before any high-risk processing (Section 28(1)).' },
      { key: 'documentedRisks', label: 'Each DPIA documents identified risks to data subjects.' },
      { key: 'mitigationMeasures', label: 'Each DPIA includes mitigation measures and residual-risk acceptance.' },
    ],
  },
  {
    id: 'breach',
    title: 'Breach Notification',
    ndpa: 'NDPA Section 40',
    questions: [
      { key: 'hasNotificationProcess', label: 'We have a documented breach-notification process.' },
      { key: 'notifiesWithin72Hours', label: 'Our process can notify NDPC within 72 hours of discovery (Section 40(2)).' },
      { key: 'hasRiskAssessment', label: 'Every breach triggers a risk assessment to determine notification need.' },
      { key: 'hasRecordKeeping', label: 'We maintain a breach register with all incidents and actions.' },
    ],
  },
  {
    id: 'policy',
    title: 'Privacy Policy',
    ndpa: 'NDPA Section 27',
    questions: [
      { key: 'hasPrivacyPolicy', label: 'We publish a privacy policy.' },
      { key: 'isPubliclyAccessible', label: 'The privacy policy is reachable from every page (usually footer).' },
      { key: 'coversAllSections', label: 'The policy covers every Section 27(1) disclosure (lawful basis, retention, rights, NDPC complaint route).' },
    ],
  },
  {
    id: 'lawfulBasis',
    title: 'Lawful Basis',
    ndpa: 'NDPA Section 25',
    questions: [
      { key: 'documentedForAllProcessing', label: 'We have documented a lawful basis for every processing activity.' },
      { key: 'hasLegitimateInterestAssessment', label: 'Where we rely on legitimate interest, we have a written LIA.' },
    ],
  },
  {
    id: 'crossBorder',
    title: 'Cross-Border Transfer',
    ndpa: 'NDPA Sections 41–43',
    questions: [
      { key: 'hasTransferMechanisms', label: 'We have an appropriate transfer mechanism for every cross-border data flow.' },
      { key: 'adequacyAssessed', label: 'We have assessed the adequacy of each destination country (Section 42).' },
      { key: 'ndpcApprovalObtained', label: 'Where required, we have obtained NDPC approval (BCRs, codes of conduct, certifications).' },
    ],
  },
  {
    id: 'ropa',
    title: 'Record of Processing Activities',
    ndpa: 'NDPA Section 29',
    questions: [
      { key: 'maintained', label: 'We maintain a Record of Processing Activities (RoPA).' },
      { key: 'includesAllProcessing', label: 'The RoPA covers every processing activity across the organisation.' },
    ],
  },
];

/* ──────────────────────────────────────────────────────────────────────────
 * Score UI
 * ────────────────────────────────────────────────────────────────────────── */

function ratingColor(rating: ComplianceReport['rating']): string {
  switch (rating) {
    case 'excellent': return 'text-emerald-500';
    case 'good': return 'text-blue-500';
    case 'needs-work': return 'text-orange-500';
    case 'critical': return 'text-red-500';
    default: return 'text-foreground';
  }
}

/** Compute a rating bucket for an individual module score. The library only
 * exposes an overall rating, but per-module we want the same colour scale. */
function moduleRating(score: number): ComplianceReport['rating'] {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'needs-work';
  return 'critical';
}

function ratingSummary(rating: ComplianceReport['rating'], score: number): string {
  switch (rating) {
    case 'excellent':
      return `Strong NDPA posture at ${score}/100. Verify with your DPO and keep RoPA + policy reviews current.`;
    case 'good':
      return `Solid foundations at ${score}/100. A few high-priority gaps to close — see the recommendations below.`;
    case 'needs-work':
      return `Material gaps at ${score}/100. Multiple critical items below — prioritise the red items first.`;
    case 'critical':
      return `Significant exposure at ${score}/100. Engage your DPO immediately and start with the critical items.`;
    default:
      return `${score}/100`;
  }
}

function priorityColor(p: RecommendationPriority): string {
  switch (p) {
    case 'critical': return 'border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950';
    case 'high': return 'border-orange-300 bg-orange-50 dark:border-orange-900 dark:bg-orange-950';
    case 'medium': return 'border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950';
    case 'low': return 'border-blue-300 bg-blue-50 dark:border-blue-900 dark:bg-blue-950';
    default: return 'border-border bg-card';
  }
}

export function AuditScore() {
  const [input, setInput] = useState<ComplianceInput>(DEFAULT_INPUT);
  const [submitted, setSubmitted] = useState(false);

  const report = useMemo(() => getComplianceScore(input), [input]);

  const toggleFlag = useCallback(
    (sectionId: keyof ComplianceInput, key: string, checked: boolean) => {
      setInput((prev) => ({
        ...prev,
        [sectionId]: {
          ...(prev[sectionId] as Record<string, unknown>),
          [key]: checked,
        },
      }));
    },
    [],
  );

  const setPolicyDate = useCallback((iso: string) => {
    setInput((prev) => ({ ...prev, policy: { ...prev.policy, lastUpdated: iso } }));
  }, []);

  const setRopaDate = useCallback((iso: string) => {
    setInput((prev) => ({ ...prev, ropa: { ...prev.ropa, lastReviewed: iso } }));
  }, []);

  const setResponseDays = useCallback((days: number) => {
    setInput((prev) => ({
      ...prev,
      dsr: { ...prev.dsr, responseTimelineDays: Math.max(0, Math.min(365, days)) },
    }));
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
      {/* ── Left column: questionnaire ───────────────────────────────────── */}
      <div className="space-y-6">
        {SECTIONS.map((section) => {
          const sectionValues = input[section.id] as Record<string, unknown>;
          return (
            <section key={section.id} className="rounded-lg border border-border p-6 bg-card">
              <header className="mb-4">
                <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{section.ndpa}</p>
              </header>
              <div className="space-y-3">
                {section.questions.map((q) => (
                  <label key={q.key} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(sectionValues[q.key])}
                      onChange={(e) => toggleFlag(section.id, q.key, e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-400 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-foreground">{q.label}</span>
                  </label>
                ))}

                {/* Section-specific extras */}
                {section.id === 'dsr' && (
                  <label className="flex items-center gap-3 mt-3">
                    <span className="text-sm text-foreground">Typical response time</span>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={input.dsr.responseTimelineDays}
                      onChange={(e) => setResponseDays(Number(e.target.value))}
                      className="w-20 rounded border border-border bg-background px-2 py-1 text-sm"
                    />
                    <span className="text-sm text-muted-foreground">days (NDPC guidance: 30)</span>
                  </label>
                )}
                {section.id === 'policy' && (
                  <label className="flex items-center gap-3 mt-3">
                    <span className="text-sm text-foreground">Privacy policy last updated</span>
                    <input
                      type="date"
                      value={input.policy.lastUpdated}
                      onChange={(e) => setPolicyDate(e.target.value)}
                      className="rounded border border-border bg-background px-2 py-1 text-sm"
                    />
                  </label>
                )}
                {section.id === 'ropa' && (
                  <label className="flex items-center gap-3 mt-3">
                    <span className="text-sm text-foreground">RoPA last reviewed</span>
                    <input
                      type="date"
                      value={input.ropa.lastReviewed}
                      onChange={(e) => setRopaDate(e.target.value)}
                      className="rounded border border-border bg-background px-2 py-1 text-sm"
                    />
                  </label>
                )}
              </div>
            </section>
          );
        })}

        {/* ── Recommendations ──────────────────────────────────────────── */}
        <section className="rounded-lg border border-border p-6 bg-card">
          <h2 className="text-xl font-semibold text-foreground mb-1">
            Your prioritised recommendations
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {report.recommendations.length === 0
              ? 'No gaps detected — your audit is clean. Verify with your DPO before relying on this result.'
              : `${report.recommendations.length} gap${report.recommendations.length === 1 ? '' : 's'} identified, sorted by priority.`}
          </p>
          <ul className="space-y-3">
            {report.recommendations.map((r, i) => (
              <li
                key={i}
                className={`rounded-md border p-3 ${priorityColor(r.priority)}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider">{r.priority}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{r.module}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{r.ndpaSection}</span>
                </div>
                <p className="text-sm text-foreground font-medium mb-1">{r.label}</p>
                <p className="text-sm text-muted-foreground">{r.recommendation}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ── Right column: live score (sticky on desktop) ─────────────────── */}
      <aside className="lg:sticky lg:top-24 self-start space-y-4">
        <div className="rounded-lg border border-border p-6 bg-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Compliance score</p>
          <div className="flex items-baseline gap-2 mb-3">
            <span className={`text-5xl font-bold ${ratingColor(report.rating)}`}>{report.score}</span>
            <span className="text-2xl text-muted-foreground">/ 100</span>
          </div>
          <p className={`text-sm font-semibold uppercase tracking-wider ${ratingColor(report.rating)}`}>
            {report.rating}
          </p>
          <p className="text-xs text-muted-foreground mt-2">{ratingSummary(report.rating, report.score)}</p>
        </div>

        <div className="rounded-lg border border-border p-4 bg-card">
          <h3 className="text-sm font-semibold text-foreground mb-3">By module</h3>
          <ul className="space-y-2 text-xs">
            {Object.entries(report.modules).map(([key, mod]) => (
              <li key={key} className="flex justify-between items-center">
                <span className="text-muted-foreground">{key}</span>
                <span className={`font-medium ${ratingColor(moduleRating(mod.score))}`}>
                  {Math.round(mod.score)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <EmailCaptureForm report={report} submitted={submitted} onSubmitted={() => setSubmitted(true)} />

        <button
          type="button"
          onClick={() => window.print()}
          className="block w-full text-center rounded-lg border border-border px-4 py-2 text-sm hover:bg-card transition"
        >
          Print / save as PDF
        </button>

        <Link
          href="/docs"
          className="block w-full text-center rounded-lg border border-border px-4 py-2 text-sm hover:bg-card transition"
        >
          See full toolkit docs →
        </Link>

        <p className="text-xs text-muted-foreground italic px-1">
          Score generated for guidance only. Not legal advice — verify with your DPO or counsel.
        </p>
      </aside>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Email capture
 * ────────────────────────────────────────────────────────────────────────── */

interface EmailCaptureProps {
  report: ComplianceReport;
  submitted: boolean;
  onSubmitted: () => void;
}

/**
 * Build a `mailto:` href that pre-fills the maintainer's inbox with the
 * audit-taker's details and a Markdown digest of the top recommendations.
 * The docs site is statically exported, so we can't run an API route in
 * production — `mailto:` is the universal MVP path. A future patch can
 * swap this for a real backend (Formspree, Resend, etc.) without
 * touching the surrounding UI.
 */
function buildMailto(input: {
  name: string;
  email: string;
  orgName: string;
  report: ComplianceReport;
}): string {
  const { name, email, orgName, report } = input;
  const subject = `NDPA audit score: ${report.score}/100 (${report.rating}) — ${orgName || name || 'audit request'}`;
  const moduleLines = Object.entries(report.modules)
    .map(([k, m]) => `- ${k}: ${Math.round(m.score)}/100 (${moduleRating(m.score)})`)
    .join('\n');
  const topRecs = report.recommendations
    .slice(0, 10)
    .map(
      (r, i) =>
        `${i + 1}. [${r.priority.toUpperCase()}] ${r.label} — ${r.ndpaSection}\n   ${r.recommendation}`,
    )
    .join('\n\n');
  const body = `Hi NDPR Toolkit team,

I just ran the audit at ndprtoolkit.com.ng/score and would like the PDF report.

Name: ${name}
Email: ${email}
Organisation: ${orgName || 'n/a'}

──────── Audit summary ────────
Overall: ${report.score}/100 (${report.rating})

Per-module:
${moduleLines}

──────── Top recommendations ────────
${topRecs || 'No gaps detected.'}

Generated at: ${report.generatedAt}

Thanks!`;
  return `mailto:hello@ndprtoolkit.com.ng?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Build the JSON payload sent to Web3Forms. Same shape as the mailto body
 * so the maintainer's inbox sees a consistent digest whichever path the
 * user takes.
 */
function buildWeb3FormsPayload(input: {
  accessKey: string;
  name: string;
  email: string;
  orgName: string;
  report: ComplianceReport;
}): Record<string, string> {
  const { accessKey, name, email, orgName, report } = input;
  const moduleLines = Object.entries(report.modules)
    .map(([k, m]) => `- ${k}: ${Math.round(m.score)}/100 (${moduleRating(m.score)})`)
    .join('\n');
  const topRecs = report.recommendations
    .slice(0, 10)
    .map(
      (r, i) =>
        `${i + 1}. [${r.priority.toUpperCase()}] ${r.label} — ${r.ndpaSection}\n   ${r.recommendation}`,
    )
    .join('\n\n');

  return {
    access_key: accessKey,
    subject: `NDPA audit score: ${report.score}/100 (${report.rating}) — ${orgName || name || 'audit request'}`,
    from_name: name,
    email,
    organisation: orgName || 'n/a',
    score: String(report.score),
    rating: report.rating,
    generated_at: report.generatedAt,
    per_module: moduleLines,
    top_recommendations: topRecs || 'No gaps detected.',
  };
}

function EmailCaptureForm({ report, submitted, onSubmitted }: EmailCaptureProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [orgName, setOrgName] = useState('');
  const [busy, setBusy] = useState(false);
  const [submitMethod, setSubmitMethod] = useState<'web3forms' | 'mailto' | null>(null);

  const canSubmit = name.trim().length > 0 && /.+@.+\..+/.test(email);

  // Web3Forms access key (free, no signup-by-the-end-user; one-time setup
  // by the toolkit maintainer at web3forms.com — paste the key into the
  // NEXT_PUBLIC_WEB3FORMS_KEY env var). When unset, falls back to mailto:.
  const web3FormsKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    // Path 1: Web3Forms backend if configured. POSTs the payload; their
    // service emails the maintainer with the structured fields.
    if (web3FormsKey) {
      setBusy(true);
      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(
            buildWeb3FormsPayload({ accessKey: web3FormsKey, name, email, orgName, report }),
          ),
        });
        if (res.ok) {
          setSubmitMethod('web3forms');
          setBusy(false);
          onSubmitted();
          return;
        }
        // Fall through to mailto on non-2xx (network unavailable, key
        // revoked, etc.) — better UX than failing silently.
      } catch {
        // Fall through to mailto
      } finally {
        setBusy(false);
      }
    }

    // Path 2: mailto: fallback. Works without any backend.
    setSubmitMethod('mailto');
    const href = buildMailto({ name, email, orgName, report });
    window.location.href = href;
    onSubmitted();
  }

  if (submitted) {
    const message =
      submitMethod === 'web3forms'
        ? `Thanks ${name}! Your score is on its way to ${email} — usually within a minute, sometimes the spam folder.`
        : `Your default email app should have opened with the score + your details pre-filled. Hit send and we'll reply with the PDF report.`;
    return (
      <div className="rounded-lg border border-emerald-300 bg-emerald-50 dark:bg-emerald-950 dark:border-emerald-900 p-4">
        <p className="text-sm text-foreground font-medium mb-1">✓ Score saved</p>
        <p className="text-xs text-muted-foreground">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border p-4 bg-card space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Email me my PDF report</h3>
      <p className="text-xs text-muted-foreground">
        Detailed PDF with prioritised recommendations + NDPA section references. Free.
      </p>
      <input
        type="text"
        required
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
      />
      <input
        type="email"
        required
        placeholder="Work email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
      />
      <input
        type="text"
        placeholder="Organisation (optional)"
        value={orgName}
        onChange={(e) => setOrgName(e.target.value)}
        className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={!canSubmit || busy}
        className="w-full rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
      >
        {busy ? 'Sending…' : 'Email me my report'}
      </button>
      <p className="text-[10px] text-muted-foreground leading-tight">
        We use this only to send the report; unsubscribe anytime. Stored per our{' '}
        <Link href="/privacy" className="underline">privacy policy</Link>.
      </p>
    </form>
  );
}
