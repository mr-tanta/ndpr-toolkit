/**
 * Dual-mode Resend adapter.
 *
 * If process.env.RESEND_API_KEY is set we lazily load the real `resend` SDK.
 * Otherwise we log the email to stdout in a clearly-formatted block — useful
 * for local development and CI so the example runs without external network.
 *
 * Email sending is best-effort: failures are logged but never bubble back to
 * the route handler. The DSR has already been recorded by the time we get
 * here; missing email is a follow-up problem, not a data-loss problem.
 */

import { buildDsrConfirmationEmail } from "./email-templates";

export interface SendDsrConfirmationInput {
  to: string;
  fullName: string;
  referenceId: string;
  requestType: string;
  estimatedCompletionAt: Date;
}

const DEFAULT_FROM = "privacy@example.test";

export async function sendDsrConfirmationEmail(
  input: SendDsrConfirmationInput,
): Promise<{ delivered: boolean; mode: "resend" | "stdout"; id?: string }> {
  const { to, fullName, referenceId, requestType, estimatedCompletionAt } = input;
  const { subject, text, html } = buildDsrConfirmationEmail({
    fullName,
    referenceId,
    requestType,
    estimatedCompletionAt,
  });

  const from = process.env.DSR_FROM_EMAIL ?? DEFAULT_FROM;

  if (process.env.RESEND_API_KEY) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const { Resend } = require("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const result = await resend.emails.send({ from, to, subject, text, html });
      if (result?.error) {
        // eslint-disable-next-line no-console
        console.warn("[resend] send failed:", result.error);
        return { delivered: false, mode: "resend" };
      }
      return { delivered: true, mode: "resend", id: result?.data?.id };
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("[resend] SDK error — confirmation email NOT sent:", err);
      return { delivered: false, mode: "resend" };
    }
  }

  // MOCK: stdout transport. Swap by setting RESEND_API_KEY + DSR_FROM_EMAIL.
  //
  // PII-safe by default since 3.10.5 of the toolkit: prints the metadata
  // (from, to, subject) but NOT the full email body, which contains the
  // requester's full name and reference number. Set
  // `DSR_MOCK_PRINT_BODY=1` if you really want the body printed in dev.
  const includeBody = process.env.DSR_MOCK_PRINT_BODY === "1";
  // eslint-disable-next-line no-console
  console.log(
    [
      "",
      "─────────── [resend:mock] CONFIRMATION EMAIL ───────────",
      `From:    ${from}`,
      `To:      ${to}`,
      `Subject: ${subject}`,
      includeBody ? "" : "(body omitted — set DSR_MOCK_PRINT_BODY=1 to include)",
      includeBody ? text : "",
      "─────────────────────────────────────────────────────────",
      "",
    ]
      .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
      .join("\n"),
  );
  return { delivered: true, mode: "stdout" };
}
