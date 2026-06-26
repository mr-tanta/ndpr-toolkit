import { legalCitationBlocks, requiredCitationModuleIds } from '@/lib/legal-citations';

describe('legal citation catalog', () => {
  it('covers every trust-roadmap module with citations and boundaries', () => {
    expect(requiredCitationModuleIds).toEqual([
      'consent',
      'dsr',
      'dpia',
      'breach',
      'policy',
      'lawful-basis',
      'cross-border',
      'ropa',
      'audit-cli',
      'dcpmi-car',
    ]);

    for (const moduleId of requiredCitationModuleIds) {
      const block = legalCitationBlocks[moduleId];

      expect(block).toBeDefined();
      expect(block.references.length).toBeGreaterThanOrEqual(1);
      expect(block.automates.length).toBeGreaterThanOrEqual(1);
      expect(block.doesNotReplace.length).toBeGreaterThanOrEqual(1);
      expect(block.references.every((reference) => reference.href.startsWith('https://ndpc.gov.ng/'))).toBe(true);
    }
  });
});
