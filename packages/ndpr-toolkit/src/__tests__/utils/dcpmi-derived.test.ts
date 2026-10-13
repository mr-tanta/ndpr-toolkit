import { estimateDerivedDataSubjects, DERIVED_SUBJECTS_ADVISORY } from '../../utils/dcpmi-derived';
import { estimateStatutoryCeiling } from '../../utils/penalty-ceiling';

describe('estimateDerivedDataSubjects', () => {
  it('keeps the declared tier separate from the derived tier', () => {
    const r = estimateDerivedDataSubjects({
      directSubjects: 900,
      relationships: [{ kind: 'guarantor', perDirectSubject: 2 }],
    });
    expect(r.direct).toBe(900);
    expect(r.derived.estimated).toBe(1800);
    expect(r.directPlusDerived.estimated).toBe(2700);
    expect(r.tiers.declared.tier).toBe('OHL');
    expect(r.tiers.withDerived.tier).toBe('EHL');
    expect(r.tiers.changes).toBe(true);
    expect(r.advisoryNotice).toBe(DERIVED_SUBJECTS_ADVISORY);
  });

  it('applies coverage, ranges and the overlap share', () => {
    const r = estimateDerivedDataSubjects({
      directSubjects: 1000,
      relationships: [
        { kind: 'uploaded_contact', perDirectSubject: 100, range: { low: 50, high: 400 }, coverage: 0.5 },
      ],
      overlapShare: 0.1,
    });
    expect(r.relationships[0]).toMatchObject({ estimated: 50000, low: 25000, high: 200000 });
    expect(r.derived).toEqual({ estimated: 45000, low: 22500, high: 180000 });
    expect(r.notes.some((n) => n.includes('Section 25'))).toBe(true);
  });

  it('flags children and does not change tier when derived subjects are few', () => {
    const r = estimateDerivedDataSubjects({
      directSubjects: 6000,
      relationships: [{ kind: 'dependant', perDirectSubject: 0.1, mayIncludeChildren: true }],
    });
    expect(r.tiers.changes).toBe(false);
    expect(r.childrenMayBeInvolved).toBe(true);
    expect(r.notes.some((n) => n.includes('Section 31'))).toBe(true);
  });

  it('respects the 5,000 / 5,001 boundary on the combined count', () => {
    const at = estimateDerivedDataSubjects({ directSubjects: 4000, relationships: [{ kind: 'referee', perDirectSubject: 0.25 }] });
    const over = estimateDerivedDataSubjects({ directSubjects: 4001, relationships: [{ kind: 'referee', perDirectSubject: 0.25 }] });
    expect(at.directPlusDerived.estimated).toBe(5000);
    expect(at.tiers.withDerived.tier).toBe('EHL');
    expect(over.directPlusDerived.estimated).toBe(5001);
    expect(over.tiers.withDerived.tier).toBe('UHL');
  });

  it('rejects malformed input', () => {
    expect(() => estimateDerivedDataSubjects({ directSubjects: -1, relationships: [] })).toThrow(RangeError);
    expect(() =>
      estimateDerivedDataSubjects({ directSubjects: 10, relationships: [{ kind: 'guarantor', perDirectSubject: 1, coverage: 2 }] }),
    ).toThrow(RangeError);
    expect(() =>
      estimateDerivedDataSubjects({
        directSubjects: 10,
        relationships: [{ kind: 'guarantor', perDirectSubject: 5, range: { low: 6, high: 9 } }],
      }),
    ).toThrow(RangeError);
    expect(() =>
      // @ts-expect-error unknown kind
      estimateDerivedDataSubjects({ directSubjects: 10, relationships: [{ kind: 'cousin', perDirectSubject: 1 }] }),
    ).toThrow(TypeError);
  });
});

describe('estimateStatutoryCeiling (NDPA Section 48(4))', () => {
  it('uses the fixed amount when it is higher', () => {
    const r = estimateStatutoryCeiling({ annualGrossRevenueNGN: 100_000_000, majorImportance: true });
    expect(r).toMatchObject({ ceilingNGN: 10_000_000, basis: 'fixed', revenueBasedNGN: 2_000_000 });
  });

  it('uses two percent of revenue when it is higher', () => {
    const r = estimateStatutoryCeiling({ annualGrossRevenueNGN: 2_000_000_000, majorImportance: true });
    expect(r).toMatchObject({ ceilingNGN: 40_000_000, basis: 'revenue' });
  });

  it('applies the lower fixed amount to organisations not of major importance', () => {
    const r = estimateStatutoryCeiling({ annualGrossRevenueNGN: 0, majorImportance: false });
    expect(r.ceilingNGN).toBe(2_000_000);
    expect(r.notice).toMatch(/maximum, not a prediction/);
  });

  it('rejects negative revenue', () => {
    expect(() => estimateStatutoryCeiling({ annualGrossRevenueNGN: -1, majorImportance: true })).toThrow(RangeError);
  });
});
