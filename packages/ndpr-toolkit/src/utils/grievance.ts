/**
 * Grievance packets: a data subject's notice to a controller, with the
 * matching data subject requests attached, rendered for email, WhatsApp and
 * SMS.
 *
 * Modelled on the NDPC's Standard Notice to Address Grievance (SNAG) in
 * NDPC GAID 2025 Article 40 and Schedule 9, whose form asks the respondent
 * to decide "as specified in this complaint or within 30 days, whichever is
 * earlier". Built first for people harassed by lending apps and for the
 * contacts those apps harvested, who never dealt with the lender at all.
 *
 * Design rules:
 * - Runs entirely on the subject's device. Nothing here sends anything.
 * - Never asks for NIN, BVN or account numbers. An email or phone number the
 *   controller can reply to is enough.
 * - The complaint to the Commission (NDPA Section 46) is drafted only after
 *   the decision date passes and only when the subject confirms. It is never
 *   filed automatically, and the NDPC reference field is left for the NDPC.
 *
 * Pure utility, zero React. Not legal advice.
 */

import type { DSRType } from '../types/dsr';

/** Grievance categories mirroring the GAID 2025 Schedule 9 notice. */
export type SnagCategory =
  | 'unauthorised_access'
  | 'unauthorised_disclosure'
  | 'unsolicited_messages'
  | 'unlawful_automated_processing'
  | 'child_privacy'
  | 'other';

export type GrievanceRole = 'borrower' | 'harvested_contact' | 'customer' | 'other';

export interface GrievanceSubject {
  name: string;
  /** At least one of email or phone is required, for the controller's reply. */
  email?: string;
  phone?: string;
}

export interface GrievanceController {
  name: string;
  /** DPO or privacy contact, if known. */
  dpoEmail?: string;
  contactEmail?: string;
  address?: string;
}

export interface GrievanceInput {
  role: GrievanceRole;
  subject: GrievanceSubject;
  controller: GrievanceController;
  categories: SnagCategory[];
  /** What happened, in the subject's own words. */
  narrative: string;
  /** ISO date the notice is served (sent). */
  servedOn: string;
  /** Days the controller has to decide. Capped at 30 (Schedule 9). Default 30. */
  decisionWithinDays?: number;
  /** When a civil society organisation serves the notice for the subject. */
  servedBy?: { organisation: string; authorityConfirmed: boolean };
}

export interface GrievanceRequestItem {
  type: DSRType;
  description: string;
}

export interface GrievancePacket {
  role: GrievanceRole;
  categories: SnagCategory[];
  requests: GrievanceRequestItem[];
  servedOn: string;
  decisionDueBy: string;
  reminders: Array<{ on: string; text: string }>;
  renderings: {
    email: { to?: string; subject: string; body: string };
    whatsapp: string;
    sms: string[];
  };
  warnings: string[];
}

export interface GrievanceValidationError {
  field: string;
  code: string;
  message: string;
}

const CATEGORY_TEXT: Record<SnagCategory, string> = {
  unauthorised_access: 'unauthorised access to my personal data',
  unauthorised_disclosure: 'unauthorised disclosure of my personal data',
  unsolicited_messages: 'unsolicited messages and calls',
  unlawful_automated_processing: 'unlawful automated processing of my personal data',
  child_privacy: "breach of a child's privacy",
  other: 'other processing of my personal data in breach of the NDPA',
};
const CATEGORIES = Object.keys(CATEGORY_TEXT) as SnagCategory[];
const ROLES: GrievanceRole[] = ['borrower', 'harvested_contact', 'customer', 'other'];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ID_LIKE = /(?<!\d)\d{10,11}(?!\d)/;

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function validateGrievanceInput(input: GrievanceInput): GrievanceValidationError[] {
  const errors: GrievanceValidationError[] = [];
  const add = (field: string, code: string, message: string) => errors.push({ field, code, message });
  const text = (v: unknown) => typeof v === 'string' && v.trim().length > 0;

  if (!ROLES.includes(input?.role)) add('role', 'role_invalid', `role must be one of ${ROLES.join(', ')}.`);
  if (!text(input?.subject?.name)) add('subject.name', 'name_required', 'Your name is required.');
  const hasEmail = text(input?.subject?.email);
  const hasPhone = text(input?.subject?.phone);
  if (!hasEmail && !hasPhone) add('subject', 'reply_channel_required', 'Give an email address or phone number the company can reply to.');
  if (hasEmail && !EMAIL.test(input.subject.email!.trim())) add('subject.email', 'email_invalid_format', 'Email address format is invalid.');
  if (!text(input?.controller?.name)) add('controller.name', 'controller_required', 'Name the company or app.');
  if (!Array.isArray(input?.categories) || input.categories.length === 0) {
    add('categories', 'categories_required', 'Choose at least one thing that happened.');
  } else if (input.categories.some((c) => !CATEGORIES.includes(c))) {
    add('categories', 'category_invalid', `Categories must be from: ${CATEGORIES.join(', ')}.`);
  }
  if (!text(input?.narrative)) add('narrative', 'narrative_required', 'Describe what happened.');
  if (!ISO_DATE.test(input?.servedOn ?? '')) add('servedOn', 'served_on_invalid', 'servedOn must be an ISO date (YYYY-MM-DD).');
  if (input?.decisionWithinDays !== undefined && (!Number.isInteger(input.decisionWithinDays) || input.decisionWithinDays < 1)) {
    add('decisionWithinDays', 'decision_days_invalid', 'decisionWithinDays must be a whole number of days, at least 1.');
  }
  if (input?.servedBy && !input.servedBy.authorityConfirmed) {
    add('servedBy.authorityConfirmed', 'authority_unconfirmed', 'An organisation may serve this notice only with the data subject’s confirmed authority.');
  }
  return errors;
}

