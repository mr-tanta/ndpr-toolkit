import { assemblePolicy } from '../../utils/policy-sections';
import { createDefaultContext } from '../../types/policy-engine';
import type { TemplateContext } from '../../types/policy-engine';

/** Helper that returns a fully populated context for testing. */
function makeFullContext(overrides?: Partial<TemplateContext>): TemplateContext {
  const ctx = createDefaultContext();
  ctx.org.name = 'Acme Ltd';
  ctx.org.website = 'https://acme.example.com';
  ctx.org.privacyEmail = 'privacy@acme.example.com';
  ctx.org.address = '42 Marina Road, Lagos';
  ctx.org.dpoName = 'Jane Doe';
  ctx.org.dpoEmail = 'dpo@acme.example.com';
  ctx.org.industry = 'saas';
  ctx.org.orgSize = 'midsize';
  ctx.purposes = ['service_delivery', 'analytics'];
  // Select a few data categories
  ctx.dataCategories = ctx.dataCategories.map((cat) =>
    ['full-name', 'contact-details', 'usage-data'].includes(cat.id)
      ? { ...cat, selected: true }
      : cat,
  );
  return { ...ctx, ...overrides };
}

describe('assemblePolicy', () => {
  it('returns at least 9 sections for a basic context (8 core + retention)', () => {
    const sections = assemblePolicy(makeFullContext());
    expect(sections.length).toBeGreaterThanOrEqual(9);

    const ids = sections.map((s) => s.id);
    expect(ids).toContain('introduction');
    expect(ids).toContain('data-collection');
    expect(ids).toContain('legal-basis');
    expect(ids).toContain('data-usage');
    expect(ids).toContain('data-sharing');
    expect(ids).toContain('data-subject-rights');
    expect(ids).toContain('data-security');
    expect(ids).toContain('contact-info');
    expect(ids).toContain('data-retention');
  });

  it('includes children data protection section when hasChildrenData is true', () => {
    const sections = assemblePolicy(makeFullContext({ hasChildrenData: true }));
    const ids = sections.map((s) => s.id);
    expect(ids).toContain('children-data-protection');

    const section = sections.find((s) => s.id === 'children-data-protection')!;
    expect(section.template).toContain('Section 31');
    expect(section.template).toContain('parental');
  });

  it('does NOT include children section when hasChildrenData is false', () => {
    const sections = assemblePolicy(makeFullContext({ hasChildrenData: false }));
    const ids = sections.map((s) => s.id);
    expect(ids).not.toContain('children-data-protection');
  });

  it('includes cross-border section when hasCrossBorderTransfer is true', () => {
    const sections = assemblePolicy(
      makeFullContext({ hasCrossBorderTransfer: true }),
    );
    const ids = sections.map((s) => s.id);
    expect(ids).toContain('cross-border-transfers');

    const section = sections.find((s) => s.id === 'cross-border-transfers')!;
    expect(section.template).toContain('Section');
    expect(section.template).toContain('43');
  });

  it('includes automated decision section when hasAutomatedDecisions is true', () => {
    const sections = assemblePolicy(
      makeFullContext({ hasAutomatedDecisions: true }),
    );
    const ids = sections.map((s) => s.id);
    expect(ids).toContain('automated-decision-making');

    const section = sections.find((s) => s.id === 'automated-decision-making')!;
    expect(section.template).toContain('Section 39');
  });

  it('includes sensitive data section when hasSensitiveData is true', () => {
    const sections = assemblePolicy(
      makeFullContext({ hasSensitiveData: true }),
    );
    const ids = sections.map((s) => s.id);
    expect(ids).toContain('sensitive-data-processing');
  });

  it('data collection section mentions selected data categories', () => {
    const sections = assemblePolicy(makeFullContext());
    const collection = sections.find((s) => s.id === 'data-collection')!;

    expect(collection.template).toContain('Full Name');
    expect(collection.template).toContain('Contact Details');
    expect(collection.template).toContain('Usage & Analytics Data');
  });

  it('data sharing section includes processor names when provided', () => {
    const ctx = makeFullContext({
      thirdPartyProcessors: [
        { name: 'Paystack', purpose: 'Payment processing', country: 'Nigeria' },
        { name: 'AWS', purpose: 'Cloud hosting', country: 'United States' },
      ],
    });
    const sections = assemblePolicy(ctx);
    const sharing = sections.find((s) => s.id === 'data-sharing')!;

    expect(sharing.template).toContain('Paystack');
    expect(sharing.template).toContain('AWS');
    expect(sharing.template).toContain('Payment processing');
  });

  it('data sharing section states no sharing when no processors are listed', () => {
    const ctx = makeFullContext({ thirdPartyProcessors: [] });
    const sections = assemblePolicy(ctx);
    const sharing = sections.find((s) => s.id === 'data-sharing')!;

    expect(sharing.template).toContain('do not currently share');
  });

  it('security section mentions PCI-DSS for fintech industry', () => {
    const ctx = makeFullContext();
    ctx.org.industry = 'fintech';
    const sections = assemblePolicy(ctx);
    const security = sections.find((s) => s.id === 'data-security')!;

    expect(security.template).toContain('PCI-DSS');
  });

  it('security section mentions HIPAA-aligned for healthcare industry', () => {
    const ctx = makeFullContext();
    ctx.org.industry = 'healthcare';
    const sections = assemblePolicy(ctx);
    const security = sections.find((s) => s.id === 'data-security')!;

    expect(security.template).toContain('HIPAA-aligned');
  });

  it('sections are ordered sequentially', () => {
    const sections = assemblePolicy(
      makeFullContext({
        hasChildrenData: true,
        hasSensitiveData: true,
        hasCrossBorderTransfer: true,
        hasAutomatedDecisions: true,
      }),
    );

    for (let i = 0; i < sections.length; i++) {
      expect(sections[i].order).toBe(i + 1);
    }
  });

  it('all sections have included set to true', () => {
    const sections = assemblePolicy(makeFullContext());
    for (const section of sections) {
      expect(section.included).toBe(true);
    }
  });

  it('data retention adapts content for fintech industry', () => {
    const ctx = makeFullContext();
    ctx.org.industry = 'fintech';
    const sections = assemblePolicy(ctx);
    const retention = sections.find((s) => s.id === 'data-retention')!;

    expect(retention.template).toContain('Central Bank of Nigeria');
  });
});
