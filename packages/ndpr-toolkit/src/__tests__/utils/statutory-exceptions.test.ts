import {
  STARTER_EXCEPTION_REGISTER,
  validateExceptionRow,
  findStatutoryExceptions,
  resolveDsrOutcome,
  planRetention,
  addMonthsUTC,
} from '../../utils/statutory-exceptions';
import type { StatutoryExceptionRow } from '../../utils/statutory-exceptions';

const reviewedKyc: StatutoryExceptionRow = {
  id: 'test-kyc-floor',
  issuer: 'Test issuer',
  instrument: 'Test Records Act',
  provision: 's.9',
  obligation: 'retention_floor',
  sectors: ['banking'],
  dataCategories: ['kyc_identity'],
  durationMonths: 60,
  durationTrigger: 'relationship_end',
  interactsWith: ['erasure', 'restriction'],
  summary: 'Keep KYC records for five years after the relationship ends.',
  sourceUrl: 'https://example.test/act',
  quote: 'A reporting entity shall keep records for five years.',
  lastVerified: '2026-10-01',
  reviewedBy: 'Test Reviewer',
  reviewStatus: 'reviewed',
};

describe('register validation', () => {
  it('accepts the starter rows, which are all unverified', () => {
    for (const row of STARTER_EXCEPTION_REGISTER) {
      expect(validateExceptionRow(row)).toEqual([]);
      expect(row.reviewStatus).toBe('unverified');
    }
  });

  it('requires a reviewer, quote, source, date and confirmed provision for reviewed rows', () => {
    const codes = validateExceptionRow({ ...reviewedKyc, reviewedBy: '', quote: undefined, sourceUrl: undefined, lastVerified: undefined, provision: 'unconfirmed' })
      .map((e) => e.code);
    expect(codes).toEqual(expect.arrayContaining([
      'reviewer_required', 'quote_required', 'source_required', 'verified_date_required', 'provision_unconfirmed',
    ]));
  });

  it('requires a trigger when a duration is set', () => {
    expect(validateExceptionRow({ ...reviewedKyc, durationTrigger: undefined }).map((e) => e.code)).toContain('trigger_required');
  });

  it('finds rows by sector, category and right', () => {
    expect(findStatutoryExceptions([reviewedKyc], { sector: 'banking', dataCategory: 'kyc_identity', right: 'erasure' })).toHaveLength(1);
    expect(findStatutoryExceptions([reviewedKyc], { sector: 'telecoms' })).toHaveLength(0);
    expect(findStatutoryExceptions([reviewedKyc], { sector: 'banking', right: 'portability' })).toHaveLength(0);
  });
});