function requestsFor(input: GrievanceInput): GrievanceRequestItem[] {
  const items: GrievanceRequestItem[] = [];
  const add = (type: DSRType, description: string) => {
    if (!items.some((i) => i.type === type)) items.push({ type, description });
  };
  if (input.role === 'harvested_contact') {
    // A harvested contact never consented, so withdrawal does not apply.
    add('objection', 'I object to any processing of my personal data. I never gave it to you and have no relationship with you.');
    add('erasure', 'Erase my name, phone number and any other personal data you obtained from another person’s phone.');
    add('access', 'Tell me what personal data you hold about me, where you got it, and who you have shared it with.');
  } else if (input.role === 'borrower') {
    add('withdraw_consent', 'I withdraw any consent I gave for access to my phone contacts, photos and other device data.');
    add('erasure', 'Erase the contacts and other device data you collected from my phone, and stop contacting the people in them.');
    add('access', 'Tell me what personal data you hold about me and who you have shared it with.');
  } else {
    add('access', 'Tell me what personal data you hold about me and who you have shared it with.');
  }
  if (input.categories.includes('unsolicited_messages')) add('objection', 'Stop sending me messages and making calls to me.');
  if (input.categories.includes('unauthorised_disclosure')) add('erasure', 'Erase personal data you disclosed without my authority, and tell me who received it.');
  if (input.categories.includes('unlawful_automated_processing')) {
    add('automated_decision_making', 'I ask for a person to review any decision made about me by automated processing, and I contest it.');
  }
  return items;
}

/** Splits text into SMS segments of at most 160 characters with "(i/n)" markers. */
export function toSmsSegments(text: string, limit = 160): string[] {
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  const budget = limit - 8; // room for " (99/99)"
  const parts: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > budget && current) {
      parts.push(current);
      current = word.slice(0, budget);
    } else {
      current = next.slice(0, budget);
    }
  }
  if (current) parts.push(current);
  return parts.length <= 1 ? parts : parts.map((p, i) => `${p} (${i + 1}/${parts.length})`);
}

/**
 * Composes a grievance packet. Throws a TypeError listing validation codes
 * when the input is invalid; call `validateGrievanceInput` first to show
 * field errors in a form.
 *
 * @example
 * ```ts
 * const packet = composeGrievancePacket({
 *   role: 'harvested_contact',
 *   subject: { name: 'Ada', phone: '08031234567' },
 *   controller: { name: 'QuickCash App', dpoEmail: 'dpo@quickcash.example' },
 *   categories: ['unauthorised_disclosure', 'unsolicited_messages'],
 *   narrative: 'Your agents sent messages to me about someone else’s loan.',
 *   servedOn: '2026-10-13',
 * });
 * packet.renderings.whatsapp; // ready to paste
 * ```
 */
