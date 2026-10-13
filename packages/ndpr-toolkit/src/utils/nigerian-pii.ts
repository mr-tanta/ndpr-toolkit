/**
 * Nigerian personal-identifier detection and redaction.
 *
 * Finds identifiers that generic PII scanners miss or misclassify in
 * Nigerian data: NIN/BVN-shaped numbers, Nigerian mobile numbers, NUBAN
 * account numbers, Verve/Visa/Mastercard numbers, CAC registration
 * numbers, vehicle plates and email addresses.
 *
 * Limits, stated plainly:
 * - NIN and BVN are both 11 digits with no public check digit, so they
 *   cannot be told apart or proven by pattern. They are reported as
 *   `national_id` with low confidence unless nearby text names them.
 * - A NUBAN check digit can only be verified when the bank code is known.
 *   Without it, a 10-digit number is a low-confidence candidate.
 * - Redaction is masking, not anonymisation. Redacted text that still
 *   carries other personal data is still personal data, and sending it to
 *   a foreign service is still a cross-border transfer (NDPA ss.41-43).
 *
 * Pure, synchronous, zero dependencies, safe in Node, edge and browser.
 */

export type NigerianPIIType =
  | 'phone_ng'
  | 'national_id'
  | 'nuban'
  | 'payment_card'
  | 'cac_number'
  | 'vehicle_plate'
  | 'email';

export type PIIConfidence = 'low' | 'medium' | 'high';

export interface NigerianPIIMatch {
  type: NigerianPIIType;
  value: string;
  start: number;
  end: number;
  confidence: PIIConfidence;
  /** Why this confidence was assigned. */
  reason: string;
}

export interface DetectNigerianPIIOptions {
  /** Types to look for. Defaults to all. */
  types?: NigerianPIIType[];
  /** Drop matches below this confidence. Defaults to 'low' (keep all). */
  minConfidence?: PIIConfidence;
  /** Characters either side of a match searched for context keywords. Default 40. */
  contextWindow?: number;
}

const CONFIDENCE_RANK: Record<PIIConfidence, number> = { low: 0, medium: 1, high: 2 };
const ALL_TYPES: NigerianPIIType[] = ['email', 'payment_card', 'phone_ng', 'national_id', 'nuban', 'cac_number', 'vehicle_plate'];

/** NUBAN weights over the 15-digit string (6-digit bank code + 9-digit serial). */
const NUBAN_WEIGHTS = [3, 7, 3, 3, 7, 3, 3, 7, 3, 3, 7, 3, 3, 7, 3];

/**
 * Validates a 10-digit NUBAN against a bank code using the CBN check-digit
 * algorithm. Accepts legacy 3-digit codes (left-padded to 6) and 6-digit codes.
 */
export function validateNuban(accountNumber: string, bankCode: string): boolean {
  if (!/^\d{10}$/.test(accountNumber) || !/^(\d{3}|\d{5,6})$/.test(bankCode)) return false;
  const code = bankCode.padStart(6, '0');
  const digits = `${code}${accountNumber.slice(0, 9)}`.split('').map(Number);
  const sum = digits.reduce((total, digit, i) => total + digit * NUBAN_WEIGHTS[i], 0);
  const check = (10 - (sum % 10)) % 10;
  return check === Number(accountNumber[9]);
}

