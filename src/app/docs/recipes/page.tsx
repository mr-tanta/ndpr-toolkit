'use client';

import Link from 'next/link';
import { DocLayout } from '../components/DocLayout';

const RECIPES = [
  {
    href: '/docs/recipes/ecommerce-consent',
    title: 'Ecommerce Consent',
    intro:
      'Cookie consent on checkout, cart-abandonment cookies, marketing-pixel category, and payment-processor disclosure.',
    template: 'ecommerce',
    sections: ['Section 26', 'Section 27', 'Section 41'],
  },
  {
    href: '/docs/recipes/newsletter-consent',
    title: 'Newsletter Consent',
    intro:
      "Section 26 affirmative opt-in for newsletter signups — no pre-checked boxes, no inferred consent. Compatible with double opt-in via your email provider's confirmation flow.",
    template: 'saas',
    sections: ['Section 26'],
  },
  {
    href: '/docs/recipes/contact-form-disclosure',
    title: 'Contact Form Disclosure',
    intro:
      'Section 27 privacy notice on public contact forms — what data you collect, lawful basis, retention, the right to lodge a complaint with NDPC.',
    template: 'saas',
    sections: ['Section 25', 'Section 27', 'Section 46'],
  },
  {
    href: '/docs/recipes/careers-rights',
    title: 'Careers / Applicant Data Rights',
    intro:
      'Handling job applicant data: lawful basis (legitimate interest), retention (rejected vs successful candidates), erasure on request, automated CV-screening disclosure (Section 37).',
    template: 'saas',
    sections: ['Section 25(1)(f)', 'Section 34(1)(d)', 'Section 37'],
  },
  {
    href: '/docs/recipes/admin-dsr-management',
    title: 'Admin DSR Management',
    intro:
      'DPO/staff-side workflow for handling subject requests: queue, identity verification, response within 30 days, audit trail, NDPC complaint route handling.',
    template: 'saas',
    sections: ['Section 34', 'Section 46'],
  },
];

export default function RecipesIndex() {
  return (
    <DocLayout title="Recipes" description="Production-tested NDPA 2023 patterns for common adopter scenarios.">
      <p className="mb-8 text-lg text-muted-foreground">
        Five production-tested patterns drawn from real Nigerian adopter feedback. Each recipe shows a complete component snippet you can paste into your project, the matching policy template, and the live demo where one exists.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {RECIPES.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="block rounded-lg border border-border p-5 hover:bg-card transition"
          >
            <h2 className="text-lg font-semibold text-foreground mb-2">{r.title} →</h2>
            <p className="text-sm text-muted-foreground mb-3">{r.intro}</p>
            <p className="text-xs text-muted-foreground">
              Template: <code>{r.template}</code> · NDPA: {r.sections.join(', ')}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-12 rounded-lg border border-border bg-card p-6">
        <h3 className="text-base font-semibold text-foreground mb-2">Need a recipe we don&apos;t have?</h3>
        <p className="text-sm text-muted-foreground">
          Open an issue at{' '}
          <a href="https://github.com/mr-tanta/ndpr-toolkit/issues" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
            github.com/mr-tanta/ndpr-toolkit/issues
          </a>{' '}
          with the use case. Recipes are the fastest changelog item to land — usually a single PR.
        </p>
      </div>
    </DocLayout>
  );
}
