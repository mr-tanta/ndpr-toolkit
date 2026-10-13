/**
 * Schema-as-RoPA: annotate personal-data columns once in a Prisma schema,
 * lint for unannotated ones, and generate draft Record of Processing
 * Activities entries from the annotations.
 *
 * Annotation syntax, in Prisma triple-slash doc comments on a model (defaults
 * for every field) or a field (overrides):
 *
 *   /// @ndpr subject=customer purpose=kyc basis=legal_obligation retain=P5Y
 *   model Customer {
 *     /// @ndpr category=identifier.bvn processor=smile-identity
 *     bvn String
 *     /// @ndpr none
 *     internalScore Int
 *   }
 *
 * Keys: category, purpose, basis, retain (ISO 8601 duration such as P5Y or
 * P18M), subject, processor (comma-separated), condition (required for
 * sensitive categories, NDPA Section 30), subject_class=child (Section 31),
 * decision=automated (Section 37), and `none` to mark a field as not personal.
 *
 * The lint never infers a lawful basis, purpose or retention period. A missing
 * one is an error. Generated records are `asserted` drafts: a person must
 * review them before they count as the organisation's RoPA.
 *
 * The NDPA has no standalone RoPA section; the duty comes from the Section
 * 24(3) accountability principle and NDPC GAID 2025 (Art. 13, Art. 52, Sch. 1).
 * Pure utility, zero React, no Prisma dependency.
 */

import type { LawfulBasis } from '../types/lawful-basis';

export interface SchemaAnnotation {
  none?: boolean;
  category?: string;
  purpose?: string;
  basis?: string;
  retain?: string;
  subject?: string;
  processors?: string[];
  condition?: string;
  subjectClass?: string;
  decision?: string;
  /** Unrecognised keys, kept so typos surface in the lint. */
  unknown?: Record<string, string>;
}

export interface SchemaField {
  name: string;
  type: string;
  line: number;
  annotation?: SchemaAnnotation;
}

export interface SchemaModel {
  name: string;
  line: number;
  annotation?: SchemaAnnotation;
  fields: SchemaField[];
}

export type SchemaLintSeverity = 'error' | 'warning';

export interface SchemaLintFinding {
  severity: SchemaLintSeverity;
  code: string;
  model: string;
  field?: string;
  line: number;
  message: string;
}

export interface SchemaLintResult {
  findings: SchemaLintFinding[];
  errors: number;
  warnings: number;
  coverage: { personalFieldsDetected: number; annotated: number; markedNotPersonal: number };
}

const LAWFUL_BASES: LawfulBasis[] = ['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_interest', 'legitimate_interests'];
const KNOWN_KEYS = new Set(['category', 'purpose', 'basis', 'retain', 'subject', 'processor', 'condition', 'subject_class', 'decision']);
const ISO_DURATION = /^P(?:\d+Y)?(?:\d+M)?(?:\d+W)?(?:\d+D)?$/;

/**
 * Field-name tokens that suggest personal data in Nigerian systems. Matched
 * against the camelCase / snake_case tokens of each field name.
 */
export const NIGERIAN_PII_LEXICON: Record<string, { category: string; sensitive?: boolean }> = {
  bvn: { category: 'identifier.bvn' },
  nin: { category: 'identifier.nin' },
  vnin: { category: 'identifier.nin' },
  passport: { category: 'identifier.passport' },
  identifier: { category: 'identifier.unspecified' },
  voters: { category: 'identifier.voters_card' },
  vin: { category: 'identifier.voters_card' },
  phone: { category: 'contact.phone' },
  msisdn: { category: 'contact.phone' },
  mobile: { category: 'contact.phone' },
  whatsapp: { category: 'contact.phone' },
  email: { category: 'contact.email' },
  address: { category: 'contact.address' },
  name: { category: 'identity.name' },
  surname: { category: 'identity.name' },
  dob: { category: 'identity.date_of_birth' },
  birth: { category: 'identity.date_of_birth' },
  gender: { category: 'identity.gender' },
  nationality: { category: 'identity.nationality' },
  origin: { category: 'identity.state_of_origin' },
  lga: { category: 'identity.state_of_origin' },
  kin: { category: 'third_party.next_of_kin' },
  guarantor: { category: 'third_party.guarantor' },
  referee: { category: 'third_party.referee' },
  salary: { category: 'financial.income' },
  income: { category: 'financial.income' },
  account: { category: 'financial.account' },
  acct: { category: 'financial.account' },
  nuban: { category: 'financial.account' },
  card: { category: 'financial.card' },
  ip: { category: 'online.ip_address' },
  agent: { category: 'online.user_agent' },
  device: { category: 'online.device' },
  location: { category: 'location' },
  latitude: { category: 'location' },
  longitude: { category: 'location' },
  religion: { category: 'sensitive.religion', sensitive: true },
  tribe: { category: 'sensitive.ethnicity', sensitive: true },
  ethnicity: { category: 'sensitive.ethnicity', sensitive: true },
  health: { category: 'sensitive.health', sensitive: true },
  medical: { category: 'sensitive.health', sensitive: true },
  diagnosis: { category: 'sensitive.health', sensitive: true },
  genotype: { category: 'sensitive.health', sensitive: true },
  biometric: { category: 'sensitive.biometric', sensitive: true },
  fingerprint: { category: 'sensitive.biometric', sensitive: true },
  selfie: { category: 'sensitive.biometric', sensitive: true },
  face: { category: 'sensitive.biometric', sensitive: true },
  political: { category: 'sensitive.political_opinion', sensitive: true },
};

