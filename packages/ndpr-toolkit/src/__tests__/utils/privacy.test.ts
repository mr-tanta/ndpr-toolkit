import { generatePolicyText } from '../../utils/privacy';
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