describe('addMonthsUTC', () => {
  it('adds months and clamps to month end', () => {
    expect(addMonthsUTC('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonthsUTC('2020-02-29', 60)).toBe('2025-02-28');
    expect(addMonthsUTC('2026-10-13', 24)).toBe('2028-10-13');
  });
});

describe('resolveDsrOutcome', () => {
  const asOf = '2026-10-13';

  it('fulfils non-colliding request types in full', () => {
    const d = resolveDsrOutcome({ id: 'r1', type: 'access', sector: 'banking', dataCategories: ['kyc_identity'] }, { register: [reviewedKyc], asOf });
    expect(d.proposed).toBe('fulfil');
    expect(d.actNow).toEqual(['kyc_identity']);
    expect(d.requiresSignOff).toBe(true);
  });

  it('partially fulfils when a reviewed floor is live, with a dated hold and a cited ground', () => {
    const d = resolveDsrOutcome(
      { id: 'r2', type: 'erasure', sector: 'banking', dataCategories: ['marketing_preferences', 'kyc_identity'], dates: { relationshipEndedAt: '2024-03-01' } },
      { register: [reviewedKyc], asOf, organisation: 'Test Bank' },
    );
    expect(d.proposed).toBe('partially_fulfil');
    expect(d.actNow).toEqual(['marketing_preferences']);
    expect(d.hold).toEqual([{ dataCategory: 'kyc_identity', until: '2029-03-01', grounds: [{ rowId: 'test-kyc-floor', citation: 'Test Records Act, s.9' }], legalHold: undefined }]);
    expect(d.letter.join(' ')).toMatch(/until 2029-03-01/);
    expect(d.letter.join(' ')).toMatch(/Section 46/);
    expect(d.warnings.some((w) => w.includes('Section 37'))).toBe(true);
  });

  it('holds open-ended while the relationship is still open', () => {
    const d = resolveDsrOutcome({ id: 'r3', type: 'erasure', sector: 'banking', dataCategories: ['kyc_identity'] }, { register: [reviewedKyc], asOf });
    expect(d.proposed).toBe('refuse_statutory');
    expect(d.hold[0].until).toBeUndefined();
  });

  it('acts once the floor has lapsed', () => {
    const d = resolveDsrOutcome(
      { id: 'r4', type: 'erasure', sector: 'banking', dataCategories: ['kyc_identity'], dates: { relationshipEndedAt: '2019-01-01' } },
      { register: [reviewedKyc], asOf },
    );
    expect(d.proposed).toBe('fulfil');
  });

  it('never refuses on an unverified row; it routes to human review instead', () => {
    const d = resolveDsrOutcome({ id: 'r5', type: 'erasure', sector: 'banking', dataCategories: ['transaction_records'] }, { asOf });
    expect(d.proposed).toBe('needs_human_review');
    expect(d.hold).toEqual([]);
    expect(d.needsHumanReview[0].candidateGrounds[0].rowId).toBe('ng-mlppa-2022-records');
  });

  it('routes everything to human review for a possible child', () => {
    const d = resolveDsrOutcome(
      { id: 'r6', type: 'erasure', sector: 'banking', dataCategories: ['marketing_preferences'], subjectMayBeChild: true },
      { register: [reviewedKyc], asOf },
    );
    expect(d.proposed).toBe('needs_human_review');
    expect(d.warnings.some((w) => w.includes('Section 31'))).toBe(true);
  });

  it('applies an active legal hold', () => {
    const d = resolveDsrOutcome(
      { id: 'r7', type: 'erasure', sector: 'retail', dataCategories: ['orders'] },
      { register: [], legalHolds: [{ dataCategory: 'orders', reference: 'Suit FHC/L/1/2026', until: '2027-01-01' }], asOf },
    );
    expect(d.hold[0]).toMatchObject({ dataCategory: 'orders', until: '2027-01-01', legalHold: 'Suit FHC/L/1/2026' });
  });

  it('rejects an invalid register', () => {
    expect(() => resolveDsrOutcome({ id: 'r8', type: 'erasure', sector: 'banking', dataCategories: [] }, { register: [{ ...reviewedKyc, reviewedBy: undefined }] }))
      .toThrow(/reviewer_required/);
  });
});

describe('planRetention', () => {
  const policy = { marketing_preferences: { months: 24, trigger: 'collection' as const }, kyc_identity: { months: 12, trigger: 'relationship_end' as const } };

  it('separates policy expiry, statutory holds and missing policies', () => {
    const plan = planRetention(
      [
        { id: 'a', dataCategory: 'marketing_preferences', collectedAt: '2023-01-01' },
        { id: 'b', dataCategory: 'marketing_preferences', collectedAt: '2026-01-01' },
        { id: 'c', dataCategory: 'kyc_identity', relationshipEndedAt: '2024-01-01' },
        { id: 'd', dataCategory: 'unknown_category', collectedAt: '2020-01-01' },
      ],
      policy,
      { sector: 'banking', register: [reviewedKyc], asOf: '2026-10-13' },
    );
    expect(plan.map((p) => p.decision)).toEqual(['review_for_deletion', 'retain', 'statutory_hold', 'needs_human_review']);
    expect(plan[2].statutoryFloorEndsOn).toBe('2029-01-01');
  });
});
