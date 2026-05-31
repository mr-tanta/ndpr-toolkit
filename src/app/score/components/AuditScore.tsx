'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  getComplianceScore,
  classifyDCPMI,
  generateComplianceAuditReturn,
  type ComplianceInput,
  type ComplianceReport,
  type RecommendationPriority,
} from '@tantainnovative/ndpr-toolkit/server';

/* ──────────────────────────────────────────────────────────────────────────
 * Default state — flags start false ("haven't done it"); policy/RoPA dates
 * start EMPTY so an untouched audit is honestly scored as stale.
 * ────────────────────────────────────────────────────────────────────────── */

const DEFAULT_INPUT: ComplianceInput = {
  consent: { hasConsentMechanism: false, hasPurposeSpecification: false, hasWithdrawalMechanism: false, hasMinorProtection: false, consentRecordsRetained: false },
  dsr: { hasRequestMechanism: false, supportsAccess: false, supportsRectification: false, supportsErasure: false, supportsPortability: false, supportsObjection: false, responseTimelineDays: 30 },
  dpia: { conductedForHighRisk: false, documentedRisks: false, mitigationMeasures: false },
  breach: { hasNotificationProcess: false, notifiesWithin72Hours: false, hasRiskAssessment: false, hasRecordKeeping: false },
  policy: { hasPrivacyPolicy: false, isPubliclyAccessible: false, lastUpdated: '', coversAllSections: false },
  lawfulBasis: { documentedForAllProcessing: false, hasLegitimateInterestAssessment: false },
  crossBorder: { hasTransferMechanisms: false, adequacyAssessed: false, ndpcApprovalObtained: false },
  ropa: { maintained: false, includesAllProcessing: false, lastReviewed: '' },
};

interface ProfileState {
  dataSubjectsInSixMonths: number;
  commencementDate: string;
}
const DEFAULT_PROFILE: ProfileState = { dataSubjectsInSixMonths: 0, commencementDate: '' };
const STORAGE_KEY = 'ndpr-audit-state-v2';

type SectionConfig = {
  id: keyof ComplianceInput;
  title: string;
  ndpa: string;
  questions: ReadonlyArray<{ key: string; label: string }>;
};

const SECTIONS: SectionConfig[] = [
  {
    id: 'consent', title: 'Consent', ndpa: 'NDPA Sections 25–26',
    questions: [
      { key: 'hasConsentMechanism', label: 'We have a cookie / consent banner on every public-facing page.' },
      { key: 'hasPurposeSpecification', label: 'Each consent option lists a specific, named purpose.' },
      { key: 'hasWithdrawalMechanism', label: 'Users can withdraw consent as easily as they gave it (Section 26).' },
      { key: 'hasMinorProtection', label: 'Where applicable, we collect parental consent for minors (Section 31).' },
      { key: 'consentRecordsRetained', label: 'We keep an audit log of every consent decision (who, when, what, version).' },
    ],
  },
  {
    id: 'dsr', title: 'Data Subject Rights', ndpa: 'NDPA Part VI (Sections 34–38)',
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
    id: 'dpia', title: 'DPIA', ndpa: 'NDPA Section 28',
    questions: [
      { key: 'conductedForHighRisk', label: 'We complete a DPIA before any high-risk processing (Section 28(1)).' },
      { key: 'documentedRisks', label: 'Each DPIA documents identified risks to data subjects.' },
      { key: 'mitigationMeasures', label: 'Each DPIA includes mitigation measures and residual-risk acceptance.' },
    ],
  },
  {
    id: 'breach', title: 'Breach Notification', ndpa: 'NDPA Section 40',
    questions: [
      { key: 'hasNotificationProcess', label: 'We have a documented breach-notification process.' },
      { key: 'notifiesWithin72Hours', label: 'Our process can notify NDPC within 72 hours of discovery (Section 40(2)).' },
      { key: 'hasRiskAssessment', label: 'Every breach triggers a risk assessment to determine notification need.' },
      { key: 'hasRecordKeeping', label: 'We maintain a breach register with all incidents and actions.' },
    ],
  },
  {
    id: 'policy', title: 'Privacy Policy', ndpa: 'NDPA Section 27',
    questions: [
      { key: 'hasPrivacyPolicy', label: 'We publish a privacy policy.' },
      { key: 'isPubliclyAccessible', label: 'The privacy policy is reachable from every page (usually footer).' },
      { key: 'coversAllSections', label: 'The policy covers every Section 27(1) disclosure (lawful basis, retention, rights, NDPC complaint route).' },
    ],
  },
  {
    id: 'lawfulBasis', title: 'Lawful Basis', ndpa: 'NDPA Section 25',
    questions: [
      { key: 'documentedForAllProcessing', label: 'We have documented a lawful basis for every processing activity.' },
      { key: 'hasLegitimateInterestAssessment', label: 'Where we rely on legitimate interest, we have a written LIA.' },
    ],
  },
  {
    id: 'crossBorder', title: 'Cross-Border Transfer', ndpa: 'NDPA Sections 41–43',
    questions: [
      { key: 'hasTransferMechanisms', label: 'We have an appropriate transfer mechanism for every cross-border data flow.' },
      { key: 'adequacyAssessed', label: 'We have assessed the adequacy of each destination country (Section 42).' },
      { key: 'ndpcApprovalObtained', label: 'Where required, we have obtained NDPC approval (BCRs, codes of conduct, certifications).' },
    ],
  },
  {
    id: 'ropa', title: 'Record of Processing Activities', ndpa: 'NDPA Section 29',
    questions: [
      { key: 'maintained', label: 'We maintain a Record of Processing Activities (RoPA).' },
      { key: 'includesAllProcessing', label: 'The RoPA covers every processing activity across the organisation.' },
    ],
  },
];

