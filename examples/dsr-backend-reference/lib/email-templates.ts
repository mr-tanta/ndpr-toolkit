/**
 * Plain-text and HTML email templates for the DSR confirmation email.
 *
 * Kept dependency-free (no MJML, no JSX-email) so the example focuses on the
 * pipeline shape rather than email rendering choices. Replace with your
 * design-system templates in production.
 */

export interface DsrConfirmationTemplateInput {
  fullName: string;
  referenceId: string;
  requestType: string;
  estimatedCompletionAt: Date;
}

function formatDeadline(date: Date): string {
  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function buildDsrConfirmationEmail(input: DsrConfirmationTemplateInput): {
  subject: string;
  text: string;
  html: string;
} {
  const { fullName, referenceId, requestType, estimatedCompletionAt } = input;
  const deadline = formatDeadline(estimatedCompletionAt);

  const subject = `We received your data request (ref ${referenceId})`;

  const text = [
    `Hi ${fullName},`,
    ``,
    `We received your "${requestType}" request and logged it under reference ${referenceId}.`,
    ``,
    `Under NDPA Sections 34–38 we'll respond by ${deadline} (30 days from receipt).`,
    `Keep this email — you'll need the reference number if you contact us about the request.`,
    ``,
    `If you didn't make this request, reply to this message and we'll investigate immediately.`,
    ``,
    `— Privacy team`,
  ].join("\n");

  const html = `<!doctype html>
<html lang="en">
  <body style="font-family:system-ui,sans-serif;line-height:1.6;color:#0f172a;max-width:560px;margin:0 auto;padding:24px;">
    <h1 style="font-size:1.25rem;margin:0 0 12px;">We received your data request</h1>
    <p>Hi ${fullName},</p>
    <p>
      We received your <strong>${requestType}</strong> request and logged it under reference
      <code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;">${referenceId}</code>.
    </p>
    <p>
      Under NDPA Sections 34&ndash;38 we will respond by <strong>${deadline}</strong>
      (30 days from receipt). Keep this email &mdash; you'll need the reference
      number if you contact us about the request.
    </p>
    <p style="color:#475569;font-size:0.9375rem;">
      If you didn't make this request, reply to this message and we'll investigate immediately.
    </p>
    <p>&mdash; Privacy team</p>
  </body>
</html>`;

  return { subject, text, html };
}
