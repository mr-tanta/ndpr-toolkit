'use client';

import { useMemo, useState } from 'react';
import {
  estimateDerivedDataSubjects,
  estimateStatutoryCeiling,
  type DerivedRelationshipKind,
} from '@tantainnovative/ndpr-toolkit/server';

interface Row {
  kind: DerivedRelationshipKind;
  label: string;
  enabled: boolean;
  perDirectSubject: string;
  coverage: string;
  mayIncludeChildren: boolean;
}

const INITIAL_ROWS: Row[] = [
  { kind: 'next_of_kin', label: 'Next of kin', enabled: false, perDirectSubject: '1', coverage: '100', mayIncludeChildren: false },
  { kind: 'guarantor', label: 'Guarantors', enabled: false, perDirectSubject: '1', coverage: '100', mayIncludeChildren: false },
  { kind: 'referee', label: 'Referees', enabled: false, perDirectSubject: '2', coverage: '100', mayIncludeChildren: false },
  { kind: 'dependant', label: 'Dependants', enabled: false, perDirectSubject: '1', coverage: '50', mayIncludeChildren: true },
  { kind: 'emergency_contact', label: 'Emergency contacts', enabled: false, perDirectSubject: '1', coverage: '100', mayIncludeChildren: false },
  { kind: 'uploaded_contact', label: 'Uploaded phone contacts', enabled: false, perDirectSubject: '', coverage: '100', mayIncludeChildren: false },
];

const fmt = (n: number) => n.toLocaleString('en-NG');
const toNumber = (s: string) => (s.trim() === '' ? NaN : Number(s));

export function DerivedSubjectsCalculator() {
  const [direct, setDirect] = useState('');
  const [rows, setRows] = useState<Row[]>(INITIAL_ROWS);
  const [overlap, setOverlap] = useState('0');
  const [revenue, setRevenue] = useState('');

  const update = (index: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const outcome = useMemo(() => {
    const directNum = toNumber(direct);
    if (!Number.isFinite(directNum) || directNum < 0) return { error: 'Enter your direct data-subject count to begin.' };
    try {
      const result = estimateDerivedDataSubjects({
        directSubjects: directNum,
        relationships: rows
          .filter((r) => r.enabled)
          .map((r) => ({
            kind: r.kind,
            label: r.label,
            perDirectSubject: toNumber(r.perDirectSubject),
            coverage: toNumber(r.coverage) / 100,
            mayIncludeChildren: r.mayIncludeChildren,
          })),
        overlapShare: toNumber(overlap) / 100,
      });
      const revenueNum = toNumber(revenue);
      const ceiling = Number.isFinite(revenueNum) && revenueNum >= 0
        ? estimateStatutoryCeiling({ annualGrossRevenueNGN: revenueNum, majorImportance: result.tiers.declared.isDCPMI })
        : undefined;
      return { result, ceiling };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Check your inputs.' };
    }
  }, [direct, rows, overlap, revenue]);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <label className="block">
          <span className="block text-sm font-medium text-foreground mb-1">
            Direct data subjects in the last six months
          </span>
          <span className="block text-xs text-muted-foreground mb-2">Customers, users, applicants, staff.</span>
          <input
            inputMode="numeric"
            value={direct}
            onChange={(e) => setDirect(e.target.value)}
            className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
            placeholder="e.g. 900"
          />
        </label>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-foreground mb-1">Who else is in your records?</legend>
          {rows.map((row, i) => (
            <div key={row.kind} className="rounded-lg border border-border p-3">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <input type="checkbox" checked={row.enabled} onChange={(e) => update(i, { enabled: e.target.checked })} />
                {row.label}
              </label>
              {row.enabled && (
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <label className="block">
                    <span className="block text-muted-foreground mb-1">Average per person who provides them</span>
                    <input
                      inputMode="decimal"
                      value={row.perDirectSubject}
                      onChange={(e) => update(i, { perDirectSubject: e.target.value })}
                      className="w-full rounded border border-border bg-background px-2 py-1"
                      placeholder={row.kind === 'uploaded_contact' ? 'from your own data' : ''}
                    />
                  </label>
                  <label className="block">
                    <span className="block text-muted-foreground mb-1">% of subjects who provide them</span>
                    <input
                      inputMode="decimal"
                      value={row.coverage}
                      onChange={(e) => update(i, { coverage: e.target.value })}
                      className="w-full rounded border border-border bg-background px-2 py-1"
                    />
                  </label>
                  <label className="col-span-2 flex items-center gap-2 text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={row.mayIncludeChildren}
                      onChange={(e) => update(i, { mayIncludeChildren: e.target.checked })}
                    />
                    May include children
                  </label>
                </div>
              )}
            </div>
          ))}
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="block font-medium text-foreground mb-1">Overlap %</span>
            <span className="block text-xs text-muted-foreground mb-2">Third parties counted twice.</span>
            <input
              inputMode="decimal"
              value={overlap}
              onChange={(e) => setOverlap(e.target.value)}
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="block font-medium text-foreground mb-1">Annual gross revenue (₦)</span>
            <span className="block text-xs text-muted-foreground mb-2">Optional, for the s.48(4) ceiling.</span>
            <input
              inputMode="numeric"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
        </div>
      </form>

      <section aria-live="polite" className="rounded-xl border border-border bg-card p-5 h-fit lg:sticky lg:top-24">
        {'error' in outcome ? (
          <p className="text-sm text-muted-foreground">{outcome.error}</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Direct</p>
                <p className="text-2xl font-bold text-foreground">{fmt(outcome.result.direct)}</p>
                <p className="text-xs">Tier {outcome.result.tiers.declared.tier}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Third parties</p>
                <p className="text-2xl font-bold text-foreground">{fmt(outcome.result.derived.estimated)}</p>
                <p className="text-xs">people to reach</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">If counted</p>
                <p className="text-2xl font-bold text-foreground">{fmt(outcome.result.directPlusDerived.estimated)}</p>
                <p className="text-xs">Tier {outcome.result.tiers.withDerived.tier}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Whether third parties count toward your tier is for the NDPC to determine. Report both numbers.
            </p>
            {outcome.result.notes.length > 0 && (
              <ul className="list-disc pl-5 space-y-2 text-sm text-foreground">
                {outcome.result.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            )}
            {outcome.ceiling && (
              <div className="border-t border-border pt-3 text-sm">
                <p className="text-foreground">
                  Statutory ceiling ({outcome.ceiling.citation}): <strong>₦{fmt(outcome.ceiling.ceilingNGN)}</strong>
                </p>
                <p className="text-xs text-muted-foreground mt-1">{outcome.ceiling.notice}</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
