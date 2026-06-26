import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

const publicCopyFiles = [
  'README.md',
  'src/app/HomePageClient.tsx',
  'src/app/page.tsx',
  'src/app/docs/guides/dcpmi-registration/page.tsx',
  'src/app/docs/guides/legal-basis-and-citations/page.tsx',
  'src/lib/legal-citations.ts',
  'packages/create-ndpr/README.md',
  'packages/create-ndpr/templates/github-ndpr-audit.yml',
  'packages/ndpr-recipes/README.md',
];

describe('DCPMI public messaging', () => {
  it('frames DCPMI as designation support, not a standalone module or filing workflow', () => {
    for (const file of publicCopyFiles) {
      const text = readFileSync(join(root, file), 'utf8')
        .replace('not a standalone DCPMI module', 'not a standalone DCPMI boundary')
        .replace('This is not a standalone DCPMI boundary, portfolio dashboard, DPCO registration workflow, or NDPC filing system.', 'DCPMI boundary disclaimer.');

      expect(text).not.toMatch(/DCPMI\s+(?:Tier\s+Tracker|module)/i);
      expect(text).not.toMatch(/module\s+(?:for\s+)?DCPMI/i);
      expect(text).not.toMatch(/tier-downgrade/i);
      expect(text).not.toMatch(/DCPMI\s+registration\s+(?:classifier|tier)/i);
      expect(text).not.toMatch(/DCPMI\s+.*registration workflow/i);
    }
  });

  it('states the boundary on the DCPMI guide and README', () => {
    const readme = readFileSync(join(root, 'README.md'), 'utf8');
    const guide = readFileSync(
      join(root, 'src/app/docs/guides/dcpmi-registration/page.tsx'),
      'utf8',
    );

    expect(readme).toContain('DCPMI here is a designation/classification utility');
    expect(guide).toContain('not a standalone DCPMI module');
    expect(guide).toContain('DPCO registration workflow');
  });
});
