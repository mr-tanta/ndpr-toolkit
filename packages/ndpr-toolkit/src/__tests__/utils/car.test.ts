import { generateComplianceAuditReturn } from '../../utils/car';

describe('generateComplianceAuditReturn (NDPC GAID 2025 — Compliance Audit Returns)', () => {
  it('computes the initial audit due date as commencement + 15 months', () => {
    const r = generateComplianceAuditReturn({ commencementDate: '2025-01-15', asOf: '2025-06-01', tier: 'UHL' });
    expect(r.schedule.initialAuditDueDate).toBe('2026-04-15');
    expect(r.schedule.initialAuditWithinMonths).toBe(15);
  });

  it('applies the recorded 2026 deadline extension by default', () => {
    const r = generateComplianceAuditReturn({ commencementDate: '2024-01-01', asOf: '2026-01-10', tier: 'UHL' });
    expect(r.schedule.nextFilingDeadline).toBe('2026-05-30');
    expect(r.schedule.filingYear).toBe(2026);
  });

  it('rolls to next year once the extended deadline has passed', () => {
    const r = generateComplianceAuditReturn({ commencementDate: '2024-01-01', asOf: '2026-05-31', tier: 'UHL' });
    expect(r.schedule.nextFilingDeadline).toBe('2027-03-31');
    expect(r.schedule.filingYear).toBe(2027);
    expect(r.status.missedFilingYears).toContain(2026);
  });

  it('honours a caller-supplied per-year deadline override', () => {
    const r = generateComplianceAuditReturn(
      { commencementDate: '2024-01-01', asOf: '2027-04-01', tier: 'UHL' },
      { deadlineOverrides: { 2027: '2027-04-30' } },
    );
    expect(r.schedule.nextFilingDeadline).toBe('2027-04-30');
    expect(r.schedule.filingYear).toBe(2027);
  });

  it.each([
    ['leading zero', '02027', '2027-04-30'],
    ['leading plus', '+2027', '2027-04-30'],
    ['sign', '-2027', '2027-04-30'],
    ['decimal', '2027.0', '2027-04-30'],
    ['below the supported range', '1999', '1999-04-30'],
    ['above the supported range', '10000', '9999-04-30'],
  ])('rejects a %s override year key before lookup', (_label, year, deadline) => {
    const deadlineOverrides = { [year]: deadline } as unknown as Record<number, string>;
    expect(() => generateComplianceAuditReturn(
      { commencementDate: '2024-01-01', asOf: '2027-04-01', tier: 'UHL' },
      { deadlineOverrides },
    )).toThrow(/canonical four-digit year from 2000 to 9999/i);
  });

  it('rejects inherited deadline overrides instead of silently ignoring them', () => {
    const deadlineOverrides = Object.create({ 2027: '2027-04-30' }) as Record<number, string>;
    expect(() => generateComplianceAuditReturn(
      { commencementDate: '2024-01-01', asOf: '2027-04-01', tier: 'UHL' },
      { deadlineOverrides },
    )).toThrow(/plain object or null-prototype record/i);
  });

  it('rejects deadline accessors without invoking them', () => {
    let reads = 0;
    const deadlineOverrides = {} as Record<number, string>;
    Object.defineProperty(deadlineOverrides, '2027', {
      enumerable: true,
      get() {
        reads += 1;
        throw new Error('must not execute');
      },
    });

    expect(() => generateComplianceAuditReturn(
      { commencementDate: '2024-01-01', asOf: '2027-04-01', tier: 'UHL' },
      { deadlineOverrides },
    )).toThrow(/enumerable data property/i);
    expect(reads).toBe(0);
  });

  it('rejects top-level option accessors without invoking them', () => {
    let reads = 0;
    const options = {} as Parameters<typeof generateComplianceAuditReturn>[1];
    Object.defineProperty(options, 'rulesetId', {
      enumerable: true,
      get() {
        reads += 1;
        throw new Error('must not execute');
      },
    });

    expect(() => generateComplianceAuditReturn(
      { commencementDate: '2024-01-01', asOf: '2027-04-01', tier: 'UHL' },
      options,
    )).toThrow(/options\.rulesetId.*enumerable data property/i);
    expect(reads).toBe(0);
  });

  it.each([
    ['empty ruleset ID', { rulesetId: '' }, /rulesetId.*non-empty string/i],
    ['empty ruleset version', { rulesetVersion: '   ' }, /rulesetVersion.*non-empty string/i],
    ['impossible effective date', { rulesetEffectiveDate: '2026-02-30' }, /rulesetEffectiveDate.*real calendar date/i],
  ])('rejects %s', (_label, options, expected) => {
    expect(() => generateComplianceAuditReturn(
      { commencementDate: '2024-01-01', asOf: '2026-03-21', tier: 'UHL' },
      options,
    )).toThrow(expected);
  });

  it('retains year/date correlation for canonical override keys', () => {
    expect(() => generateComplianceAuditReturn(
      { commencementDate: '2024-01-01', asOf: '2027-04-01', tier: 'UHL' },
      { deadlineOverrides: { 2027: '2026-04-30' } },
    )).toThrow(/deadlineOverrides\.2027.*within year 2027/i);
  });

  it('computes whole days until the next filing deadline', () => {
    const r = generateComplianceAuditReturn({ commencementDate: '2024-01-01', asOf: '2026-03-21', tier: 'UHL' });
    expect(r.status.daysUntilNextDeadline).toBe(70); // 2026-03-21 → 2026-05-30
  });

  it('flags whether the initial audit obligation has arisen relative to asOf', () => {
    const before = generateComplianceAuditReturn({ commencementDate: '2025-01-15', asOf: '2025-06-01', tier: 'UHL' });
    expect(before.status.initialAuditDue).toBe(false);
    const after = generateComplianceAuditReturn({ commencementDate: '2025-01-15', asOf: '2026-05-01', tier: 'UHL' });
    expect(after.status.initialAuditDue).toBe(true);
  });

  it('is not applicable to a non-DCPMI organisation', () => {
    const r = generateComplianceAuditReturn({ commencementDate: '2024-01-01', asOf: '2026-01-01', tier: 'none' });
    expect(r.applicable).toBe(false);
  });

  it('applies to UHL and EHL, which file CAR annually', () => {
    for (const tier of ['UHL', 'EHL'] as const) {
      expect(
        generateComplianceAuditReturn({ commencementDate: '2024-01-01', asOf: '2026-01-01', tier }).applicable,
      ).toBe(true);
    }
  });

  it('does not apply to OHL (GAID 2025: OHL renews registration annually, no CAR)', () => {
    const r = generateComplianceAuditReturn({ commencementDate: '2024-01-01', asOf: '2026-01-01', tier: 'OHL' });
    expect(r.applicable).toBe(false);
    expect(r.notes.some((n) => /renew/i.test(n))).toBe(true);
  });

  it('throws for an unsupported runtime tier instead of silently disabling CAR', () => {
    expect(() => generateComplianceAuditReturn({
      commencementDate: '2020-01-01',
      asOf: '2026-06-01',
      tier: 'bogus',
    } as never)).toThrow(/tier must be UHL/i);
  });

  it.each([
    [
      'initial audit before commencement',
      { initialAuditCompletedAt: '2023-12-31' },
      /initialAuditCompletedAt.*commencementDate/i,
    ],
    [
      'future initial-audit evidence',
      { initialAuditCompletedAt: '2026-01-02' },
      /initialAuditCompletedAt.*asOf/i,
    ],
    [
      'future filing evidence',
      { filings: [{ year: 2025, filedAt: '2026-01-02' }] },
      /filedAt.*asOf/i,
    ],
    [
      'acknowledgement before filing',
      { filings: [{ year: 2025, filedAt: '2025-03-20', acknowledgedAt: '2025-03-19' }] },
      /acknowledgedAt.*filedAt/i,
    ],
  ])('rejects %s', (_label, evidence, expected) => {
    expect(() => generateComplianceAuditReturn({
      commencementDate: '2024-01-01',
      asOf: '2026-01-01',
      tier: 'UHL',
      ...evidence,
    })).toThrow(expected);
  });

  it('surfaces a GAID/NIMP caveat note', () => {
    const r = generateComplianceAuditReturn({ commencementDate: '2024-01-01', asOf: '2026-01-01', tier: 'UHL' });
    expect(r.notes.some((n) => /gaid|nimp/i.test(n))).toBe(true);
  });
});