/** Tokens that look personal but are usually not, when they stand alone. */
const NAME_EXCEPTIONS = new Set(['filename', 'username', 'tablename', 'modelname', 'hostname', 'pathname']);

export function tokenizeFieldName(name: string): string[] {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/**
 * "name" alone is ambiguous (projectName, activityName). It counts as a person's
 * name only on its own or after one of these qualifiers.
 */
const PERSON_NAME_QUALIFIERS = new Set([
  'first', 'last', 'middle', 'full', 'given', 'family', 'maiden', 'display',
  'subject', 'customer', 'user', 'member', 'contact', 'reporter', 'applicant',
  'employee', 'staff', 'patient', 'student', 'parent', 'guardian', 'kin',
  'guarantor', 'referee', 'beneficiary', 'holder', 'borrower', 'account', 'person',
]);

/** Suggests a category for a field name, or undefined when nothing matches. */
export function suggestCategory(fieldName: string): { category: string; sensitive: boolean } | undefined {
  if (NAME_EXCEPTIONS.has(fieldName.toLowerCase())) return undefined;
  const tokens = tokenizeFieldName(fieldName);
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token === 'name' && tokens.length > 1 && !PERSON_NAME_QUALIFIERS.has(tokens[i - 1] ?? '')) continue;
    const hit = NIGERIAN_PII_LEXICON[token];
    if (hit) return { category: hit.category, sensitive: hit.sensitive === true };
  }
  return undefined;
}

/**
 * Linear-time `key=value` / `key="quoted value"` tokenizer. Hand-written
 * rather than a global regex so adversarial input (long runs of `_` or `=`)
 * cannot cause polynomial backtracking.
 */
function parseKeyValuePairs(body: string): Array<[string, string]> {
  const pairs: Array<[string, string]> = [];
  const isSpace = (c: string) => c === ' ' || c === '\t' || c === '\n' || c === '\r';
  let i = 0;
  while (i < body.length) {
    while (i < body.length && isSpace(body[i])) i += 1;
    const keyStart = i;
    while (i < body.length && !isSpace(body[i]) && body[i] !== '=') i += 1;
    const key = body.slice(keyStart, i);
    if (body[i] !== '=') continue; // bare word without a value: skip it
    i += 1;
    let value: string;
    if (body[i] === '"') {
      const close = body.indexOf('"', i + 1);
      const end = close === -1 ? body.length : close;
      value = body.slice(i + 1, end);
      i = end + 1;
    } else {
      const valueStart = i;
      while (i < body.length && !isSpace(body[i])) i += 1;
      value = body.slice(valueStart, i);
    }
    if (/^[a-z_]+$/.test(key) && value.length > 0) pairs.push([key, value]);
  }
  return pairs;
}

function parseAnnotation(text: string): SchemaAnnotation | undefined {
  const idx = text.indexOf('@ndpr');
  if (idx === -1) return undefined;
  const body = text.slice(idx + 5).trim();
  const out: SchemaAnnotation = {};
  if (/^none\b/.test(body)) {
    out.none = true;
    return out;
  }
  const unknown: Record<string, string> = {};
  for (const [key, rawValue] of parseKeyValuePairs(body)) {
    const value = rawValue.trim();
    switch (key) {
      case 'category': out.category = value; break;
      case 'purpose': out.purpose = value; break;
      case 'basis': out.basis = value; break;
      case 'retain': out.retain = value; break;
      case 'subject': out.subject = value; break;
      case 'processor': out.processors = value.split(',').map((s) => s.trim()).filter(Boolean); break;
      case 'condition': out.condition = value; break;
      case 'subject_class': out.subjectClass = value; break;
      case 'decision': out.decision = value; break;
      default: if (!KNOWN_KEYS.has(key)) unknown[key] = value;
    }
  }
  if (Object.keys(unknown).length > 0) out.unknown = unknown;
  return out;
}