const MODULE_LABELS: Record<string, string> = {
  consent: 'Consent', dsr: 'Data Subject Rights', dpia: 'DPIA', breach: 'Breach Notification',
  policy: 'Privacy Policy', lawfulBasis: 'Lawful Basis', crossBorder: 'Cross-Border', ropa: 'RoPA',
};

const TOTAL_QUESTIONS = SECTIONS.reduce((n, s) => n + s.questions.length, 0);

/* ── Rating helpers ───────────────────────────────────────────────────────── */

type Rating = ComplianceReport['rating'];

const RATING_HEX: Record<Rating, string> = {
  excellent: '#10b981', good: '#3b82f6', 'needs-work': '#f97316', critical: '#ef4444',
};

function ratingColor(rating: Rating): string {
  switch (rating) {
    case 'excellent': return 'text-emerald-500';
    case 'good': return 'text-blue-500';
    case 'needs-work': return 'text-orange-500';
    case 'critical': return 'text-red-500';
    default: return 'text-foreground';
  }
}

function moduleRating(score: number): Rating {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'needs-work';
  return 'critical';
}

function ratingSummary(rating: Rating, score: number): string {
  switch (rating) {
    case 'excellent': return `Strong NDPA posture at ${score}/100. Verify with your DPO and keep RoPA + policy reviews current.`;
    case 'good': return `Solid foundations at ${score}/100. A few high-priority gaps to close — see the recommendations below.`;
    case 'needs-work': return `Material gaps at ${score}/100. Multiple critical items below — prioritise the red items first.`;
    case 'critical': return `Significant exposure at ${score}/100. Engage your DPO immediately and start with the critical items.`;
    default: return `${score}/100`;
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

const ngn = (n: number) => `₦${n.toLocaleString('en-NG')}`;

/* ── Circular score gauge ─────────────────────────────────────────────────── */

function ScoreGauge({ score, rating, size = 160 }: { score: number; rating: Rating; size?: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const dash = (pct / 100) * c;
  const color = RATING_HEX[rating] ?? '#3b82f6';
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
        <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeWidth="9" className="text-border" opacity={0.3} />
        <circle
          cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`} transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dasharray 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-5xl font-bold ${ratingColor(rating)}`}>{score}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

/* ── GAID 2025 registration card ──────────────────────────────────────────── */

function GaidCard({ profile }: { profile: ProfileState }) {
  const dcpmi = useMemo(
    () => classifyDCPMI({ dataSubjectsInSixMonths: profile.dataSubjectsInSixMonths }),
    [profile.dataSubjectsInSixMonths],
  );
  const filesCAR = dcpmi.tier === 'UHL' || dcpmi.tier === 'EHL';
  const car = useMemo(
    () => (profile.commencementDate && filesCAR
      ? generateComplianceAuditReturn({ commencementDate: profile.commencementDate, tier: dcpmi.tier })
      : null),
    [profile.commencementDate, filesCAR, dcpmi.tier],
  );

  return (
    <div className="rounded-lg border border-border p-4 bg-card">
      <h3 className="text-sm font-semibold text-foreground mb-1">GAID 2025 registration</h3>
      {!dcpmi.isDCPMI ? (
        <p className="text-xs text-muted-foreground">
          Below the threshold for a Data Controller/Processor of Major Importance by volume. Add your six-month
          data-subject count to check.
        </p>
      ) : (
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Tier</span><span className="font-semibold text-foreground">{dcpmi.tier}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Annual registration fee</span><span className="font-semibold text-foreground">{ngn(dcpmi.annualFeeNGN)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Obligation</span><span className="font-medium text-foreground text-right">{filesCAR ? 'Register once + file CAR annually' : 'Renew registration annually (no CAR)'}</span></div>
          {car && (
            <div className="flex justify-between"><span className="text-muted-foreground">Next CAR deadline</span><span className="font-medium text-foreground">{car.schedule.nextFilingDeadline} ({car.status.daysUntilNextDeadline}d)</span></div>
          )}
          {filesCAR && !profile.commencementDate && (
            <p className="text-muted-foreground pt-1">Add your commencement date to compute CAR dates.</p>
          )}
        </div>
      )}
      <Link href="/docs/guides/dcpmi-registration" className="mt-2 inline-block text-xs text-primary hover:underline">DCPMI guide →</Link>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Main component — launch card + cinematic full-screen audit
 * ────────────────────────────────────────────────────────────────────────── */

export function AuditScore() {
  const [input, setInput] = useState<ComplianceInput>(DEFAULT_INPUT);
  const [profile, setProfile] = useState<ProfileState>(DEFAULT_PROFILE);
  const [step, setStep] = useState(0);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.input) setInput(saved.input);
        if (saved.profile) setProfile(saved.profile);
        if (typeof saved.step === 'number') setStep(saved.step);
      }
    } catch { /* ignore corrupt storage */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ input, profile, step })); } catch { /* ignore */ }
  }, [input, profile, step, hydrated]);

  const report = useMemo(() => getComplianceScore(input), [input]);

  const recStats = useMemo(() => {
    let critical = 0, high = 0;
    for (const r of report.recommendations) {
      if (r.priority === 'critical') critical++;
      else if (r.priority === 'high') high++;
    }
    return { critical, high, total: report.recommendations.length };
  }, [report.recommendations]);

  const dcpmiTier = useMemo(
    () => classifyDCPMI({ dataSubjectsInSixMonths: profile.dataSubjectsInSixMonths }).tier,
    [profile.dataSubjectsInSixMonths],
  );

  const toggleFlag = useCallback((sectionId: keyof ComplianceInput, key: string, checked: boolean) => {
    setInput((prev) => ({ ...prev, [sectionId]: { ...(prev[sectionId] as Record<string, unknown>), [key]: checked } }));
  }, []);
  const setPolicyDate = useCallback((iso: string) => setInput((prev) => ({ ...prev, policy: { ...prev.policy, lastUpdated: iso } })), []);
  const setRopaDate = useCallback((iso: string) => setInput((prev) => ({ ...prev, ropa: { ...prev.ropa, lastReviewed: iso } })), []);
  const setResponseDays = useCallback((days: number) => setInput((prev) => ({ ...prev, dsr: { ...prev.dsr, responseTimelineDays: Math.max(0, Math.min(365, days)) } })), []);

  const gaidSummary = useMemo(() => buildGaidSummary(profile), [profile]);

  const TOTAL = SECTIONS.length + 1; // profile + sections
  const isResults = step >= TOTAL;
  const isLastQuestionStep = step === TOTAL - 1;
  const goNext = useCallback(() => setStep((s) => Math.min(TOTAL, s + 1)), [TOTAL]);
  const goBack = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  const answered = useMemo(() => {
    let n = 0;
    for (const s of SECTIONS) {
      const v = input[s.id] as Record<string, unknown>;
      for (const q of s.questions) if (v[q.key]) n++;
    }
    return n;
  }, [input]);
  const hasProgress = answered > 0 || step > 0 || profile.dataSubjectsInSixMonths > 0;

  const restart = useCallback(() => {
    setInput(DEFAULT_INPUT);
    setProfile(DEFAULT_PROFILE);
    setSubmitted(false);
    setStep(0);
    setStarted(true);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  // Lock body scroll + Esc to close while the full-screen audit is open.
  useEffect(() => {
    if (!started) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setStarted(false); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [started]);

  // Animate the score count-up when the results screen appears.
  useEffect(() => {
    if (!(started && isResults)) { setDisplayScore(report.score); return; }
    let raf = 0;
    const to = report.score;
    let t0 = 0;
    const tick = (t: number) => {
      if (!t0) t0 = t;
      const p = Math.min(1, (t - t0) / 900);
      setDisplayScore(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, isResults, report.score]);

  const section = step >= 1 && step < TOTAL ? SECTIONS[step - 1] : null;

  return (
    <>
      {/* ── Launch card (on the page) ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 sm:p-12 text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(ellipse 70% 60% at 50% -20%, rgba(56,189,248,0.12), transparent 70%)' }}
        />
        <div className="relative">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">See your NDPA compliance score</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            A guided, full-screen walkthrough of the eight NDPA modules and your NDPC GAID 2025 registration.
            No signup to see your score.
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-5 text-sm text-muted-foreground">
            <span>✓ ~{TOTAL_QUESTIONS} questions</span>
            <span>✓ ~5 minutes</span>
            <span>✓ Free, no signup</span>
            <span>✓ GAID 2025 ready</span>
          </div>
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-8 py-3.5 text-base font-semibold shadow-lg hover:opacity-90 hover:scale-[1.02] transition"
          >
            {hasProgress ? (isResults ? 'View your results' : 'Resume audit') : 'Start the audit'}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </button>
          {hasProgress && (
            <div className="mt-3">
              <button type="button" onClick={restart} className="text-xs text-muted-foreground hover:text-foreground transition">or start over</button>
            </div>
          )}
        </div>
      </div>

      {/* ── Full-screen cinematic overlay ─────────────────────────────────── */}
      {started && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="NDPA compliance audit"
          className="fixed inset-0 z-[200] overflow-y-auto bg-background"
          style={{ backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(56,189,248,0.10), transparent 70%)' }}
        >
          <div className="min-h-full flex flex-col">
            {/* Top bar */}
            <header className="sticky top-0 z-10 flex items-center gap-4 px-4 sm:px-6 py-3 border-b border-border/60 bg-background/80 backdrop-blur">
              {!isResults ? (
                <>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">Step {step + 1} / {TOTAL}</span>
                  <div
                    className="flex-1 h-1.5 rounded bg-border/40 overflow-hidden"
                    role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={TOTAL} aria-label="Audit progress"
                  >
                    <div className="h-full rounded bg-primary transition-all duration-300" style={{ width: `${((step + 1) / TOTAL) * 100}%` }} />
                  </div>
                </>
              ) : (
                <span className="flex-1 text-sm font-medium text-foreground">Your results</span>
              )}
              <span className="text-sm whitespace-nowrap">
                <span className="text-muted-foreground">Score </span>
                <span className={`font-semibold ${ratingColor(report.rating)}`}>{isResults ? displayScore : report.score}</span>
              </span>
              <button
                type="button"
                onClick={() => setStarted(false)}
                aria-label="Close audit"
                className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-card transition"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </header>

            {/* Step / results body */}
            <main className={`flex-1 flex justify-center px-4 sm:px-6 ${isResults ? 'items-start py-8' : 'items-center py-10'}`}>
              <div key={isResults ? 'results' : `step-${step}`} className="w-full max-w-2xl animate-fade-in-up">
                {isResults ? (
                  /* ── Results ──────────────────────────────────────────── */
                  <div>
                    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 mb-6 flex flex-col items-center text-center">
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0"
                        style={{ backgroundImage: `radial-gradient(ellipse 70% 60% at 50% -10%, ${RATING_HEX[report.rating]}22, transparent 70%)` }}
                      />
                      <div className="relative flex flex-col items-center">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Your NDPA compliance score</p>
                        <ScoreGauge score={displayScore} rating={report.rating} size={184} />
                        <span className={`mt-4 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${ratingColor(report.rating)}`} style={{ borderColor: `${RATING_HEX[report.rating]}55`, background: `${RATING_HEX[report.rating]}11` }}>
                          {report.rating}
                        </span>
                        <p aria-live="polite" className="text-sm text-muted-foreground mt-3 max-w-md">{ratingSummary(report.rating, report.score)}</p>

                        {/* Headline stat pills */}
                        <div className="flex flex-wrap justify-center gap-2 mt-5">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs">
                            <span className="font-semibold text-red-500">{recStats.critical}</span><span className="text-muted-foreground">critical</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs">
                            <span className="font-semibold text-orange-500">{recStats.high}</span><span className="text-muted-foreground">high</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs">
                            <span className="font-semibold text-foreground">{recStats.total}</span><span className="text-muted-foreground">total gaps</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs">
                            <span className="text-muted-foreground">DCPMI</span><span className="font-semibold text-foreground">{dcpmiTier === 'none' ? '—' : dcpmiTier}</span>
                          </span>
                        </div>

                        <div className="flex flex-wrap justify-center gap-2 mt-6">
                          <button type="button" onClick={() => setStep(0)} className="rounded-lg border border-border bg-background px-4 py-2 text-sm hover:bg-card transition">Edit answers</button>
                          <button type="button" onClick={() => window.print()} className="rounded-lg border border-border bg-background px-4 py-2 text-sm hover:bg-card transition">Print / save as PDF</button>
                          <button type="button" onClick={restart} className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition">Start over</button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div className="rounded-lg border border-border p-4 bg-card">
                        <h3 className="text-sm font-semibold text-foreground mb-3">By module</h3>
                        <ul className="space-y-2.5 text-xs">
                          {Object.entries(report.modules).map(([key, mod]) => {
                            const r = moduleRating(mod.score);
                            return (
                              <li key={key}>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-muted-foreground">{MODULE_LABELS[key] ?? key}</span>
                                  <span className={`font-medium ${ratingColor(r)}`}>{Math.round(mod.score)}</span>
                                </div>
                                <div className="h-1.5 w-full rounded bg-border/40 overflow-hidden">
                                  <div className="h-full rounded" style={{ width: `${Math.round(mod.score)}%`, background: RATING_HEX[r] }} />
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                      <GaidCard profile={profile} />
                    </div>

                    <section className="rounded-lg border border-border p-6 bg-card mb-6">
                      <h2 className="text-lg font-semibold text-foreground mb-1">Prioritised recommendations</h2>
                      <p className="text-sm text-muted-foreground mb-4">
                        {report.recommendations.length === 0
                          ? 'No gaps detected — verify with your DPO before relying on this result.'
                          : `${report.recommendations.length} gap${report.recommendations.length === 1 ? '' : 's'} identified, sorted by priority.`}
                      </p>
                      <ul className="space-y-3">
                        {report.recommendations.map((r, i) => (
                          <li key={i} className={`rounded-md border p-3 ${priorityColor(r.priority)}`}>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-xs font-semibold uppercase tracking-wider">{r.priority}</span>
                              <span className="text-xs text-muted-foreground">·</span>
                              <span className="text-xs text-muted-foreground">{MODULE_LABELS[r.module] ?? r.module}</span>
                              <span className="text-xs text-muted-foreground">·</span>
                              <span className="text-xs text-muted-foreground">{r.ndpaSection}</span>
                            </div>
                            <p className="text-sm text-foreground font-medium mb-1">{r.label}</p>
                            <p className="text-sm text-muted-foreground">{r.recommendation}</p>
                          </li>
                        ))}
                      </ul>
                    </section>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-10">
                      <EmailCaptureForm report={report} gaidSummary={gaidSummary} submitted={submitted} onSubmitted={() => setSubmitted(true)} />
                      <div className="space-y-3">
                        <Link href="/docs/guides/audit-cli" className="block w-full text-center rounded-lg border border-border px-4 py-3 text-sm hover:bg-card transition">Automate this in CI with <code>ndpr audit</code> →</Link>
                        <Link href="/docs" className="block w-full text-center rounded-lg border border-border px-4 py-3 text-sm hover:bg-card transition">See full toolkit docs →</Link>
                        <p className="text-xs text-muted-foreground italic px-1">For guidance only. Not legal advice — verify with your DPO. Answers are saved only in this browser.</p>
                      </div>
                    </div>
                  </div>
                ) : step === 0 ? (
                  /* ── Profile step ─────────────────────────────────────── */
                  <div>
                    <p className="text-xs uppercase tracking-wider text-primary mb-2">NDPC GAID 2025 — registration &amp; audit returns</p>
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground">About your organisation</h2>
                    <p className="text-muted-foreground mt-2 mb-7">Two quick questions set your DCPMI tier and audit deadlines. Both are optional — skip if unsure.</p>
                    <div className="space-y-6">
                      <label className="block">
                        <span className="text-base font-medium text-foreground">Distinct data subjects processed in the last 6 months</span>
                        <input
                          type="number" min={0}
                          value={profile.dataSubjectsInSixMonths || ''}
                          onChange={(e) => setProfile((p) => ({ ...p, dataSubjectsInSixMonths: Math.max(0, Number(e.target.value) || 0) }))}
                          placeholder="e.g. 6200"
                          className="mt-2 w-48 rounded-lg border border-border bg-card px-3 py-2.5 text-base"
                        />
                        <span className="block text-sm text-muted-foreground mt-1.5">Over 200 may make you a DCPMI; over 5,000 is UHL.</span>
                      </label>
                      <label className="block">
                        <span className="text-base font-medium text-foreground">Date you commenced processing personal data</span>
                        <input
                          type="date" value={profile.commencementDate}
                          onChange={(e) => setProfile((p) => ({ ...p, commencementDate: e.target.value }))}
                          className="mt-2 block rounded-lg border border-border bg-card px-3 py-2.5 text-base"
                        />
                        <span className="block text-sm text-muted-foreground mt-1.5">Used to compute your initial audit (+15 months) and next CAR deadline.</span>
                      </label>
                    </div>
                  </div>
                ) : section ? (
                  /* ── Module step ──────────────────────────────────────── */
                  <div>
                    <p className="text-xs uppercase tracking-wider text-primary mb-2">{section.ndpa}</p>
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{section.title}</h2>
                    <p className="text-muted-foreground mt-2 mb-6">Tick everything your organisation already does.</p>
                    <div className="space-y-2.5">
                      {section.questions.map((q) => {
                        const checked = Boolean((input[section.id] as Record<string, unknown>)[q.key]);
                        return (
                          <label
                            key={q.key}
                            className={`flex items-start gap-3 cursor-pointer rounded-xl border p-4 transition ${checked ? 'border-primary/60 bg-primary/5' : 'border-border hover:border-foreground/30 hover:bg-card'}`}
                          >
                            <input
                              type="checkbox" checked={checked}
                              onChange={(e) => toggleFlag(section.id, q.key, e.target.checked)}
                              className="mt-0.5 h-5 w-5 rounded border-gray-400 text-primary focus:ring-primary"
                            />
                            <span className="text-base text-foreground">{q.label}</span>
                          </label>
                        );
                      })}
                      {section.id === 'dsr' && (
                        <label className="flex items-center gap-3 mt-3 px-1">
                          <span className="text-sm text-foreground">Typical response time</span>
                          <input type="number" min={1} max={120} value={input.dsr.responseTimelineDays} onChange={(e) => setResponseDays(Number(e.target.value))} className="w-20 rounded border border-border bg-card px-2 py-1 text-sm" />
                          <span className="text-sm text-muted-foreground">days (guidance: 30)</span>
                        </label>
                      )}
                      {section.id === 'policy' && (
                        <label className="flex items-center gap-3 mt-3 px-1">
                          <span className="text-sm text-foreground">Privacy policy last updated</span>
                          <input type="date" value={input.policy.lastUpdated} onChange={(e) => setPolicyDate(e.target.value)} className="rounded border border-border bg-card px-2 py-1 text-sm" />
                        </label>
                      )}
                      {section.id === 'ropa' && (
                        <label className="flex items-center gap-3 mt-3 px-1">
                          <span className="text-sm text-foreground">RoPA last reviewed</span>
                          <input type="date" value={input.ropa.lastReviewed} onChange={(e) => setRopaDate(e.target.value)} className="rounded border border-border bg-card px-2 py-1 text-sm" />
                        </label>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </main>

            {/* Footer nav (question steps only) */}
            {!isResults && (
              <footer className="sticky bottom-0 border-t border-border/60 bg-background/80 backdrop-blur">
                <div className="max-w-2xl mx-auto w-full flex items-center justify-between gap-3 px-4 sm:px-6 py-3">
                  <button type="button" onClick={goBack} disabled={step === 0} className="rounded-lg border border-border px-5 py-2.5 text-sm hover:bg-card transition disabled:opacity-40 disabled:cursor-not-allowed">← Back</button>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setStep(TOTAL)} className="text-xs text-muted-foreground hover:text-foreground transition">Skip to results</button>
                    <button type="button" onClick={goNext} className="rounded-lg bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition">{isLastQuestionStep ? 'See my results →' : 'Next →'}</button>
                  </div>
                </div>
              </footer>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* ── GAID summary (for the emailed digest) ────────────────────────────────── */

function buildGaidSummary(profile: ProfileState): string {
  if (!profile.dataSubjectsInSixMonths) return 'Not provided.';
  const dcpmi = classifyDCPMI({ dataSubjectsInSixMonths: profile.dataSubjectsInSixMonths });
  if (!dcpmi.isDCPMI) return `Below DCPMI threshold (${profile.dataSubjectsInSixMonths} data subjects / 6 months).`;
  const filesCAR = dcpmi.tier === 'UHL' || dcpmi.tier === 'EHL';
  const lines = [
    `Tier: ${dcpmi.tier} (registration fee ${ngn(dcpmi.annualFeeNGN)}/yr)`,
    filesCAR ? 'Files Compliance Audit Returns annually.' : 'Renews registration annually (no CAR).',
  ];
  if (filesCAR && profile.commencementDate) {
    const car = generateComplianceAuditReturn({ commencementDate: profile.commencementDate, tier: dcpmi.tier });
    lines.push(`Initial audit due ${car.schedule.initialAuditDueDate}; next CAR deadline ${car.schedule.nextFilingDeadline}.`);
  }
  return lines.join(' ');
}

/* ── Email capture ────────────────────────────────────────────────────────── */

interface EmailCaptureProps {
  report: ComplianceReport;
  gaidSummary: string;
  submitted: boolean;
  onSubmitted: () => void;
}

function buildMailto(input: { name: string; email: string; orgName: string; report: ComplianceReport; gaidSummary: string }): string {
  const { name, email, orgName, report, gaidSummary } = input;
  const subject = `NDPA audit score: ${report.score}/100 (${report.rating}) — ${orgName || name || 'audit request'}`;
  const moduleLines = Object.entries(report.modules).map(([k, m]) => `- ${MODULE_LABELS[k] ?? k}: ${Math.round(m.score)}/100 (${moduleRating(m.score)})`).join('\n');
  const topRecs = report.recommendations.slice(0, 10).map((r, i) => `${i + 1}. [${r.priority.toUpperCase()}] ${r.label} — ${r.ndpaSection}\n   ${r.recommendation}`).join('\n\n');
  const body = `Hi NDPR Toolkit team,

I just ran the audit at ndprtoolkit.com.ng/score and would like the PDF report.

Name: ${name}
Email: ${email}
Organisation: ${orgName || 'n/a'}

──────── Audit summary ────────
Overall: ${report.score}/100 (${report.rating})

GAID 2025: ${gaidSummary}

Per-module:
${moduleLines}

──────── Top recommendations ────────
${topRecs || 'No gaps detected.'}

Generated at: ${report.generatedAt}

Thanks!`;
  return `mailto:hello@ndprtoolkit.com.ng?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function buildWeb3FormsPayload(input: { accessKey: string; name: string; email: string; orgName: string; report: ComplianceReport; gaidSummary: string }): Record<string, string> {
  const { accessKey, name, email, orgName, report, gaidSummary } = input;
  const moduleLines = Object.entries(report.modules).map(([k, m]) => `- ${MODULE_LABELS[k] ?? k}: ${Math.round(m.score)}/100 (${moduleRating(m.score)})`).join('\n');
  const topRecs = report.recommendations.slice(0, 10).map((r, i) => `${i + 1}. [${r.priority.toUpperCase()}] ${r.label} — ${r.ndpaSection}\n   ${r.recommendation}`).join('\n\n');
  return {
    access_key: accessKey,
    subject: `NDPA audit score: ${report.score}/100 (${report.rating}) — ${orgName || name || 'audit request'}`,
    from_name: name,
    email,
    organisation: orgName || 'n/a',
    score: String(report.score),
    rating: report.rating,
    gaid_2025: gaidSummary,
    generated_at: report.generatedAt,
    per_module: moduleLines,
    top_recommendations: topRecs || 'No gaps detected.',
  };
}

function EmailCaptureForm({ report, gaidSummary, submitted, onSubmitted }: EmailCaptureProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [orgName, setOrgName] = useState('');
  const [busy, setBusy] = useState(false);
  const [submitMethod, setSubmitMethod] = useState<'web3forms' | 'mailto' | null>(null);

  const canSubmit = name.trim().length > 0 && /.+@.+\..+/.test(email);
  const web3FormsKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    if (web3FormsKey) {
      setBusy(true);
      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(buildWeb3FormsPayload({ accessKey: web3FormsKey, name, email, orgName, report, gaidSummary })),
        });
        if (res.ok) { setSubmitMethod('web3forms'); setBusy(false); onSubmitted(); return; }
      } catch { /* fall through to mailto */ } finally { setBusy(false); }
    }
    setSubmitMethod('mailto');
    window.location.href = buildMailto({ name, email, orgName, report, gaidSummary });
    onSubmitted();
  }

  if (submitted) {
    const message = submitMethod === 'web3forms'
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
      <p className="text-xs text-muted-foreground">Detailed PDF with prioritised recommendations + NDPA section references. Free.</p>
      <input type="text" required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded border border-border bg-background px-3 py-2 text-sm" />
      <input type="email" required placeholder="Work email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded border border-border bg-background px-3 py-2 text-sm" />
      <input type="text" placeholder="Organisation (optional)" value={orgName} onChange={(e) => setOrgName(e.target.value)} className="w-full rounded border border-border bg-background px-3 py-2 text-sm" />
      <button type="submit" disabled={!canSubmit || busy} className="w-full rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50">{busy ? 'Sending…' : 'Email me my report'}</button>
      <p className="text-[10px] text-muted-foreground leading-tight">We use this only to send the report; unsubscribe anytime. Stored per our <Link href="/privacy" className="underline">privacy policy</Link>.</p>
    </form>
  );
}
