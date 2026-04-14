import { exportHTML } from '../../utils/policy-export/html';
import { exportMarkdown } from '../../utils/policy-export/markdown';
import type { PrivacyPolicy } from '../../types/privacy';

/** Factory — returns a minimal but realistic PrivacyPolicy for tests. */
function makePolicy(overrides?: Partial<PrivacyPolicy>): PrivacyPolicy {
  return {
    id: 'test-policy-1',
    title: 'Test Privacy Policy',
    templateId: 'default',
    organizationInfo: {
      name: 'Acme Nigeria Ltd',
      website: 'https://acme.example.com',
      privacyEmail: 'privacy@acme.example.com',
      address: '10 Broad Street, Lagos',
    },
    sections: [
      {
        id: 'intro',
        title: 'Introduction',
        required: true,
        template: 'We are committed to protecting your data under the NDPA 2023.',
        included: true,
        order: 1,
      },
      {
        id: 'data-collection',
        title: 'Data Collection',
        required: true,
        template: 'We collect:\n- Full name\n- Email address\n- IP address',
        included: true,
        order: 2,
      },
      {
        id: 'your-rights',
        title: 'Your Rights',
        required: true,
        template: 'You have the right to access, rectify, and erase your data.',
        included: true,
        order: 3,
      },
      {
        id: 'excluded-section',
        title: 'This Should Not Appear',
        required: false,
        template: 'Hidden content.',
        included: false,
        order: 4,
      },
    ],
    variableValues: {},
    effectiveDate: new Date('2024-01-15').getTime(),
    lastUpdated: new Date('2024-06-01').getTime(),
    version: '2.0',
    ...overrides,
  };
}

// ── exportHTML ─────────────────────────────────────────────────────────────

describe('exportHTML', () => {
  it('returns a string', () => {
    const result = exportHTML(makePolicy());
    expect(typeof result).toBe('string');
  });

  it('produces a valid HTML document shell', () => {
    const result = exportHTML(makePolicy());
    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('<html');
    expect(result).toContain('</html>');
    expect(result).toContain('<head>');
    expect(result).toContain('<body>');
  });

  it('includes an embedded <style> block by default', () => {
    const result = exportHTML(makePolicy());
    expect(result).toContain('<style>');
    expect(result).toContain('</style>');
  });

  it('omits the default style block when includeStyles is false', () => {
    const result = exportHTML(makePolicy(), { includeStyles: false });
    // No style block at all when no customCSS is provided
    expect(result).not.toContain('<style>');
  });

  it('injects custom CSS when provided', () => {
    const result = exportHTML(makePolicy(), { customCSS: 'body { color: red; }' });
    expect(result).toContain('body { color: red; }');
  });

  it('wraps content in an <article> element', () => {
    const result = exportHTML(makePolicy());
    expect(result).toContain('<article');
    expect(result).toContain('</article>');
  });

  it('includes section titles as <h2> headings', () => {
    const result = exportHTML(makePolicy());
    expect(result).toContain('Introduction');
    expect(result).toContain('Data Collection');
    expect(result).toContain('Your Rights');
  });

  it('does not render excluded sections', () => {
    const result = exportHTML(makePolicy());
    expect(result).not.toContain('This Should Not Appear');
    expect(result).not.toContain('Hidden content.');
  });

  it('includes a <nav> table of contents', () => {
    const result = exportHTML(makePolicy());
    expect(result).toContain('<nav');
    expect(result).toContain('Table of Contents');
  });

  it('TOC contains anchor links to each included section', () => {
    const result = exportHTML(makePolicy());
    // Slug of "Introduction" → "introduction"
    expect(result).toContain('href="#introduction"');
    // Slug of "Data Collection" → "data-collection"
    expect(result).toContain('href="#data-collection"');
    // Slug of "Your Rights" → "your-rights"
    expect(result).toContain('href="#your-rights"');
  });

  it('section elements carry matching id anchors', () => {
    const result = exportHTML(makePolicy());
    expect(result).toContain('id="introduction"');
    expect(result).toContain('id="data-collection"');
    expect(result).toContain('id="your-rights"');
  });

  it('includes organisation name in the document', () => {
    const result = exportHTML(makePolicy());
    expect(result).toContain('Acme Nigeria Ltd');
  });

  it('includes the effective date', () => {
    const result = exportHTML(makePolicy());
    // The date is formatted — just check the year is present
    expect(result).toContain('2024');
  });

  it('includes the version', () => {
    const result = exportHTML(makePolicy());
    expect(result).toContain('2.0');
  });

  it('includes a footer with generator credit', () => {
    const result = exportHTML(makePolicy());
    expect(result).toContain('NDPA Toolkit');
    expect(result).toContain('<footer');
  });

  it('includes the NDPA compliance badge', () => {
    const result = exportHTML(makePolicy());
    expect(result).toContain('NDPA 2023');
  });

  it('renders list items from sections that contain bullet lines', () => {
    const result = exportHTML(makePolicy());
    expect(result).toContain('<ul>');
    expect(result).toContain('<li>');
    expect(result).toContain('Full name');
  });

  it('escapes HTML special characters in content', () => {
    const policy = makePolicy();
    policy.sections[0].template = 'Safe <script>alert("xss")</script> content & "quotes"';
    const result = exportHTML(policy);
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;');
    expect(result).toContain('&amp;');
    expect(result).toContain('&quot;');
  });

  it('handles a policy with no sections gracefully', () => {
    const policy = makePolicy({ sections: [] });
    const result = exportHTML(policy);
    expect(typeof result).toBe('string');
    expect(result).toContain('<html');
  });
});

