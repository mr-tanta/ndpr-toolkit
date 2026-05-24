/**
 * Tests for the 5 org-specific privacy-policy templates added in 3.7.0.
 *
 * Each template should:
 * - return a fully-populated TemplateContext (not just partial overrides)
 * - set `org.industry` to the matching `Industry` enum value
 * - select sector-appropriate data categories
 * - flip the right boolean flags (children/sensitive/financial/cross-border)
 * - apply optional org overrides correctly
 */
import {
  templateContextFor,
  createOrgTemplate,
  ORG_POLICY_TEMPLATE_REGISTRY,
  type OrgPolicyTemplateId,
} from '../../utils/policy-templates-orgs';

describe('templateContextFor', () => {
  const ALL_IDS: OrgPolicyTemplateId[] = [
    'saas',
    'ecommerce',
    'school',
    'healthcare',
    'procurement',
  ];

  it('returns a complete TemplateContext for every supported id', () => {
    for (const id of ALL_IDS) {
      const ctx = templateContextFor(id);
      expect(ctx.org).toBeDefined();
      expect(ctx.org.country).toBe('Nigeria');
      expect(Array.isArray(ctx.dataCategories)).toBe(true);
      expect(ctx.dataCategories.length).toBeGreaterThan(0);
      expect(Array.isArray(ctx.purposes)).toBe(true);
      expect(ctx.purposes.length).toBeGreaterThan(0);
      expect(Array.isArray(ctx.thirdPartyProcessors)).toBe(true);
      expect(typeof ctx.hasChildrenData).toBe('boolean');
      expect(typeof ctx.hasSensitiveData).toBe('boolean');
      expect(typeof ctx.hasFinancialData).toBe('boolean');
      expect(typeof ctx.hasCrossBorderTransfer).toBe('boolean');
      expect(typeof ctx.hasAutomatedDecisions).toBe('boolean');
    }
  });

  it('throws for an unknown template id', () => {
    // @ts-expect-error — deliberate invalid input
    expect(() => templateContextFor('crypto')).toThrow(/Unknown org template/);
  });

  it('saas: cross-border defaults true, no children, no sensitive, no financial', () => {
    const ctx = templateContextFor('saas');
    expect(ctx.org.industry).toBe('saas');
    expect(ctx.hasCrossBorderTransfer).toBe(true);
    expect(ctx.hasChildrenData).toBe(false);
    expect(ctx.hasSensitiveData).toBe(false);
    expect(ctx.hasFinancialData).toBe(false);
  });

  it('ecommerce: financial + cross-border + automated-decisions true', () => {
    const ctx = templateContextFor('ecommerce');
    expect(ctx.org.industry).toBe('ecommerce');
    expect(ctx.hasFinancialData).toBe(true);
    expect(ctx.hasCrossBorderTransfer).toBe(true);
    expect(ctx.hasAutomatedDecisions).toBe(true);
    expect(ctx.hasChildrenData).toBe(false);
    expect(ctx.hasSensitiveData).toBe(false);
  });

  it('school: hasChildrenData true (Section 31 — parental consent)', () => {
    const ctx = templateContextFor('school');
    expect(ctx.org.industry).toBe('education');
    expect(ctx.hasChildrenData).toBe(true);
    expect(ctx.hasSensitiveData).toBe(false);
  });

  it('healthcare: hasSensitiveData true (Section 30) + financial true', () => {
    const ctx = templateContextFor('healthcare');
    expect(ctx.org.industry).toBe('healthcare');
    expect(ctx.hasSensitiveData).toBe(true);
    expect(ctx.hasFinancialData).toBe(true);
    expect(ctx.hasChildrenData).toBe(false);
  });

  it('procurement: financial true, no sensitive, no cross-border', () => {
    const ctx = templateContextFor('procurement');
    expect(ctx.org.industry).toBe('government');
    expect(ctx.hasFinancialData).toBe(true);
    expect(ctx.hasSensitiveData).toBe(false);
    expect(ctx.hasCrossBorderTransfer).toBe(false);
  });

  it('applies organisation overrides', () => {
    const ctx = templateContextFor('healthcare', {
      orgName: 'Lagos Heart Centre',
      dpoEmail: 'dpo@lhc.ng',
      address: '1 Marina, Lagos',
    });
    expect(ctx.org.name).toBe('Lagos Heart Centre');
    expect(ctx.org.dpoEmail).toBe('dpo@lhc.ng');
    expect(ctx.org.address).toBe('1 Marina, Lagos');
    // Other org defaults survive
    expect(ctx.org.country).toBe('Nigeria');
    // Sensitive-data flag from the template is unchanged
    expect(ctx.hasSensitiveData).toBe(true);
  });

  it('returns a fresh object each call (no shared state)', () => {
    const a = templateContextFor('saas');
    const b = templateContextFor('saas');
    a.org.name = 'mutated';
    expect(b.org.name).toBe('');
  });

  it('createOrgTemplate is an alias of templateContextFor', () => {
    expect(createOrgTemplate).toBe(templateContextFor);
  });
});

describe('ORG_POLICY_TEMPLATE_REGISTRY', () => {
  it('lists all 5 templates with id, label, description, examples', () => {
    const ids = Object.keys(ORG_POLICY_TEMPLATE_REGISTRY).sort();
    expect(ids).toEqual(['ecommerce', 'healthcare', 'procurement', 'saas', 'school']);
    for (const id of ids as OrgPolicyTemplateId[]) {
      const entry = ORG_POLICY_TEMPLATE_REGISTRY[id];
      expect(entry.id).toBe(id);
      expect(typeof entry.label).toBe('string');
      expect(entry.label.length).toBeGreaterThan(0);
      expect(typeof entry.description).toBe('string');
      expect(entry.description.length).toBeGreaterThan(0);
      expect(entry.examples.length).toBeGreaterThan(0);
    }
  });

  it('every id in the registry has a working factory', () => {
    for (const id of Object.keys(ORG_POLICY_TEMPLATE_REGISTRY) as OrgPolicyTemplateId[]) {
      expect(() => templateContextFor(id)).not.toThrow();
    }
  });
});
