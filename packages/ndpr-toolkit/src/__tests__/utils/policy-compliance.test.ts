import { evaluatePolicyCompliance } from '../../utils/policy-compliance';
import { assemblePolicy } from '../../utils/policy-sections';
import { createDefaultContext } from '../../types/policy-engine';
import type { PrivacyPolicy } from '../../types/privacy';
import type { TemplateContext } from '../../types/policy-engine';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFullContext(
  overrides?: Partial<TemplateContext>,
): TemplateContext {
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
  ctx.dataCategories = ctx.dataCategories.map((cat) =>
    ['full-name', 'contact-details', 'usage-data'].includes(cat.id)
      ? { ...cat, selected: true }
      : cat,
  );
  return { ...ctx, ...overrides };
}

function makeFullPolicy(context: TemplateContext): PrivacyPolicy {
  return {
    id: 'test-policy',
    title: 'Privacy Policy',
    templateId: 'custom',
    organizationInfo: context.org,
    sections: assemblePolicy(context),
    variableValues: {},
    effectiveDate: Date.now(),
    lastUpdated: Date.now(),
    version: '1.0.0',
    applicableFrameworks: ['ndpa'],
  };
}

function makeEmptyPolicy(): PrivacyPolicy {
  return {
    id: 'empty',
    title: 'Empty Policy',
    templateId: 'custom',
    organizationInfo: {
      name: '',
      website: '',
      privacyEmail: '',
    },
    sections: [],
    variableValues: {},
    effectiveDate: 0,
    lastUpdated: 0,
    version: '0.0.1',
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('evaluatePolicyCompliance', () => {
  it('returns score 115 and rating "compliant" for a fully compliant policy', () => {
    const context = makeFullContext();
    const policy = makeFullPolicy(context);
    const result = evaluatePolicyCompliance(policy, context);

    expect(result.score).toBe(115);
    expect(result.maxScore).toBe(115);
    expect(result.percentage).toBe(100);
    expect(result.rating).toBe('compliant');
    expect(result.gaps).toHaveLength(0);
    expect(result.passed.length).toBe(15);
  });

  it('returns low score and "not_compliant" for an empty policy', () => {
    const context = createDefaultContext();
    const policy = makeEmptyPolicy();
    const result = evaluatePolicyCompliance(policy, context);

    expect(result.score).toBeLessThan(80);
    expect(result.rating).toBe('not_compliant');
    expect(result.gaps.length).toBeGreaterThan(0);
  });

  it('flags missing DPO as "recommended" severity', () => {
    const context = makeFullContext();
    context.org.dpoName = '';
    context.org.dpoEmail = '';
    const policy = makeFullPolicy(context);
    // The policy still has sections, just no DPO fields
    policy.organizationInfo.dpoName = '';
    policy.organizationInfo.dpoEmail = '';

    const result = evaluatePolicyCompliance(policy, context);

    const dpoGap = result.gaps.find((g) => g.requirementId === 'dpo-contact-info');
    expect(dpoGap).toBeDefined();
    expect(dpoGap!.severity).toBe('recommended');
  });

  it('flags missing children section as a gap when context has children data', () => {
    const context = makeFullContext({ hasChildrenData: true });
    // Build sections WITHOUT children (simulate someone removing it)
    const contextWithoutChildren = makeFullContext({ hasChildrenData: false });
    const policy = makeFullPolicy(contextWithoutChildren);
    // But context says children data IS processed
    const result = evaluatePolicyCompliance(policy, context);

    const childrenGap = result.gaps.find(
      (g) => g.requirementId === 'children-data-protection',
    );
    expect(childrenGap).toBeDefined();
    expect(childrenGap!.severity).toBe('recommended');
  });

  it('does not flag children section when context has no children data', () => {
    const context = makeFullContext({ hasChildrenData: false });
    const policy = makeFullPolicy(context);
    const result = evaluatePolicyCompliance(policy, context);

    const childrenGap = result.gaps.find(
      (g) => g.requirementId === 'children-data-protection',
    );
    expect(childrenGap).toBeUndefined();
  });

  it('each gap has fixType, fixLabel, and suggestedContent', () => {
    const context = createDefaultContext();
    const policy = makeEmptyPolicy();
    const result = evaluatePolicyCompliance(policy, context);

    for (const gap of result.gaps) {
      expect(gap.fixType).toBeDefined();
      expect(['add_section', 'add_content', 'fill_field']).toContain(gap.fixType);
      expect(gap.fixLabel).toBeDefined();
      expect(gap.fixLabel.length).toBeGreaterThan(0);
      expect(gap.suggestedContent).toBeDefined();
      expect(gap.suggestedContent!.length).toBeGreaterThan(0);
    }
  });

  it('flags missing cross-border section when hasCrossBorderTransfer is true', () => {
    const context = makeFullContext({ hasCrossBorderTransfer: true });
    // Build policy without cross-border section
    const contextNoCross = makeFullContext({ hasCrossBorderTransfer: false });
    const policy = makeFullPolicy(contextNoCross);

    const result = evaluatePolicyCompliance(policy, context);

    const crossGap = result.gaps.find(
      (g) => g.requirementId === 'cross-border-safeguards',
    );
    expect(crossGap).toBeDefined();
    expect(crossGap!.severity).toBe('important');
  });

  it('flags missing automated decision section when hasAutomatedDecisions is true', () => {
    const context = makeFullContext({ hasAutomatedDecisions: true });
    const contextNoAuto = makeFullContext({ hasAutomatedDecisions: false });
    const policy = makeFullPolicy(contextNoAuto);

    const result = evaluatePolicyCompliance(policy, context);

    const autoGap = result.gaps.find(
      (g) => g.requirementId === 'automated-decision-disclosure',
    );
    expect(autoGap).toBeDefined();
    expect(autoGap!.severity).toBe('important');
  });

  it('passes cross-border and automated checks when those flags are false', () => {
    const context = makeFullContext({
      hasCrossBorderTransfer: false,
      hasAutomatedDecisions: false,
    });
    const policy = makeFullPolicy(context);
    const result = evaluatePolicyCompliance(policy, context);

    expect(result.passed).toContain('cross-border-safeguards');
    expect(result.passed).toContain('automated-decision-disclosure');
  });

  it('flags missing effective date', () => {
    const context = makeFullContext();
    const policy = makeFullPolicy(context);
    policy.effectiveDate = 0;

    const result = evaluatePolicyCompliance(policy, context);

    const dateGap = result.gaps.find(
      (g) => g.requirementId === 'policy-effective-date',
    );
    expect(dateGap).toBeDefined();
    expect(dateGap!.severity).toBe('recommended');
  });

  it('returns "nearly_compliant" when score is between 80 and 99', () => {
    const context = makeFullContext();
    const policy = makeFullPolicy(context);
    // Remove DPO and effective date to lose 10 points (from 115 to 105)
    policy.organizationInfo.dpoName = '';
    policy.organizationInfo.dpoEmail = '';
    policy.effectiveDate = 0;

    const result = evaluatePolicyCompliance(policy, context);

    // Lost 5 (DPO) + 5 (date) = 10 points → score = 105
    expect(result.score).toBe(105);
    expect(result.rating).toBe('compliant'); // 105 >= 100

    // Now also remove security to go to 100
    policy.sections = policy.sections.filter((s) => s.id !== 'data-security');
    const result2 = evaluatePolicyCompliance(policy, context);
    expect(result2.score).toBe(100);
    expect(result2.rating).toBe('compliant');

    // Remove one more to drop below 100
    policy.sections = policy.sections.filter((s) => s.id !== 'data-retention');
    const result3 = evaluatePolicyCompliance(policy, context);
    expect(result3.score).toBe(90);
    expect(result3.rating).toBe('nearly_compliant');
  });
});
