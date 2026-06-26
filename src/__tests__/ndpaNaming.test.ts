import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

const read = (file: string) => readFileSync(join(root, file), 'utf8');

describe('NDPA and NDPR naming boundaries', () => {
  it('leads public positioning with NDPA 2023 while explaining the legacy package name', () => {
    const readme = read('README.md');
    const guide = read('src/app/docs/guides/ndpr-vs-ndpa-naming/page.tsx');

    expect(readme).toContain('current legal positioning is **NDPA Toolkit** / **NDPA 2023 compliance**');
    expect(readme).toContain('/docs/guides/ndpr-vs-ndpa-naming');

    expect(guide).toContain('NDPR vs NDPA Naming');
    expect(guide).toContain('Say <strong>NDPA Toolkit</strong>');
    expect(guide).toContain('The package name remains');
    expect(guide).toContain('NDPR 2019 was the earlier Nigerian data-protection regulation');
    expect(guide).toContain('Metadata may include both NDPA and NDPR keywords');
  });

  it('keeps package names stable while package descriptions point at current NDPA compliance', () => {
    const rootPackage = JSON.parse(read('package.json')) as { name: string; description: string; keywords: string[] };
    const createPackage = JSON.parse(read('packages/create-ndpr/package.json')) as { name: string; description: string; keywords: string[] };
    const recipesPackage = JSON.parse(read('packages/ndpr-recipes/package.json')) as { name: string; description: string; keywords: string[] };

    expect(rootPackage.name).toBe('@tantainnovative/ndpr-toolkit');
    expect(createPackage.name).toBe('@tantainnovative/create-ndpr');
    expect(recipesPackage.name).toBe('@tantainnovative/ndpr-recipes');

    for (const pkg of [rootPackage, createPackage, recipesPackage]) {
      expect(pkg.description).toMatch(/NDPA 2023|Nigeria Data Protection Act \(NDPA\) 2023/);
      expect(pkg.keywords).toEqual(expect.arrayContaining(['ndpa', 'ndpr']));
    }
  });

  it('publishes the naming guide through docs navigation and sitemap', () => {
    const docsHome = read('src/app/docs/page.tsx');
    const guidesIndex = read('src/app/docs/guides/page.tsx');
    const nav = read('src/components/docs/DocLayout.tsx');
    const sitemap = read('src/app/sitemap.ts');

    for (const file of [docsHome, guidesIndex, nav, sitemap]) {
      expect(file).toContain('/docs/guides/ndpr-vs-ndpa-naming');
    }
  });

  it('uses NDPA Toolkit in site metadata, component metadata, and implementation copy', () => {
    const rootLayout = read('src/app/layout.tsx');
    const docsMetadata = read('src/app/docs/metadata.ts');
    const componentsLayout = read('src/app/docs/components/layout.tsx');
    const implementationTools = read('src/app/docs/guides/ndpr-compliance-checklist/components/ImplementationTools.tsx');

    expect(rootLayout).toContain('default: "NDPA Toolkit');
    expect(rootLayout).toContain('siteName: "NDPA Toolkit"');
    expect(rootLayout).toContain('name: "NDPA Toolkit"');
    expect(rootLayout).toContain('"NDPR Toolkit"');
    expect(docsMetadata).toContain('Documentation for the NDPA Toolkit');
    expect(docsMetadata).toContain("siteName: 'NDPA Toolkit'");
    expect(componentsLayout).toContain('API reference for every NDPA Toolkit React component');
    expect(componentsLayout).toContain("siteName: 'NDPA Toolkit'");
    expect(componentsLayout).not.toContain('Every NDPR Toolkit component');
    expect(implementationTools).toContain('Implementation Tools in the NDPA Toolkit');
    expect(implementationTools).toContain('The NDPA Toolkit provides');
  });
});
