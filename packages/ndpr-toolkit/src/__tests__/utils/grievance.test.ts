import {
  composeGrievancePacket,
  validateGrievanceInput,
  draftSection46Complaint,
  toSmsSegments,
} from '../../utils/grievance';
import type { GrievanceInput } from '../../utils/grievance';

const contact: GrievanceInput = {
  role: 'harvested_contact',
  subject: { name: 'Ada Okafor', phone: '08031234567' },
  controller: { name: 'QuickCash App', dpoEmail: 'dpo@quickcash.example' },
  categories: ['unauthorised_disclosure', 'unsolicited_messages'],
  narrative: 'Your agents sent me messages about a loan taken by someone else.',
  servedOn: '2026-10-13',
};

describe('validateGrievanceInput', () => {
  it('accepts a phone-only subject', () => {
    expect(validateGrievanceInput(contact)).toEqual([]);
  });

  it('requires a reply channel, a controller and at least one category', () => {
    const codes = validateGrievanceInput({ ...contact, subject: { name: 'Ada' }, controller: { name: '' }, categories: [] }).map((e) => e.code);
    expect(codes).toEqual(expect.arrayContaining(['reply_channel_required', 'controller_required', 'categories_required']));
  });

  it('requires confirmed authority when an organisation serves the notice', () => {
    const codes = validateGrievanceInput({ ...contact, servedBy: { organisation: 'Rights NGO', authorityConfirmed: false } }).map((e) => e.code);
    expect(codes).toContain('authority_unconfirmed');
  });
});

describe('composeGrievancePacket', () => {
  it('gives a harvested contact objection, erasure and access, never withdrawal of consent', () => {
    const p = composeGrievancePacket(contact);
    expect(p.requests.map((r) => r.type)).toEqual(['objection', 'erasure', 'access']);
    expect(p.requests.map((r) => r.type)).not.toContain('withdraw_consent');
  });

  it('gives a borrower withdrawal, erasure and access', () => {
    const p = composeGrievancePacket({ ...contact, role: 'borrower', categories: ['unauthorised_access'] });
    expect(p.requests.map((r) => r.type)).toEqual(['withdraw_consent', 'erasure', 'access']);
  });

  it('adds an automated-decision contest when that category is chosen', () => {
    const p = composeGrievancePacket({ ...contact, role: 'customer', categories: ['unlawful_automated_processing'] });
    expect(p.requests.map((r) => r.type)).toContain('automated_decision_making');
  });

  it('sets a decision date no later than 30 days and schedules reminders', () => {
    expect(composeGrievancePacket(contact).decisionDueBy).toBe('2026-11-12');
    expect(composeGrievancePacket({ ...contact, decisionWithinDays: 60 }).decisionDueBy).toBe('2026-11-12');
    const p = composeGrievancePacket({ ...contact, decisionWithinDays: 14 });
    expect(p.decisionDueBy).toBe('2026-10-27');
    expect(p.reminders.map((r) => r.on)).toEqual(['2026-10-22', '2026-10-27']);
  });

  it('renders email, WhatsApp and SMS segments within 160 characters', () => {
    const p = composeGrievancePacket(contact);
    expect(p.renderings.email.to).toBe('dpo@quickcash.example');
    expect(p.renderings.email.body).toMatch(/Article 40 and Schedule 9/);
    expect(p.renderings.email.body).toMatch(/phone 08031234567/);
    expect(p.renderings.whatsapp).toBe(p.renderings.email.body);
    expect(p.renderings.sms.length).toBeGreaterThan(0);
    for (const s of p.renderings.sms) expect(s.length).toBeLessThanOrEqual(160);
  });

  it('warns when the narrative contains an identifier-length number', () => {
    const p = composeGrievancePacket({ ...contact, narrative: 'My BVN is 22123456789 and they used it.' });
    expect(p.warnings.some((w) => w.includes('NIN, BVN'))).toBe(true);
  });

  it('throws on invalid input', () => {
    expect(() => composeGrievancePacket({ ...contact, servedOn: '13/10/2026' })).toThrow(/served_on_invalid/);
  });
});

describe('draftSection46Complaint', () => {
  const packet = composeGrievancePacket(contact);

  it('refuses without the subject’s confirmation or before the decision date', () => {
    expect(() => draftSection46Complaint(packet, contact, { asOf: '2026-12-01', subjectConfirmed: false })).toThrow(/confirm/);
    expect(() => draftSection46Complaint(packet, contact, { asOf: '2026-11-12', subjectConfirmed: true })).toThrow(/after the decision date/);
  });

  it('drafts a complaint that leaves the NDPC reference to the Commission', () => {
    const text = draftSection46Complaint(packet, contact, { asOf: '2026-11-20', subjectConfirmed: true });
    expect(text).toMatch(/Section 46/);
    expect(text).toMatch(/did not respond/);
    expect(text).toMatch(/to be assigned by the Commission/);
  });
});

describe('toSmsSegments', () => {
  it('keeps a short message whole and numbers long ones', () => {
    expect(toSmsSegments('hello')).toEqual(['hello']);
    const parts = toSmsSegments('word '.repeat(80));
    expect(parts.length).toBeGreaterThan(1);
    expect(parts[0]).toMatch(/\(1\/\d+\)$/);
    for (const p of parts) expect(p.length).toBeLessThanOrEqual(160);
  });
});
