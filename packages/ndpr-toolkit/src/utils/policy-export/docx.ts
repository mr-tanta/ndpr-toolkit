import type { PrivacyPolicy } from '../../types/privacy';
import type { DOCXExportOptions } from '../../types/policy-engine';

/**
 * Export a PrivacyPolicy as a Word (.docx) Blob using the `docx` library
 * (optional peer dependency).
 *
 * Features:
 * - Title paragraph with large bold text
 * - Organisation name + version subtitle
 * - Optional table of contents placeholder heading
 * - All included policy sections as Heading 1 + body paragraphs / bullet lists
 * - Running header (org name) and page-number footer on every page
 *
 * @throws {Error} if the `docx` package is not installed
 */
export async function exportDOCX(
  policy: PrivacyPolicy,
  options?: DOCXExportOptions,
): Promise<Blob> {
  let docxLib: any;
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore — optional peer dependency; may not be installed
    docxLib = await import('docx');
  } catch {
    throw new Error(
      '[ndpr-toolkit] Word export requires the "docx" package. Install it with:\n' +
      '  pnpm add docx\n' +
      'See: https://ndprtoolkit.com.ng/docs/guides/styling-customization',
    );
  }

  const {
    Document,
    Paragraph,
    TextRun,
    HeadingLevel,
    Packer,
    Header,
    Footer,
    PageNumber,
    AlignmentType,
    BorderStyle,
    ShadingType,
    TableOfContents,
  } = docxLib;

  const orgName = policy.organizationInfo.name || '';
  const policyTitle = policy.title || 'Privacy Policy';
  const version = policy.version || '1.0';

  const effectiveDateStr = policy.effectiveDate
    ? new Date(policy.effectiveDate).toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

  const includedSections = policy.sections.filter((s) => s.included);

  // ── Document body ─────────────────────────────────────────────────────────
  const children: any[] = [];

  // Title
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: policyTitle,
          bold: true,
          size: 52, // 26pt
          color: '064e3b',
        }),
      ],
      heading: HeadingLevel.TITLE,
      spacing: { after: 160 },
      alignment: AlignmentType.CENTER,
    }),
  );

  // Organisation + version + date subtitle
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `${orgName}${orgName ? '  •  ' : ''}Version ${version}  •  Effective ${effectiveDateStr}`,
          size: 20,
          color: '6b7280',
          italics: true,
        }),
      ],
      spacing: { after: 120 },
      alignment: AlignmentType.CENTER,
    }),
  );

  // NDPA compliance note
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Compliant with the Nigeria Data Protection Act (NDPA) 2023',
          size: 18,
          color: '16a34a',
          bold: true,
        }),
      ],
      spacing: { after: 400 },
      alignment: AlignmentType.CENTER,
    }),
  );

  // Horizontal rule spacer
  children.push(
    new Paragraph({
      children: [],
      spacing: { after: 200 },
      border: {
        bottom: {
          color: '16a34a',
          style: BorderStyle.SINGLE,
          size: 6,
          space: 1,
        },
      },
    }),
  );

  // ── Table of Contents ────────────────────────────────────────────────────
  if (options?.includeTOC !== false) {
    // Heading for TOC
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'Table of Contents', bold: true, size: 28, color: '064e3b' })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
    );

    // If the docx library exposes TableOfContents, use it; otherwise fall back to a list
    if (typeof TableOfContents === 'function') {
      try {
        children.push(
          new TableOfContents('Table of Contents', {
            hyperlink: true,
            headingStyleRange: '1-1',
          }),
        );
      } catch {
        // fall back to manual list
        includedSections.forEach((section, i) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${i + 1}.  ${section.title}`,
                  size: 22,
                  color: '15803d',
                }),
              ],
              spacing: { after: 80 },
            }),
          );
        });
      }
    } else {
      includedSections.forEach((section, i) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${i + 1}.  ${section.title}`,
                size: 22,
                color: '15803d',
              }),
            ],
            spacing: { after: 80 },
          }),
        );
      });
    }

    // Page break after TOC
    children.push(
      new Paragraph({ children: [], pageBreakBefore: true }),
    );
  }

  // ── Sections ─────────────────────────────────────────────────────────────
  includedSections.forEach((section, i) => {
    // Section heading
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${i + 1}.  ${section.title}`,
            bold: true,
            size: 28,
            color: '064e3b',
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        border: {
          bottom: {
            color: 'dcfce7',
            style: BorderStyle.SINGLE,
            size: 4,
            space: 1,
          },
        },
      }),
    );

    const content = (section.template || section.defaultContent || '').trim();
    if (content) {
      const rawLines = content.split('\n');

      rawLines.forEach((rawLine) => {
        const line = rawLine.trimEnd();
        if (line === '') {
          children.push(new Paragraph({ children: [], spacing: { after: 60 } }));
          return;
        }

        const isBullet = line.startsWith('- ') || line.startsWith('• ');
        const text = isBullet ? line.replace(/^[-•]\s*/, '') : line;

        if (isBullet) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text, size: 22 })],
              spacing: { after: 80 },
              bullet: { level: 0 },
            }),
          );
        } else {
          children.push(
            new Paragraph({
              children: [new TextRun({ text, size: 22 })],
              spacing: { after: 100 },
            }),
          );
        }
      });
    }
  });

  // ── Footer / metadata paragraph ───────────────────────────────────────────
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Generated by NDPA Toolkit — ${orgName}${orgName ? ' — ' : ''}Privacy Policy v${version}`,
          size: 16,
          color: '9ca3af',
          italics: true,
        }),
      ],
      spacing: { before: 600 },
      alignment: AlignmentType.CENTER,
    }),
  );

  // ── Document ──────────────────────────────────────────────────────────────
  const doc = new Document({
    title: policyTitle,
    description: 'Privacy Policy — NDPA 2023 Compliant',
    styles: {
      paragraphStyles: [
        {
          id: 'Normal',
          name: 'Normal',
          run: { font: 'Calibri', size: 22 },
        },
      ],
    },
    sections: [
      {
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: orgName || 'Privacy Policy',
                    size: 16,
                    color: '9ca3af',
                  }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Page ', size: 16, color: '9ca3af' }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                    color: '9ca3af',
                  }),
                  new TextRun({ text: ' of ', size: 16, color: '9ca3af' }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 16,
                    color: '9ca3af',
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  return Packer.toBlob(doc) as Promise<Blob>;
}
