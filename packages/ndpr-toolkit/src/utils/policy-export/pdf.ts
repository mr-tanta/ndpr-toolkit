import type { PrivacyPolicy } from '../../types/privacy';
import type { PDFExportOptions } from '../../types/policy-engine';

/**
 * Export a PrivacyPolicy to a PDF Blob using jspdf (optional peer dependency).
 *
 * Features:
 * - Optional cover page with title, organisation, date, version and compliance badge
 * - Optional table of contents page
 * - One section per heading, content reflowed to fit the page
 * - Automatic page breaks
 * - Page header (org name) and footer (page X of Y) on every page
 * - PDF metadata (title, author, subject, keywords)
 *
 * @throws {Error} if the `jspdf` package is not installed
 */
export async function exportPDF(
  policy: PrivacyPolicy,
  options?: PDFExportOptions,
): Promise<Blob> {
  // Dynamic import so jspdf is not bundled unless actually used
  let jsPDF: any;
  try {
    const mod = await import('jspdf');
    jsPDF = mod.jsPDF ?? mod.default;
  } catch {
    throw new Error(
      'The "jspdf" package is required for PDF export. Install it with: pnpm add jspdf',
    );
  }

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth: number = doc.internal.pageSize.getWidth();
  const pageHeight: number = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  const orgName = policy.organizationInfo.name || '';
  const policyTitle = policy.title || 'Privacy Policy';
  const version = policy.version || '1.0';

  const effectiveDateStr = policy.effectiveDate
    ? new Date(policy.effectiveDate).toLocaleDateString()
    : new Date().toLocaleDateString();

  // ── Shared helpers ───────────────────────────────────────────────────────

  /** Draw a subtle header on the current page (skipped on the cover). */
  const addPageHeader = () => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(150, 150, 150);
    doc.text(orgName ? `${orgName} — ${policyTitle}` : policyTitle, margin, 12);
    // thin rule
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, 14, pageWidth - margin, 14);
    doc.setTextColor(0, 0, 0);
  };

  /** Ensure there is enough vertical space; if not, add a new page. */
  const checkPageBreak = (neededHeight: number) => {
    if (yPos + neededHeight > pageHeight - margin - 10) {
      doc.addPage();
      yPos = margin + 8; // leave room for header
      addPageHeader();
    }
  };

  // ── Cover page ───────────────────────────────────────────────────────────
  if (options?.includeCoverPage !== false) {
    // Background accent bar
    doc.setFillColor(22, 163, 74); // green-600
    doc.rect(0, 0, pageWidth, 12, 'F');

    // Policy title
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 163, 74);
    const titleLines: string[] = doc.splitTextToSize(policyTitle, contentWidth - 10);
    let titleY = 72;
    titleLines.forEach((line: string) => {
      doc.text(line, pageWidth / 2, titleY, { align: 'center' });
      titleY += 11;
    });

    // Divider
    doc.setDrawColor(22, 163, 74);
    doc.setLineWidth(0.6);
    const dividerY = titleY + 6;
    doc.line(pageWidth / 2 - 30, dividerY, pageWidth / 2 + 30, dividerY);

    // Organisation name
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    doc.text(orgName, pageWidth / 2, dividerY + 14, { align: 'center' });

    // Effective date & version
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Effective Date: ${effectiveDateStr}`, pageWidth / 2, dividerY + 26, { align: 'center' });
    doc.text(`Version ${version}`, pageWidth / 2, dividerY + 34, { align: 'center' });

    // Compliance badge
    if (options?.includeComplianceBadge !== false) {
      const badgeY = dividerY + 52;
      const badgeText = 'Compliant with the Nigeria Data Protection Act (NDPA) 2023';
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);

      // Badge background
      const textWidth = doc.getTextWidth(badgeText);
      const badgePadX = 7;
      const badgePadY = 3.5;
      const badgeX = (pageWidth - textWidth - badgePadX * 2) / 2;
      doc.setFillColor(22, 163, 74);
      doc.roundedRect(badgeX, badgeY - badgePadY - 1, textWidth + badgePadX * 2, 7 + badgePadY, 2, 2, 'F');
      doc.text(badgeText, pageWidth / 2, badgeY + 1.5, { align: 'center' });
      doc.setTextColor(0, 0, 0);
    }

    // Bottom bar
    doc.setFillColor(22, 163, 74);
    doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');

    doc.addPage();
    yPos = margin + 8;
    addPageHeader();
  }

  // ── Table of contents ────────────────────────────────────────────────────
  const includedSections = policy.sections.filter((s) => s.included);

  if (options?.includeTOC !== false) {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 163, 74);
    doc.text('Table of Contents', margin, yPos + 4);

    // Green underline
    doc.setDrawColor(22, 163, 74);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos + 8, margin + 80, yPos + 8);

    yPos += 18;
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);

    includedSections.forEach((section, i) => {
      checkPageBreak(7);
      const label = `${i + 1}.  ${section.title}`;
      doc.text(label, margin + 4, yPos);
      yPos += 6.5;
    });

    doc.addPage();
    yPos = margin + 8;
    addPageHeader();
  }

  // ── Section content ──────────────────────────────────────────────────────
  includedSections.forEach((section, i) => {
    // Section heading
    checkPageBreak(18);

    // Number badge
    doc.setFillColor(22, 163, 74);
    doc.circle(margin + 3.5, yPos - 1.5, 3.8, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(String(i + 1), margin + 3.5, yPos - 0.5, { align: 'center' });

    // Heading text
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 163, 74);
    doc.text(section.title, margin + 11, yPos);
    yPos += 3;

    // Thin rule under heading
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.25);
    doc.line(margin + 11, yPos, pageWidth - margin, yPos);
    yPos += 6;

    // Content
    const content = (section.template || section.defaultContent || '').trim();
    if (content) {
      const contentLines = content.split('\n');
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);

      contentLines.forEach((rawLine) => {
        const line = rawLine.trimEnd();
        if (line === '') {
          yPos += 3; // paragraph gap
          return;
        }

        const isBullet = line.startsWith('-') || line.startsWith('•');
        const indentX = isBullet ? margin + 8 : margin + 4;
        const textContent = isBullet ? line.replace(/^[-•]\s*/, '') : line;
        const wrapWidth = contentWidth - (isBullet ? 12 : 8);

        const wrapped: string[] = doc.splitTextToSize(textContent, wrapWidth);
        wrapped.forEach((wline: string, wi: number) => {
          checkPageBreak(5);
          if (isBullet && wi === 0) {
            // bullet dot
            doc.setFillColor(22, 163, 74);
            doc.circle(margin + 4, yPos - 1, 0.9, 'F');
          }
          doc.text(wline, indentX, yPos);
          yPos += 5;
        });
      });
    }

    yPos += 10; // gap between sections
  });

  // ── Page footer on every page ────────────────────────────────────────────
  const totalPages: number = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(160, 160, 160);

    // Thin rule
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.text(orgName ? `${orgName} — Privacy Policy` : 'Privacy Policy', margin, pageHeight - 8);
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
    doc.setTextColor(0, 0, 0);
  }

  // ── PDF metadata ─────────────────────────────────────────────────────────
  doc.setProperties({
    title: policyTitle,
    author: orgName,
    subject: 'Privacy Policy — NDPA 2023 Compliant',
    keywords: 'privacy policy, NDPA, Nigeria, data protection',
  });

  return doc.output('blob') as Blob;
}