/** Luhn check for payment card numbers. */
export function luhnValid(digits: string): boolean {
  if (!/^\d{12,19}$/.test(digits)) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

const CONTEXT = {
  national_id: /\b(nin|bvn|national\s+identi|identity\s+number|verification\s+number)\b/i,
  nuban: /\b(account|acct|a\/c|nuban|bank|transfer\s+to)\b/i,
  phone_ng: /\b(phone|tel|mobile|whatsapp|call|sms|msisdn)\b/i,
};

interface PatternSpec {
  type: NigerianPIIType;
  /** Either a global regex, or a linear-time finder for shapes regexes match polynomially. */
  regex?: RegExp;
  find?: (text: string) => Array<{ value: string; index: number }>;
  classify: (match: string, context: string) => { confidence: PIIConfidence; reason: string } | null;
}

const digitsOnly = (s: string) => s.replace(/\D/g, '');

const isLocalChar = (c: string) => /[A-Za-z0-9._%+-]/.test(c);
const isDomainChar = (c: string) => /[A-Za-z0-9.-]/.test(c);

/**
 * Finds emails by anchoring on each "@" and expanding outward, so the work is
 * linear in the text length. A global email regex rescans long runs of
 * local-part characters from every offset (polynomial on adversarial input).
 */
function findEmails(text: string): Array<{ value: string; index: number }> {
  const found: Array<{ value: string; index: number }> = [];
  let floor = 0; // never expand left past the end of the previous match
  for (let at = text.indexOf('@'); at !== -1; at = text.indexOf('@', at + 1)) {
    let start = at;
    while (start > floor && isLocalChar(text[start - 1])) start -= 1;
    let end = at + 1;
    while (end < text.length && isDomainChar(text[end])) end += 1;
    // Trim trailing dots/hyphens, then require a dotted domain ending in 2+ letters.
    while (end > at + 1 && (text[end - 1] === '.' || text[end - 1] === '-')) end -= 1;
    const domain = text.slice(at + 1, end);
    const dot = domain.lastIndexOf('.');
    if (start === at || dot <= 0 || !/^[A-Za-z]{2,}$/.test(domain.slice(dot + 1))) continue;
    found.push({ value: text.slice(start, end), index: start });
    floor = end;
  }
  return found;
}

const PATTERNS: PatternSpec[] = [
  {
    type: 'email',
    find: findEmails,
    classify: () => ({ confidence: 'high', reason: 'email address syntax' }),
  },
  {
    type: 'payment_card',
    // 13-19 digits, optionally grouped by spaces or dashes in fours.
    regex: /(?<![\d-])(?:\d[ -]?){12,18}\d(?![\d-])/g,
    classify: (match) => {
      const digits = digitsOnly(match);
      if (digits.length < 13 || !luhnValid(digits)) return null;
      return { confidence: 'high', reason: 'Luhn-valid card number' };
    },
  },
  {
    type: 'phone_ng',
    regex: /(?<!\d)(?:\+?234[\s-]?|0)[789][01]\d(?:[\s-]?\d){7}(?!\d)/g,
    classify: (match, context) => {
      const international = /^\+?234/.test(match.trim());
      return international || CONTEXT.phone_ng.test(context)
        ? { confidence: 'high', reason: international ? '+234 country code' : 'Nigerian mobile prefix with phone context' }
        : { confidence: 'medium', reason: 'Nigerian mobile prefix (070/080/081/090/091)' };
    },
  },
  {
    type: 'national_id',
    regex: /(?<!\d)\d{11}(?!\d)/g,
    classify: (match, context) => {
      // 11-digit numbers starting 0[789][01] are mobile numbers; handled above.
      if (/^0[789][01]/.test(match)) return null;
      return CONTEXT.national_id.test(context)
        ? { confidence: 'medium', reason: 'NIN/BVN keyword nearby; 11 digits cannot be verified by pattern' }
        : { confidence: 'low', reason: 'possible NIN or BVN; 11 digits cannot be verified by pattern' };
    },
  },
  {
    type: 'nuban',
    regex: /(?<!\d)\d{10}(?!\d)/g,
    classify: (_match, context) =>
      CONTEXT.nuban.test(context)
        ? { confidence: 'medium', reason: 'account keyword nearby; verify with validateNuban and the bank code' }
        : { confidence: 'low', reason: 'possible NUBAN account number' },
  },
  {
    type: 'cac_number',
    regex: /\b(?:RC|BN|IT)[\s.:-]*\d{4,8}\b/gi,
    classify: () => ({ confidence: 'medium', reason: 'CAC registration number format' }),
  },
  {
    type: 'vehicle_plate',
    regex: /\b[A-Z]{3}[\s-]?\d{3}[\s-]?[A-Z]{2}\b/g,
    classify: () => ({ confidence: 'low', reason: 'Nigerian plate number format (ABC-123DE)' }),
  },
];

/**
 * Finds Nigerian personal identifiers in text. Overlapping matches are
 * resolved in favour of the earlier pattern (email, card, phone, then the
 * numeric identifiers), so a phone number is never also reported as an ID.
 *
 * @example
 * ```ts
 * detectNigerianPII('Call 08031234567, BVN 22123456789');
 * // [{ type: 'phone_ng', confidence: 'high', ... }, { type: 'national_id', confidence: 'medium', ... }]
 * ```
 */
export function detectNigerianPII(text: string, options: DetectNigerianPIIOptions = {}): NigerianPIIMatch[] {
  if (typeof text !== 'string' || text.length === 0) return [];
  const types = new Set(options.types ?? ALL_TYPES);
  const min = CONFIDENCE_RANK[options.minConfidence ?? 'low'];
  const window = options.contextWindow ?? 40;
  const claimed: Array<[number, number]> = [];
  const overlaps = (start: number, end: number) => claimed.some(([s, e]) => start < e && end > s);
  const matches: NigerianPIIMatch[] = [];

  for (const spec of PATTERNS) {
    if (!types.has(spec.type)) continue;
    const candidates = spec.find
      ? spec.find(text)
      : Array.from(text.matchAll(spec.regex!), (m) => ({ value: m[0], index: m.index ?? 0 }));
    for (const m of candidates) {
      const raw = m.value;
      const start = m.index;
      const end = start + raw.length;
      if (overlaps(start, end)) continue;
      const context = text.slice(Math.max(0, start - window), Math.min(text.length, end + window));
      const verdict = spec.classify(raw, context);
      if (!verdict) continue;
      claimed.push([start, end]);
      if (CONFIDENCE_RANK[verdict.confidence] < min) continue;
      matches.push({ type: spec.type, value: raw, start, end, ...verdict });
    }
  }
  return matches.sort((a, b) => a.start - b.start);
}

export interface RedactNigerianPIIOptions extends DetectNigerianPIIOptions {
  /**
   * Produces the replacement for a match. Defaults to `[REDACTED:<type>]`.
   * Supply a keyed tokeniser here if you need stable pseudonyms; never use an
   * unkeyed hash, because 10- and 11-digit identifiers are trivially brute-forced.
   */
  replace?: (match: NigerianPIIMatch) => string;
}

export interface RedactionResult {
  text: string;
  matches: NigerianPIIMatch[];
  /** Always true: masked text can still identify a person in context. */
  stillPersonalDataPossible: true;
}

export function redactNigerianPII(text: string, options: RedactNigerianPIIOptions = {}): RedactionResult {
  const matches = detectNigerianPII(text, options);
  const replace = options.replace ?? ((m: NigerianPIIMatch) => `[REDACTED:${m.type}]`);
  let out = '';
  let cursor = 0;
  for (const m of matches) {
    out += text.slice(cursor, m.start) + replace(m);
    cursor = m.end;
  }
  out += text.slice(cursor);
  return { text: out, matches, stillPersonalDataPossible: true };
}

/** Masks all but the last `visible` characters, for display in reports. */
export function maskValue(value: string, visible = 2): string {
  if (value.length <= visible) return '*'.repeat(value.length);
  return '*'.repeat(value.length - visible) + value.slice(-visible);
}
