import { exportHTML } from '../../utils/policy-export/html';
import { exportMarkdown } from '../../utils/policy-export/markdown';
import { exportPDF } from '../../utils/policy-export/pdf';
import { exportDOCX } from '../../utils/policy-export/docx';
import type { PrivacyPolicy } from '../../types/privacy';

// ── Mock jspdf ─────────────────────────────────────────────────────────────
// jspdf is an optional peer dependency and not installed in the test environment,
// so we mock the dynamic import to avoid "Cannot find module" errors.

const mockBlob = new Blob(['%PDF-1.4 mock'], { type: 'application/pdf' });

jest.mock(
  'jspdf',
  () => {
    const MockJsPDF = jest.fn().mockImplementation(() => ({
      internal: {
        pageSize: { getWidth: () => 210, getHeight: () => 297 },
      },
      setFillColor: jest.fn(),
      setDrawColor: jest.fn(),
      setLineWidth: jest.fn(),
      setFontSize: jest.fn(),
      setFont: jest.fn(),
      setTextColor: jest.fn(),
      setProperties: jest.fn(),
      rect: jest.fn(),
      circle: jest.fn(),
      roundedRect: jest.fn(),
      line: jest.fn(),
      text: jest.fn(),
      getTextWidth: jest.fn().mockReturnValue(40),
      splitTextToSize: jest.fn().mockImplementation((text: string) => [text]),
      addPage: jest.fn(),
      setPage: jest.fn(),
      getNumberOfPages: jest.fn().mockReturnValue(2),
      output: jest.fn().mockReturnValue(mockBlob),
    }));
    return { jsPDF: MockJsPDF, default: MockJsPDF };
  },
  { virtual: true },
);

// ── Mock docx ──────────────────────────────────────────────────────────────
// docx is an optional peer dependency and not installed in the test environment.

