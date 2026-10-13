import { issueDecisionReceipt, decisionContestRequest, shortCodeFor } from '../../utils/decision-receipt';
import type { DecisionReceiptInput } from '../../utils/decision-receipt';

const base: DecisionReceiptInput = {
  systemId: 'credit-model-v4',
  decisionType: 'loan_application',
  outcome: 'declined',
  basis: 'contract',
  subjectRef: 'cust_812',
  decidedAt: 1_760_000_000_000,
  contestChannel: 'lender.ng/review',
  organisation: 'Lender Ltd',
  mainFactors: ['income below threshold'],
  generateId: () => '11111111-2222-4333-8444-555555555555',
};

describe('issueDecisionReceipt (NDPA Section 37)', () => {
  it('issues a receipt with a stable, unambiguous short code', () => {
    const r = issueDecisionReceipt(base);
    expect(r.receiptId).toBe('11111111-2222-4333-8444-555555555555');
    expect(r.shortCode).toMatch(/^[0-9A-HJKMNP-TV-Z]{8}$/);
    expect(r.shortCode).toBe(shortCodeFor(r.receiptId));
    expect(r.record.basis).toBe('contract');
  });

  it('keeps the outcome out of the SMS and within 160 characters', () => {
    const r = issueDecisionReceipt(base);
    expect(r.notice.sms).not.toContain('declined');
    expect(r.notice.sms.length).toBeLessThanOrEqual(160);
    expect(r.notice.sms).toContain(r.shortCode);
    expect(r.notice.long).toContain('income below threshold');
    expect(r.notice.long).toMatch(/person to review/);
  });

  it('refuses to default the legal basis', () => {
    // @ts-expect-error basis is required
    expect(() => issueDecisionReceipt({ ...base, basis: undefined })).toThrow(/does not choose it/);
  });

  it('rejects identifier-shaped subject references', () => {
    expect(() => issueDecisionReceipt({ ...base, subjectRef: '22123456789' })).toThrow(/internal reference/);
    expect(() => issueDecisionReceipt({ ...base, subjectRef: '+234 803 123 4567' })).toThrow(/internal reference/);
  });

  it('requires human review and warns when the subject may be a child', () => {
    const r = issueDecisionReceipt({ ...base, subjectMayBeChild: true });
    expect(r.record.humanReviewRequired).toBe(true);
    expect(r.warnings.some((w) => w.includes('Section 31'))).toBe(true);
  });

  it('warns when no main factors are given', () => {
    const r = issueDecisionReceipt({ ...base, mainFactors: [] });
    expect(r.warnings.some((w) => w.includes('main factors'))).toBe(true);
  });

  it('seeds an automated_decision_making DSR from a receipt', () => {
    const r = issueDecisionReceipt(base);
    const dsr = decisionContestRequest(r);
    expect(dsr.type).toBe('automated_decision_making');
    expect(dsr.additionalInfo.shortCode).toBe(r.shortCode);
  });

  it('produces different codes for different IDs', () => {
    expect(shortCodeFor('a')).not.toBe(shortCodeFor('b'));
  });
});
