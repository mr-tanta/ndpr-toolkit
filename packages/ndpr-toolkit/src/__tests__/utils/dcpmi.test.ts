import { classifyDCPMI } from '../../utils/dcpmi';

describe('classifyDCPMI (NDPC GAID 2025 — Data Controller/Processor of Major Importance)', () => {
  it('classifies more than 5,000 data subjects as UHL with a ₦250,000 annual fee', () => {
    const r = classifyDCPMI({ dataSubjectsInSixMonths: 6000 });
    expect(r.tier).toBe('UHL');
    expect(r.isDCPMI).toBe(true);
    expect(r.annualFeeNGN).toBe(250000);
  });

  it('classifies the 1,000–5,000 band as EHL with a ₦100,000 annual fee', () => {
    const r = classifyDCPMI({ dataSubjectsInSixMonths: 3000 });
    expect(r.tier).toBe('EHL');
    expect(r.annualFeeNGN).toBe(100000);
  });

  it('classifies the 200–999 band as OHL with a ₦10,000 annual fee', () => {
    const r = classifyDCPMI({ dataSubjectsInSixMonths: 500 });
    expect(r.tier).toBe('OHL');
    expect(r.annualFeeNGN).toBe(10000);
  });

  it('does not classify below the 200 threshold as a DCPMI', () => {
    const r = classifyDCPMI({ dataSubjectsInSixMonths: 150 });
    expect(r.isDCPMI).toBe(false);
    expect(r.tier).toBe('none');
    expect(r.annualFeeNGN).toBe(0);
  });

  it('treats a designated/listed organisation as a DCPMI regardless of volume', () => {
    const r = classifyDCPMI({ dataSubjectsInSixMonths: 0, isDesignated: true });
    expect(r.isDCPMI).toBe(true);
    expect(r.tier).toBe('listed');
  });

  it('resolves boundary values consistently (5,000→EHL, 5,001→UHL)', () => {
    expect(classifyDCPMI({ dataSubjectsInSixMonths: 5000 }).tier).toBe('EHL');
    expect(classifyDCPMI({ dataSubjectsInSixMonths: 5001 }).tier).toBe('UHL');
  });

  it('resolves the 1,000 boundary to EHL and 999 to OHL', () => {
    expect(classifyDCPMI({ dataSubjectsInSixMonths: 1000 }).tier).toBe('EHL');
    expect(classifyDCPMI({ dataSubjectsInSixMonths: 999 }).tier).toBe('OHL');
  });

  it('resolves the 200 boundary to OHL and 199 to none', () => {
    expect(classifyDCPMI({ dataSubjectsInSixMonths: 200 }).tier).toBe('OHL');
    expect(classifyDCPMI({ dataSubjectsInSixMonths: 199 }).tier).toBe('none');
  });

  it('reports tier-specific registration and audit-return obligations', () => {
    const uhl = classifyDCPMI({ dataSubjectsInSixMonths: 6000 });
    expect(uhl.registration.required).toBe(true);
    expect(uhl.registration.renewsAnnually).toBe(false); // UHL/EHL register once
    expect(uhl.compliance.auditReturnsAnnual).toBe(true);
    expect(uhl.compliance.initialAuditWithinMonths).toBe(15);

    const ohl = classifyDCPMI({ dataSubjectsInSixMonths: 500 });
    expect(ohl.registration.renewsAnnually).toBe(true); // OHL renews registration annually
  });

  it('honours custom (versioned) thresholds and fees so callers can track GAID changes', () => {
    const r = classifyDCPMI(
      { dataSubjectsInSixMonths: 6000 },
      {
        thresholds: { ohl: 100, ehl: 800, uhl: 4000 },
        fees: { OHL: 5000, EHL: 50000, UHL: 200000 },
      },
    );
    expect(r.tier).toBe('UHL'); // 6000 > custom uhl threshold of 4000
    expect(r.annualFeeNGN).toBe(200000);
  });

  it('treats a negative or missing count as zero (defensive)', () => {
    expect(classifyDCPMI({ dataSubjectsInSixMonths: -5 }).isDCPMI).toBe(false);
    expect(classifyDCPMI({} as { dataSubjectsInSixMonths?: number }).isDCPMI).toBe(false);
  });

  it('surfaces the GAID-baseline caveat and the considered count', () => {
    const r = classifyDCPMI({ dataSubjectsInSixMonths: 3000 });
    expect(r.dataSubjectsConsidered).toBe(3000);
    expect(r.notes.some((n) => n.toLowerCase().includes('gaid'))).toBe(true);
  });
});