function mergeAnnotations(base: SchemaAnnotation | undefined, extra: SchemaAnnotation | undefined): SchemaAnnotation | undefined {
  if (!base) return extra;
  if (!extra) return base;
  return {
    ...base,
    ...extra,
    unknown: base.unknown || extra.unknown ? { ...base.unknown, ...extra.unknown } : undefined,
  };
}

/**
 * Parses models, fields and `/// @ndpr` annotations from Prisma schema text.
 * Only the subset needed for RoPA is parsed; enums, views and attributes are skipped.
 */
export function parsePrismaSchema(schema: string): SchemaModel[] {
  const lines = schema.split(/\r?\n/);
  const models: SchemaModel[] = [];
  let pendingDoc: string[] = [];
  let current: SchemaModel | null = null;

  lines.forEach((raw, i) => {
    const line = raw.trim();
    const lineNo = i + 1;
    if (line.startsWith('///')) {
      pendingDoc.push(line.slice(3));
      return;
    }
    const docAnnotation = pendingDoc.reduce<SchemaAnnotation | undefined>(
      (acc, text) => mergeAnnotations(acc, parseAnnotation(text)),
      undefined,
    );
    if (line === '' || line.startsWith('//')) {
      if (line === '') pendingDoc = [];
      return;
    }
    pendingDoc = [];

    const modelMatch = /^model\s+(\w+)\s*\{/.exec(line);
    if (modelMatch) {
      current = { name: modelMatch[1], line: lineNo, annotation: docAnnotation, fields: [] };
      models.push(current);
      return;
    }
    if (line.startsWith('}')) {
      current = null;
      return;
    }
    if (!current || line.startsWith('@@')) return;
    const fieldMatch = /^(\w+)\s+([\w[\]?]+)/.exec(line);
    if (!fieldMatch) return;
    const inline = line.includes('/// ') ? parseAnnotation(line.slice(line.indexOf('///') + 3)) : undefined;
    (current as SchemaModel).fields.push({
      name: fieldMatch[1],
      type: fieldMatch[2],
      line: lineNo,
      annotation: mergeAnnotations(docAnnotation, inline),
    });
  });
  return models;
}

const STRUCTURAL_TYPES = /^(?:DateTime|Boolean|Int|BigInt|Float|Decimal)\??$/;

/** Effective annotation for a field: model defaults overlaid by field-level keys. */
export function effectiveAnnotation(model: SchemaModel, field: SchemaField): SchemaAnnotation | undefined {
  if (field.annotation?.none) return field.annotation;
  if (!field.annotation) return undefined;
  return mergeAnnotations(model.annotation, field.annotation);
}

/**
 * Lints a parsed schema: personal-looking fields must be annotated, and every
 * annotation must state category, purpose, basis and retention explicitly.
 */
export function lintSchemaForPersonalData(models: SchemaModel[]): SchemaLintResult {
  const findings: SchemaLintFinding[] = [];
  let personalFieldsDetected = 0;
  let annotated = 0;
  let markedNotPersonal = 0;

  for (const model of models) {
    for (const field of model.fields) {
      const suggestion = STRUCTURAL_TYPES.test(field.type) && !/birth|dob/i.test(field.name)
        ? undefined
        : suggestCategory(field.name);
      const ann = effectiveAnnotation(model, field);
      const at = { model: model.name, field: field.name, line: field.line };

      if (ann?.none) {
        markedNotPersonal += 1;
        continue;
      }
      if (!ann) {
        if (suggestion) {
          personalFieldsDetected += 1;
          findings.push({
            ...at,
            severity: 'error',
            code: 'unannotated_personal_field',
            message: `${model.name}.${field.name} looks like personal data (${suggestion.category}). Add an @ndpr annotation, or "@ndpr none" if it is not personal.`,
          });
        }
        continue;
      }
      personalFieldsDetected += 1;
      annotated += 1;

      for (const key of ['category', 'purpose', 'basis', 'retain'] as const) {
        if (!ann[key]) {
          findings.push({ ...at, severity: 'error', code: `missing_${key}`, message: `${model.name}.${field.name} has no ${key}. The toolkit never infers it; state it explicitly.` });
        }
      }
      if (ann.basis && !LAWFUL_BASES.includes(ann.basis as LawfulBasis)) {
        findings.push({ ...at, severity: 'error', code: 'invalid_basis', message: `basis "${ann.basis}" is not one of ${LAWFUL_BASES.join(', ')} (NDPA Section 25(1)).` });
      }
      if (ann.retain && !(ISO_DURATION.test(ann.retain) && ann.retain !== 'P')) {
        findings.push({ ...at, severity: 'error', code: 'invalid_retain', message: `retain "${ann.retain}" must be an ISO 8601 duration such as P5Y or P18M.` });
      }
      const sensitive = ann.category?.startsWith('sensitive.') || (suggestion?.sensitive && !ann.category);
      if (sensitive && !ann.condition) {
        findings.push({ ...at, severity: 'error', code: 'missing_sensitive_condition', message: `${model.name}.${field.name} is sensitive personal data. Add condition=... naming the NDPA Section 30 condition you rely on.` });
      }
      if (ann.subjectClass === 'child') {
        findings.push({ ...at, severity: 'warning', code: 'child_data', message: `${model.name}.${field.name} holds children's data. NDPA Section 31 applies; confirm consent and age-verification controls.` });
      }
      if (ann.decision === 'automated') {
        findings.push({ ...at, severity: 'warning', code: 'automated_decision', message: `${model.name}.${field.name} feeds an automated decision. Issue Section 37 decision receipts and offer human review.` });
      }
      for (const key of Object.keys(ann.unknown ?? {})) {
        findings.push({ ...at, severity: 'warning', code: 'unknown_annotation_key', message: `Unknown @ndpr key "${key}". Valid keys: ${[...KNOWN_KEYS].join(', ')}, none.` });
      }
    }
  }

  return {
    findings,
    errors: findings.filter((f) => f.severity === 'error').length,
    warnings: findings.filter((f) => f.severity === 'warning').length,
    coverage: { personalFieldsDetected, annotated, markedNotPersonal },
  };
}

export interface SchemaRopaDraft {
  id: string;
  name: string;
  purposes: string[];
  lawfulBasis: LawfulBasis;
  dataCategories: string[];
  sensitiveDataCategories: string[];
  sensitiveDataConditions: string[];
  dataSubjectCategories: string[];
  /** ISO 8601 duration; the longest declared across the grouped fields. */
  retentionPeriod: string;
  processors: string[];
  automatedDecisionMaking: boolean;
  involvesChildren: boolean;
  sourceFields: string[];
  /** `asserted`: written by developers in annotations. A person must review before relying on it. */
  provenanceStatus: 'asserted';
}

function durationMonths(iso: string): number {
  const m = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?$/.exec(iso);
  if (!m) return 0;
  return Number(m[1] ?? 0) * 12 + Number(m[2] ?? 0) + Number(m[3] ?? 0) / 4.345 + Number(m[4] ?? 0) / 30.437;
}

/**
 * Generates draft RoPA entries from annotated fields, grouped by purpose,
 * lawful basis and subject. Fields that fail the lint are skipped; run
 * `lintSchemaForPersonalData` first and fix every error.
 */
export function generateRopaFromSchema(models: SchemaModel[]): SchemaRopaDraft[] {
  const groups = new Map<string, SchemaRopaDraft>();
  for (const model of models) {
    for (const field of model.fields) {
      const ann = effectiveAnnotation(model, field);
      if (!ann || ann.none || !ann.category || !ann.purpose || !ann.basis || !ann.retain) continue;
      if (!LAWFUL_BASES.includes(ann.basis as LawfulBasis) || !ISO_DURATION.test(ann.retain) || ann.retain === 'P') continue;
      const subject = ann.subject ?? 'unspecified';
      const key = `${ann.purpose}|${ann.basis}|${subject}`;
      let draft = groups.get(key);
      if (!draft) {
        draft = {
          id: `schema:${ann.purpose}:${ann.basis}:${subject}`,
          name: `${ann.purpose.replace(/[_-]/g, ' ')} (${subject})`,
          purposes: [ann.purpose],
          lawfulBasis: ann.basis as LawfulBasis,
          dataCategories: [],
          sensitiveDataCategories: [],
          sensitiveDataConditions: [],
          dataSubjectCategories: [subject],
          retentionPeriod: ann.retain,
          processors: [],
          automatedDecisionMaking: false,
          involvesChildren: false,
          sourceFields: [],
          provenanceStatus: 'asserted',
        };
        groups.set(key, draft);
      }
      const add = (list: string[], value: string) => { if (!list.includes(value)) list.push(value); };
      if (ann.category.startsWith('sensitive.')) {
        add(draft.sensitiveDataCategories, ann.category);
        if (ann.condition) add(draft.sensitiveDataConditions, ann.condition);
      } else {
        add(draft.dataCategories, ann.category);
      }
      for (const p of ann.processors ?? []) add(draft.processors, p);
      if (durationMonths(ann.retain) > durationMonths(draft.retentionPeriod)) draft.retentionPeriod = ann.retain;
      if (ann.decision === 'automated') draft.automatedDecisionMaking = true;
      if (ann.subjectClass === 'child') draft.involvesChildren = true;
      add(draft.sourceFields, `${model.name}.${field.name}`);
    }
  }
  return [...groups.values()];
}