export function composeGrievancePacket(input: GrievanceInput): GrievancePacket {
  const errors = validateGrievanceInput(input);
  if (errors.length > 0) throw new TypeError(`Invalid grievance: ${errors.map((e) => e.code).join(', ')}`);

  const days = Math.min(input.decisionWithinDays ?? 30, 30);
  const decisionDueBy = addDays(input.servedOn, days);
  const requests = requestsFor(input);
  const warnings: string[] = [];
  if (ID_LIKE.test(input.narrative)) {
    warnings.push('Your description contains a long number. Do not include your NIN, BVN or bank account number; the company does not need them to act.');
  }
  if (input.categories.includes('child_privacy')) {
    warnings.push("This involves a child's data (NDPA Section 31). Consider asking a parent or guardian to serve the notice.");
  }
  if (!input.controller.dpoEmail && !input.controller.contactEmail) {
    warnings.push('No company email given. Send by the company’s published contact channel and keep proof of the date you sent it.');
  }

  const subj = input.subject;
  const reply = [subj.email && `email ${subj.email.trim()}`, subj.phone && `phone ${subj.phone.trim()}`].filter(Boolean).join(' or ');
  const what = input.categories.map((c) => CATEGORY_TEXT[c]).join('; ');
  const by = input.servedBy ? ` This notice is served by ${input.servedBy.organisation} on my behalf and with my authority.` : '';
  const lines = [
    `To: ${input.controller.name}${input.controller.address ? `, ${input.controller.address}` : ''}`,
    `From: ${subj.name.trim()}`,
    `Date: ${input.servedOn}`,
    '',
    'Notice to address grievance (Nigeria Data Protection Act 2023; NDPC GAID 2025, Article 40 and Schedule 9)',
    '',
    `I complain of: ${what}.`,
    '',
    input.narrative.trim(),
    '',
    'I make the following requests under Part VI of the NDPA:',
    ...requests.map((r, i) => `${i + 1}. ${r.description}`),
    '',
    `Please address this complaint and tell me your decision by ${decisionDueBy}. Reply to me by ${reply}.${by}`,
    '',
    'If I do not receive a satisfactory response, I may lodge a complaint with the Nigeria Data Protection Commission under Section 46 of the Act.',
  ];
  const body = lines.join('\n');
  const short =
    `${input.controller.name}: I, ${subj.name.trim()}, complain of ${what}. ` +
    `Under the NDPA I ask you to ${requests.map((r) => r.type.replace(/_/g, ' ')).join(', ')}. ` +
    `Decide by ${decisionDueBy}. Reply: ${reply}.`;

  return {
    role: input.role,
    categories: [...input.categories],
    requests,
    servedOn: input.servedOn,
    decisionDueBy,
    reminders: [
      { on: addDays(decisionDueBy, -5), text: `${input.controller.name} has 5 days left to decide on your data complaint (due ${decisionDueBy}).` },
      { on: decisionDueBy, text: `Today is the decision date for your data complaint to ${input.controller.name}. If they have not responded, you can prepare a complaint to the NDPC.` },
    ],
    renderings: {
      email: {
        to: input.controller.dpoEmail ?? input.controller.contactEmail,
        subject: `Notice to address grievance under the NDPA: ${subj.name.trim()}`,
        body,
      },
      whatsapp: body,
      sms: toSmsSegments(short),
    },
    warnings,
  };
}

export interface ComplaintDraftOptions {
  /** ISO date of drafting. Must be after the decision date. */
  asOf: string;
  /** The subject must confirm they want to complain. Never default this. */
  subjectConfirmed: boolean;
  controllerResponse?: 'none' | 'unsatisfactory';
}

/**
 * Drafts the text of a complaint to the Nigeria Data Protection Commission
 * under NDPA Section 46, after the controller's decision date has passed.
 * It is a draft for the subject to send; it is never filed automatically.
 */
export function draftSection46Complaint(packet: GrievancePacket, input: GrievanceInput, options: ComplaintDraftOptions): string {
  if (options.subjectConfirmed !== true) {
    throw new Error('The data subject must confirm before a complaint is drafted.');
  }
  if (!ISO_DATE.test(options.asOf) || options.asOf <= packet.decisionDueBy) {
    throw new RangeError(`A complaint can be drafted only after the decision date (${packet.decisionDueBy}).`);
  }
  const response = options.controllerResponse === 'unsatisfactory'
    ? 'The company responded, but the response did not resolve my complaint.'
    : 'The company did not respond.';
  return [
    'To: Nigeria Data Protection Commission',
    `Complainant: ${input.subject.name.trim()}`,
    `Against: ${input.controller.name}`,
    `Date: ${options.asOf}`,
    '',
    'Complaint under Section 46 of the Nigeria Data Protection Act 2023',
    '',
    `On ${packet.servedOn} I served a notice to address grievance on ${input.controller.name}, asking for a decision by ${packet.decisionDueBy}. ${response}`,
    '',
    `My complaint concerns: ${packet.categories.map((c) => CATEGORY_TEXT[c]).join('; ')}.`,
    '',
    input.narrative.trim(),
    '',
    'I attach a copy of my notice and proof of the date I sent it.',
    '',
    'NDPC reference: (to be assigned by the Commission)',
  ].join('\n');
}
