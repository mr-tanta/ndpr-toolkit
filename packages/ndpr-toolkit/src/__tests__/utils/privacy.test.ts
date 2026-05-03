import { generatePolicyText, findUnfilledTokens } from '../../utils/privacy';
import { assemblePolicy } from '../../utils/policy-sections';
import { createDefaultContext } from '../../types/policy-engine';
import { PolicySection } from '../../types/privacy';

describe('generatePolicyText (NDPA-compliant Privacy Policy)', () => {
  it('should replace variables in NDPA-compliant policy templates', () => {
    const sections: PolicySection[] = [
      {
        id: 'introduction',
        title: 'Introduction',
        template: 'This Privacy Policy explains how {{organizationName}} collects and uses your data.',
        required: true,
        included: true
      },
      {
        id: 'contact',
        title: 'Contact Information',
        template: 'For questions about this policy, please contact us at {{contactEmail}}.',
        required: true,
        included: true
      }
    ];
    
    const variables = {
      organizationName: 'Acme Corporation',
      contactEmail: 'privacy@acme.com'
    };
    
    const result = generatePolicyText(sections, variables) as {
      fullText: string;
      sectionTexts: Record<string, string>;
      missingVariables: string[];
    };
    
    expect(result.fullText).toContain('This Privacy Policy explains how Acme Corporation collects and uses your data.');
    expect(result.fullText).toContain('For questions about this policy, please contact us at privacy@acme.com.');
    // Check the number of sections by counting keys in sectionTexts
    expect(Object.keys(result.sectionTexts).length).toBe(2);
    // Check the content of the first section
    expect(Object.values(result.sectionTexts)[0]).toBe('This Privacy Policy explains how Acme Corporation collects and uses your data.');
  });
  
  it('should skip sections that are not included', () => {
    const sections: PolicySection[] = [
      {
        id: 'introduction',
        title: 'Introduction',
        template: 'This is the introduction.',
        required: true,
        included: true
      },
      {
        id: 'optional',
        title: 'Optional Section',
        template: 'This is optional.',
        required: false,
        included: false
      }
    ];
    
    const result = generatePolicyText(sections, {}) as {
      fullText: string;
      sectionTexts: Record<string, string>;
      missingVariables: string[];
    };
    
    expect(result.fullText).toContain('This is the introduction.');
    expect(result.fullText).not.toContain('This is optional.');
    expect(Object.keys(result.sectionTexts).length).toBe(1);
  });
  
  it('should handle missing variables gracefully', () => {
    const sections: PolicySection[] = [
      {
        id: 'test',
        title: 'Test',
        template: 'Hello {{name}}, welcome to {{company}}.',
        required: true,
        included: true
      }
    ];
    
    const variables = {
      name: 'John'
      // company is missing
    };
    
    const result = generatePolicyText(sections, variables) as {
      fullText: string;
      sectionTexts: Record<string, string>;
      missingVariables: string[];
    };
    
    expect(result.fullText).toContain('Hello John, welcome to .');
    // Verify that 'company' is in the missing variables list
    expect(result.missingVariables).toContain('company');
  });
});

describe('generatePolicyText RegExp injection safety', () => {
  it('should replace variable names containing a dot (.)', () => {
    const result = generatePolicyText(
      'Hello {{user.name}}, welcome!',
      { 'user.name': 'Alice' }
    );
    expect(result).toBe('Hello Alice, welcome!');
  });

  it('should replace variable names containing an asterisk (*)', () => {
    const result = generatePolicyText(
      'Total: {{price*tax}}',
      { 'price*tax': '100' }
    );
    expect(result).toBe('Total: 100');
  });

  it('should replace variable names containing parentheses', () => {
    const result = generatePolicyText(
      'Output: {{fn(x)}}',
      { 'fn(x)': 'result' }
    );
    expect(result).toBe('Output: result');
  });

  it('should replace variable names containing square brackets', () => {
    const result = generatePolicyText(
      'Item: {{arr[0]}}',
      { 'arr[0]': 'first' }
    );
    expect(result).toBe('Item: first');
  });

  it('should replace variable names containing a plus (+)', () => {
    const result = generatePolicyText(
      'Sum: {{a+b}}',
      { 'a+b': '42' }
    );
    expect(result).toBe('Sum: 42');
  });

  it('should still replace normal variable names correctly', () => {
    const result = generatePolicyText(
      'Welcome to {{orgName}}!',
      { 'orgName': 'Test Corp' }
    );
    expect(result).toBe('Welcome to Test Corp!');
  });

  it('should not throw SyntaxError for any regex special characters in variable names', () => {
    const specialNames: Record<string, string> = {
      'user.name': 'Alice',
      'price*tax': '100',
      'fn(x)': 'result',
      'arr[0]': 'first',
      'a+b': '42',
      'x?y': 'maybe',
      'a^b': 'power',
      'a$b': 'dollar',
      'a{2}': 'braces',
      'a|b': 'pipe',
      'a\\b': 'backslash',
    };

    for (const [name, value] of Object.entries(specialNames)) {
      expect(() => {
        generatePolicyText(`{{${name}}}`, { [name]: value });
      }).not.toThrow();
    }
  });
});

describe('findUnfilledTokens', () => {
  it('detects «TODO: field» markers from policy-sections', () => {
    const text = 'Contact us at «TODO: privacyEmail» for more.';
    expect(findUnfilledTokens(text)).toEqual(['privacyEmail']);
  });

  it('detects unsubstituted {{mustache}} tokens', () => {
    const text = 'Hello {{orgName}}, your address is {{address}}.';
    expect(findUnfilledTokens(text).sort()).toEqual(['address', 'orgName']);
  });

  it('deduplicates repeated tokens', () => {
    const text = '{{orgName}} and «TODO: orgName» again';
    expect(findUnfilledTokens(text)).toEqual(['orgName']);
  });

  it('returns [] for fully-rendered text', () => {
    expect(findUnfilledTokens('All variables resolved cleanly.')).toEqual([]);
  });
});

describe('assemblePolicy: canonical fixture renders without unfilled tokens', () => {
  // CI guard: a fully-populated org info should never produce {{...}} or
  // «TODO: ...» markers in the rendered output. This is the test that would
  // have caught the FINLAB v3.3.1 issue where DEFAULT placeholders shipped
  // to production privacy pages.
  it('renders cleanly when all required org info is provided', () => {
    const ctx = createDefaultContext();
    ctx.org.name = 'Acme Nigeria Ltd';
    ctx.org.website = 'https://acme.ng';
    ctx.org.privacyEmail = 'privacy@acme.ng';
    ctx.org.address = '12 Marina, Lagos';
    ctx.org.dpoName = 'Jane Doe';
    ctx.org.dpoEmail = 'dpo@acme.ng';

    const sections = assemblePolicy(ctx);
    const rendered = sections.map((s) => s.template).join('\n\n');

    const unfilled = findUnfilledTokens(rendered);
    expect(unfilled).toEqual([]);
  });

  it('reports missing required fields when org info is empty', () => {
    const ctx = createDefaultContext();
    // Only fill DPO so the unfilled set is bounded.
    ctx.org.dpoName = 'Jane Doe';
    ctx.org.dpoEmail = 'dpo@acme.ng';
    ctx.org.address = '12 Marina, Lagos';
    ctx.org.website = 'https://acme.ng';

    const sections = assemblePolicy(ctx);
    const rendered = sections.map((s) => s.template).join('\n\n');

    const unfilled = findUnfilledTokens(rendered);
    expect(unfilled.sort()).toEqual(['orgName', 'privacyEmail']);
  });
});