// ── exportMarkdown ─────────────────────────────────────────────────────────

describe('exportMarkdown', () => {
  it('returns a string', () => {
    const result = exportMarkdown(makePolicy());
    expect(typeof result).toBe('string');
  });

  it('starts with a # heading containing the policy title', () => {
    const result = exportMarkdown(makePolicy());
    expect(result.trimStart()).toMatch(/^# /);
    expect(result).toContain('# Test Privacy Policy');
  });

  it('includes all included section titles as ## headings', () => {
    const result = exportMarkdown(makePolicy());
    expect(result).toContain('## 1. Introduction');
    expect(result).toContain('## 2. Data Collection');
    expect(result).toContain('## 3. Your Rights');
  });

  it('does not render excluded sections', () => {
    const result = exportMarkdown(makePolicy());
    expect(result).not.toContain('This Should Not Appear');
    expect(result).not.toContain('Hidden content.');
  });

  it('includes a Table of Contents section', () => {
    const result = exportMarkdown(makePolicy());
    expect(result).toContain('## Table of Contents');
  });

  it('TOC contains numbered links to each included section', () => {
    const result = exportMarkdown(makePolicy());
    // Each TOC entry should be a markdown link
    expect(result).toContain('[Introduction]');
    expect(result).toContain('[Data Collection]');
    expect(result).toContain('[Your Rights]');
  });

  it('includes organisation name in the metadata line', () => {
    const result = exportMarkdown(makePolicy());
    expect(result).toContain('Acme Nigeria Ltd');
  });

  it('includes the version in the metadata line', () => {
    const result = exportMarkdown(makePolicy());
    expect(result).toContain('Version: 2.0');
  });

  it('includes the effective date', () => {
    const result = exportMarkdown(makePolicy());
    expect(result).toContain('2024');
  });

  it('includes section content', () => {
    const result = exportMarkdown(makePolicy());
    expect(result).toContain('NDPA 2023');
    expect(result).toContain('Full name');
  });

  it('includes a reference to NDPA compliance', () => {
    const result = exportMarkdown(makePolicy());
    expect(result).toContain('Nigeria Data Protection Act');
  });

  it('handles a policy with no sections gracefully', () => {
    const policy = makePolicy({ sections: [] });
    const result = exportMarkdown(policy);
    expect(typeof result).toBe('string');
    expect(result).toContain('# ');
  });
});
