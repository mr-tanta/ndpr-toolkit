'use client';

import { useMemo, useState } from 'react';
import {
  composeGrievancePacket,
  validateGrievanceInput,
  type GrievanceInput,
  type GrievanceRole,
  type SnagCategory,
} from '@tantainnovative/ndpr-toolkit/server';

const ROLES: Array<{ value: GrievanceRole; label: string }> = [
  { value: 'harvested_contact', label: 'They contacted me about someone else’s loan or account' },
  { value: 'borrower', label: 'I borrowed from them and they misused my data or contacts' },
  { value: 'customer', label: 'I am their customer or user' },
  { value: 'other', label: 'Something else' },
];

const CATEGORIES: Array<{ value: SnagCategory; label: string }> = [
  { value: 'unauthorised_disclosure', label: 'They shared my information with others' },
  { value: 'unsolicited_messages', label: 'They keep sending me messages or calling me' },
  { value: 'unauthorised_access', label: 'They got into my data or phone without permission' },
  { value: 'unlawful_automated_processing', label: 'A computer decided something about me unfairly' },
  { value: 'child_privacy', label: 'It involves a child' },
  { value: 'other', label: 'Other' },
];

const today = () => new Date().toISOString().slice(0, 10);

function CopyBlock({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <button
          type="button"
          className="text-xs rounded border border-border px-2 py-1 hover:bg-card"
          onClick={() => {
            navigator.clipboard?.writeText(text).then(() => setCopied(true), () => setCopied(false));
          }}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="whitespace-pre-wrap p-3 text-sm text-foreground font-sans">{text}</pre>
    </div>
  );
}

export function GrievanceWizard() {
  const [role, setRole] = useState<GrievanceRole>('harvested_contact');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [categories, setCategories] = useState<SnagCategory[]>([]);
  const [narrative, setNarrative] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const input: GrievanceInput = {
    role,
    subject: { name, phone: phone || undefined, email: email || undefined },
    controller: { name: company, dpoEmail: companyEmail || undefined },
    categories,
    narrative,
    servedOn: today(),
  };
  const errors = useMemo(() => validateGrievanceInput(input), [role, name, phone, email, company, companyEmail, categories, narrative]); // eslint-disable-line react-hooks/exhaustive-deps
  const packet = submitted && errors.length === 0 ? composeGrievancePacket(input) : null;

  const toggle = (value: SnagCategory) =>
    setCategories((prev) => (prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]));

  const field = 'w-full rounded border border-border bg-background px-3 py-2 text-sm';

  return (
    <div className="space-y-8">
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
      >
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-foreground mb-1">What happened?</legend>
          {ROLES.map((r) => (
            <label key={r.value} className="flex items-start gap-2 text-sm text-foreground">
              <input type="radio" name="role" checked={role === r.value} onChange={() => setRole(r.value)} className="mt-1" />
              {r.label}
            </label>
          ))}
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-foreground mb-1">Tick all that apply</legend>
          {CATEGORIES.map((c) => (
            <label key={c.value} className="flex items-start gap-2 text-sm text-foreground">
              <input type="checkbox" checked={categories.includes(c.value)} onChange={() => toggle(c.value)} className="mt-1" />
              {c.label}
            </label>
          ))}
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="block font-medium text-foreground mb-1">Company or app name</span>
            <input className={field} value={company} onChange={(e) => setCompany(e.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="block font-medium text-foreground mb-1">Company email (if you know it)</span>
            <input className={field} type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="block font-medium text-foreground mb-1">Your name</span>
            <input className={field} value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="block font-medium text-foreground mb-1">Your phone (for their reply)</span>
            <input className={field} inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="block font-medium text-foreground mb-1">Your email (optional)</span>
            <input className={field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
        </div>

        <label className="block text-sm">
          <span className="block font-medium text-foreground mb-1">Describe what happened, in your own words</span>
          <textarea className={`${field} min-h-32`} value={narrative} onChange={(e) => setNarrative(e.target.value)} />
        </label>

        {submitted && errors.length > 0 && (
          <ul role="alert" className="list-disc pl-5 text-sm text-red-600 dark:text-red-400">
            {errors.map((e) => (
              <li key={e.code}>{e.message}</li>
            ))}
          </ul>
        )}

        <button type="submit" className="rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold">
          Write my notice
        </button>
      </form>

      {packet && (
        <section aria-live="polite" className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Your notice is ready</h2>
          <p className="text-sm text-muted-foreground">
            Send it yourself and keep proof of the date. The company should decide by <strong>{packet.decisionDueBy}</strong>.
            If they do not, you can complain to the Nigeria Data Protection Commission.
          </p>
          {packet.warnings.length > 0 && (
            <ul className="list-disc pl-5 text-sm text-amber-700 dark:text-amber-400">
              {packet.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          )}
          {packet.renderings.email.to && (
            <a
              className="inline-block rounded-lg border border-border px-4 py-2 text-sm hover:bg-card"
              href={`mailto:${encodeURIComponent(packet.renderings.email.to)}?subject=${encodeURIComponent(packet.renderings.email.subject)}&body=${encodeURIComponent(packet.renderings.email.body)}`}
            >
              Open in my email app
            </a>
          )}
          <CopyBlock label="Email or WhatsApp" text={packet.renderings.whatsapp} />
          <CopyBlock label={`SMS (${packet.renderings.sms.length} part${packet.renderings.sms.length === 1 ? '' : 's'})`} text={packet.renderings.sms.join('\n\n')} />
        </section>
      )}
    </div>
  );
}
