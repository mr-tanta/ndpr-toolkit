import {
  detectNigerianPII,
  redactNigerianPII,
  validateNuban,
  luhnValid,
  maskValue,
} from '../../utils/nigerian-pii';

const types = (text: string) => detectNigerianPII(text).map((m) => m.type);

describe('validateNuban (CBN check digit)', () => {
  it('accepts the CBN worked example with a 3-digit bank code', () => {
    expect(validateNuban('0000014579', '011')).toBe(true);
  });
  it('accepts the same account with the code padded to 6 digits', () => {
    expect(validateNuban('0000014579', '000011')).toBe(true);
  });
  it('rejects a wrong check digit, wrong lengths, and non-digits', () => {
    expect(validateNuban('0000014578', '011')).toBe(false);
    expect(validateNuban('000001457', '011')).toBe(false);
    expect(validateNuban('00000145a9', '011')).toBe(false);
    expect(validateNuban('0000014579', '11')).toBe(false);
  });
});

describe('luhnValid', () => {
  it('validates a known test card and rejects a corrupted one', () => {
    expect(luhnValid('4111111111111111')).toBe(true);
    expect(luhnValid('4111111111111112')).toBe(false);
  });
});

describe('detectNigerianPII', () => {
  it('detects local and international Nigerian mobile numbers', () => {
    const local = detectNigerianPII('Reach me on 08031234567 today');
    expect(local).toHaveLength(1);
    expect(local[0]).toMatchObject({ type: 'phone_ng', value: '08031234567', confidence: 'medium' });

    const intl = detectNigerianPII('WhatsApp +234 803 123 4567');
    expect(intl[0]).toMatchObject({ type: 'phone_ng', confidence: 'high' });
  });

  it('never reports a mobile number as a national identifier', () => {
    expect(types('08031234567')).toEqual(['phone_ng']);
  });

  it('reports 11-digit identifiers with low confidence, raised by NIN/BVN context', () => {
    expect(detectNigerianPII('ref 22123456789')[0]).toMatchObject({ type: 'national_id', confidence: 'low' });
    expect(detectNigerianPII('BVN: 22123456789')[0]).toMatchObject({ type: 'national_id', confidence: 'medium' });
  });

  it('flags 10-digit account numbers, raised by account context', () => {
    expect(detectNigerianPII('code 0123456789')[0]).toMatchObject({ type: 'nuban', confidence: 'low' });
    expect(detectNigerianPII('Acct no 0123456789 GTB')[0]).toMatchObject({ type: 'nuban', confidence: 'medium' });
  });

  it('detects Luhn-valid card numbers, including grouped digits, and ignores invalid ones', () => {
    expect(types('card 4111 1111 1111 1111')).toEqual(['payment_card']);
    expect(types('card 4111 1111 1111 1112')).not.toContain('payment_card');
  });

  it('detects emails, CAC numbers and plates', () => {
    expect(types('mail ada@example.ng')).toEqual(['email']);
    expect(types('Registered as RC 1234567')).toEqual(['cac_number']);
    expect(types('Car LSD-123AB')).toEqual(['vehicle_plate']);
  });

  it('filters by type and minimum confidence', () => {
    const text = 'ref 22123456789, call 08031234567';
    expect(detectNigerianPII(text, { types: ['national_id'] }).map((m) => m.type)).toEqual(['national_id']);
    expect(detectNigerianPII(text, { minConfidence: 'medium' }).map((m) => m.type)).toEqual(['phone_ng']);
  });

  it('returns matches in text order with correct offsets', () => {
    const text = 'a@b.ng then 08031234567';
    const found = detectNigerianPII(text);
    expect(found.map((m) => text.slice(m.start, m.end))).toEqual(['a@b.ng', '08031234567']);
  });

  it('stays linear on adversarial input', () => {
    const inputs = ['a'.repeat(40000), `a@${'a'.repeat(40000)}`, `a@${'a.'.repeat(20000)}`, '1'.repeat(40000), `ABC${'-'.repeat(40000)}`];
    const started = Date.now();
    for (const s of inputs) detectNigerianPII(s);
    expect(Date.now() - started).toBeLessThan(500);
  });

  it('finds emails anchored on @ without swallowing neighbours', () => {
    const text = 'write to ada@example.ng, or bola.o@mail.co.uk. Not a@b or x@y.';
    expect(detectNigerianPII(text, { types: ['email'] }).map((m) => m.value)).toEqual(['ada@example.ng', 'bola.o@mail.co.uk']);
  });

  it('handles empty and non-string input', () => {
    expect(detectNigerianPII('')).toEqual([]);
    // @ts-expect-error runtime guard
    expect(detectNigerianPII(undefined)).toEqual([]);
  });
});

describe('redactNigerianPII', () => {
  it('replaces matches with typed placeholders and keeps the rest', () => {
    const r = redactNigerianPII('Call 08031234567 or email ada@example.ng');
    expect(r.text).toBe('Call [REDACTED:phone_ng] or email [REDACTED:email]');
    expect(r.stillPersonalDataPossible).toBe(true);
  });

  it('accepts a custom replacer', () => {
    const r = redactNigerianPII('BVN 22123456789', { replace: (m) => `<${maskValue(m.value)}>` });
    expect(r.text).toBe('BVN <*********89>');
  });
});