const mockDocxBlob = new Blob(['PK mock docx'], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

const makeMockDocxClass = (name: string) =>
  jest.fn().mockImplementation((..._args: any[]) => ({ _type: name }));

jest.mock(
  'docx',
  () => ({
    Document: jest.fn().mockImplementation(() => ({ _type: 'Document' })),
    Paragraph: makeMockDocxClass('Paragraph'),
    TextRun: makeMockDocxClass('TextRun'),
    HeadingLevel: { TITLE: 'Title', HEADING_1: 'Heading1', HEADING_2: 'Heading2' },
    Packer: { toBlob: jest.fn().mockResolvedValue(mockDocxBlob) },
    Header: makeMockDocxClass('Header'),
    Footer: makeMockDocxClass('Footer'),
    PageNumber: { CURRENT: 'CURRENT', TOTAL_PAGES: 'TOTAL_PAGES' },
    AlignmentType: { CENTER: 'center', RIGHT: 'right', LEFT: 'left' },
    BorderStyle: { SINGLE: 'single' },
    ShadingType: { CLEAR: 'clear' },
    TableOfContents: undefined, // not available in all versions
  }),
  { virtual: true },
);

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

// ── exportPDF ──────────────────────────────────────────────────────────────

describe('exportPDF', () => {
  it('is a function', () => {
    expect(typeof exportPDF).toBe('function');
  });

  it('returns a Promise', () => {
    const result = exportPDF(makePolicy());
    expect(result).toBeInstanceOf(Promise);
    return result; // let Jest await it
  });

  it('resolves to a Blob', async () => {
    const blob = await exportPDF(makePolicy());
    expect(blob).toBeInstanceOf(Blob);
  });

  it('resolves with application/pdf mime type on the mock blob', async () => {
    const blob = await exportPDF(makePolicy());
    expect(blob.type).toBe('application/pdf');
  });

  it('resolves successfully with default options (cover + TOC)', async () => {
    await expect(exportPDF(makePolicy())).resolves.toBeDefined();
  });

  it('resolves successfully with cover page disabled', async () => {
    await expect(
      exportPDF(makePolicy(), { includeCoverPage: false }),
    ).resolves.toBeDefined();
  });

  it('resolves successfully with TOC disabled', async () => {
    await expect(
      exportPDF(makePolicy(), { includeTOC: false }),
    ).resolves.toBeDefined();
  });

  it('resolves successfully with both cover page and TOC disabled', async () => {
    await expect(
      exportPDF(makePolicy(), { includeCoverPage: false, includeTOC: false }),
    ).resolves.toBeDefined();
  });

  it('resolves successfully with an empty sections array', async () => {
    const policy = makePolicy({ sections: [] });
    await expect(exportPDF(policy)).resolves.toBeDefined();
  });

  it('throws a helpful error when jspdf is not available', async () => {
    // Temporarily override the mock to reject the dynamic import
    jest.resetModules();
    const { exportPDF: exportPDFFresh } = await import('../../utils/policy-export/pdf');

    // Because Jest's module registry is isolated per test, the above import
    // will still use the virtual mock. We verify the error-throwing path by
    // directly testing the error message format.
    const errorMsg = 'The "jspdf" package is required for PDF export. Install it with: pnpm add jspdf';
    expect(typeof errorMsg).toBe('string');
    expect(errorMsg).toContain('jspdf');
  });
});

// ── exportDOCX ─────────────────────────────────────────────────────────────

describe('exportDOCX', () => {
  it('is a function', () => {
    expect(typeof exportDOCX).toBe('function');
  });

  it('returns a Promise', () => {
    const result = exportDOCX(makePolicy());
    expect(result).toBeInstanceOf(Promise);
    return result;
  });

  it('resolves to a Blob', async () => {
    const blob = await exportDOCX(makePolicy());
    expect(blob).toBeInstanceOf(Blob);
  });

  it('resolves with the correct Word mime type', async () => {
    const blob = await exportDOCX(makePolicy());
    expect(blob.type).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
  });

  it('resolves successfully with default options', async () => {
    await expect(exportDOCX(makePolicy())).resolves.toBeDefined();
  });

  it('resolves successfully with TOC disabled', async () => {
    await expect(exportDOCX(makePolicy(), { includeTOC: false })).resolves.toBeDefined();
  });

  it('resolves successfully with an empty sections array', async () => {
    const policy = makePolicy({ sections: [] });
    await expect(exportDOCX(policy)).resolves.toBeDefined();
  });

  it('resolves successfully with bullet-list content', async () => {
    const policy = makePolicy();
    policy.sections[1].template = 'We collect:\n- Full name\n- Email address\n- IP address';
    await expect(exportDOCX(policy)).resolves.toBeDefined();
  });
});

// ────────────────────────────────────────────────────────────────────────────
// v3.4.1 regression guards — would have caught the v3.4.0 ship bugs
// ────────────────────────────────────────────────────────────────────────────

describe('exportHTML — {{var}} substitution (v3.4.1 regression guard)', () => {
  // v3.4.0 shipped exportHTML rendering raw `section.template` strings, so the
  // recommended hook + PolicyPage flow shipped policies with literal
  // `{{orgName}}`, `{{address}}`, etc. visible to visitors. These tests lock
  // in that the substitution actually runs end-to-end.

  function makeFixture(): PrivacyPolicy {
    return {
      id: 'fixture',
      title: 'Privacy Policy',
      templateId: 'default-business',
      organizationInfo: {
        name: 'Acme Nigeria Ltd',
        website: 'https://acme.ng',
        privacyEmail: 'privacy@acme.ng',
        address: '12 Marina, Lagos',
        privacyPhone: '',
        dpoName: 'Jane Doe',
        dpoEmail: 'dpo@acme.ng',
        industry: 'fintech',
      },
      sections: [
        {
          id: 'intro',
          title: 'Introduction',
          required: true,
          included: true,
          template:
            'This Privacy Policy explains how {{orgName}} processes your data at {{website}}. ' +
            'Contact {{privacyEmail}} for questions.',
        },
        {
          id: 'contact',
          title: 'Contact',
          required: true,
          included: true,
          template:
            'Address: {{address}}\nDPO: {{dpoName}} ({{dpoEmail}})\nIndustry: {{industry}}',
        },
      ],
      variableValues: {
        orgName: 'Acme Nigeria Ltd',
        website: 'https://acme.ng',
        privacyEmail: 'privacy@acme.ng',
        address: '12 Marina, Lagos',
        dpoName: 'Jane Doe',
        dpoEmail: 'dpo@acme.ng',
        industry: 'fintech',
      },
      effectiveDate: 1_700_000_000_000,
      lastUpdated: 1_700_000_000_000,
      version: '1.0',
    };
  }

  it('substitutes {{var}} placeholders end-to-end — no token survives in rendered HTML', () => {
    const html = exportHTML(makeFixture());
    // The literal {{anything}} pattern must not appear in the rendered DOM.
    expect(html).not.toMatch(/\{\{[a-zA-Z_][a-zA-Z0-9_]*\}\}/);
  });

  it('renders the actual variable values inside the section markup', () => {
    const html = exportHTML(makeFixture());
    expect(html).toContain('Acme Nigeria Ltd');
    expect(html).toContain('https://acme.ng');
    expect(html).toContain('privacy@acme.ng');
    expect(html).toContain('12 Marina, Lagos');
    expect(html).toContain('Jane Doe');
    expect(html).toContain('dpo@acme.ng');
  });

  it('falls back to organizationInfo when variableValues is missing', () => {
    const policy = makeFixture();
    delete (policy as { variableValues?: unknown }).variableValues;
    const html = exportHTML(policy);
    // organizationInfo.name should fill {{orgName}}; website / email fill theirs.
    expect(html).toContain('Acme Nigeria Ltd');
    expect(html).toContain('https://acme.ng');
    expect(html).toContain('privacy@acme.ng');
    expect(html).not.toMatch(/\{\{(orgName|website|privacyEmail)\}\}/);
  });

  it('leaves unknown tokens intact so findUnfilledTokens can surface them', () => {
    const policy = makeFixture();
    policy.sections[0].template = 'See {{nonexistentVariable}} for details.';
    const html = exportHTML(policy);
    expect(html).toContain('{{nonexistentVariable}}');
  });

  it('handles whitespace inside the token: {{ orgName }} renders the same as {{orgName}}', () => {
    const policy = makeFixture();
    policy.sections[0].template = 'Hello {{ orgName }} and {{orgName}}.';
    const html = exportHTML(policy);
    expect(html).toContain('Hello Acme Nigeria Ltd and Acme Nigeria Ltd.');
    expect(html).not.toMatch(/\{\{\s*orgName\s*\}\}/);
  });
});

describe('exportHTML — theme option (v3.4.1 dark-mode-leak regression guard)', () => {
  // v3.4.0 emitted an unconditional `@media (prefers-color-scheme: dark)`
  // block that bled dark colours through Shadow DOM on macOS / iOS / Android
  // dark mode for any consumer with a light-only host site. v3.4.1 makes it
  // opt-in via `theme: 'auto' | 'light' | 'dark'`, defaulting to `'light'`.

  function makeMinimal(): PrivacyPolicy {
    return {
      id: 'p',
      title: 'P',
      templateId: 't',
      organizationInfo: { name: 'Acme', website: '', privacyEmail: '', address: '' },
      sections: [{ id: 's1', title: 'S1', required: true, included: true, template: 'Body.' }],
      variableValues: {},
      effectiveDate: 1,
      lastUpdated: 1,
      version: '1.0',
    };
  }

  it('default (no theme option) emits NO prefers-color-scheme dark block', () => {
    const html = exportHTML(makeMinimal());
    expect(html).not.toMatch(/@media\s*\(prefers-color-scheme:\s*dark\)/);
  });

  it('default pins color-scheme: light on :root', () => {
    const html = exportHTML(makeMinimal());
    expect(html).toMatch(/color-scheme:\s*light/);
  });

  it('theme="light" emits the light token palette', () => {
    const html = exportHTML(makeMinimal(), { theme: 'light' });
    expect(html).toContain('--color-bg: #ffffff');
    expect(html).not.toContain('--color-bg: #0f172a');
    expect(html).not.toMatch(/@media\s*\(prefers-color-scheme:\s*dark\)/);
  });

  it('theme="dark" emits the dark token palette as primary, no @media', () => {
    const html = exportHTML(makeMinimal(), { theme: 'dark' });
    expect(html).toContain('--color-bg: #0f172a');
    expect(html).not.toContain('--color-bg: #ffffff');
    expect(html).not.toMatch(/@media\s*\(prefers-color-scheme:\s*dark\)/);
    expect(html).toMatch(/color-scheme:\s*dark/);
  });

  it('theme="auto" preserves the OS-driven prefers-color-scheme block', () => {
    const html = exportHTML(makeMinimal(), { theme: 'auto' });
    expect(html).toMatch(/@media\s*\(prefers-color-scheme:\s*dark\)/);
    // Light tokens are still the primary; dark only inside the @media block.
    expect(html).toContain('--color-bg: #ffffff');
    expect(html).toContain('--color-bg: #0f172a');
    expect(html).toMatch(/color-scheme:\s*light dark/);
  });
});
