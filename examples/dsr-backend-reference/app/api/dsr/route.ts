import { NextResponse } from "next/server";
import { validateDsrSubmissionStructured } from "@tantainnovative/ndpr-toolkit/server";
import { getPrisma, type DSRRequestRow } from "@/lib/prisma";
import { sendDsrConfirmationEmail } from "@/lib/resend";

/**
 * Production-grade DSR submission handler.
 *
 * Pipeline:
 *   1. Parse JSON body (return 400 on malformed JSON)
 *   2. Validate against the toolkit's canonical schema via
 *      `validateDsrSubmissionStructured` from @tantainnovative/ndpr-toolkit/server
 *      (returns 400 with { error, fields } if invalid — the preset reads
 *      the `fields` shape if you wire it up to display per-field errors)
 *   3. Defense-in-depth: reject blocklisted email domains (illustrative)
 *   4. Persist to Prisma (real client when DATABASE_URL is set,
 *      in-memory Map otherwise — see lib/prisma.ts)
 *   5. Send confirmation email (real Resend when RESEND_API_KEY is set,
 *      stdout otherwise — see lib/resend.ts). Best-effort: failure logs
 *      a warning but never fails the request.
 *   6. Respond 201 with { referenceId, estimatedCompletionAt } — exactly
 *      the shape <NDPRSubjectRights onSubmitSuccess={({ body }) => ...}>
 *      consumes (per CHANGELOG 3.8.1).
 *
 * Locking the allowed request types here mirrors the recommendation in the
 * `validateDsrSubmissionStructured` docstring: keeps the server in sync with the
 * default `RequestType[]` exported by the NDPRSubjectRights preset.
 */
const ALLOWED_REQUEST_TYPES = [
  "access",
  "rectification",
  "erasure",
  "portability",
  "restrict",
  "object",
  "withdraw_consent",
];

function getBlockedDomains(): Set<string> {
  const raw = process.env.DSR_BLOCKED_EMAIL_DOMAINS ?? "";
  return new Set(
    raw
      .split(",")
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean),
  );
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  // ── 1. Parse ─────────────────────────────────────────────────────────
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body must be valid JSON.", fields: {} },
      { status: 400 },
    );
  }

  // ── 2. Validate (toolkit) ────────────────────────────────────────────
  // v5's `validateDsrSubmissionStructured` returns `errors` as a
  // `{ field, code, message }[]` array; collapse it into the field→message
  // map the preset's per-field error display consumes.
  const { valid, errors, data } = validateDsrSubmissionStructured(raw, {
    requireIdentityVerification: true,
    allowedRequestTypes: ALLOWED_REQUEST_TYPES,
  });

  if (!valid || !data) {
    const fields = Object.fromEntries(errors.map((e) => [e.field, e.message]));
    return NextResponse.json(
      {
        error: "Validation failed.",
        fields,
      },
      { status: 400 },
    );
  }

  // ── 3. Defense-in-depth: block known throwaway providers ─────────────
  const emailDomain = data.dataSubject.email.split("@")[1]?.toLowerCase() ?? "";
  const blocked = getBlockedDomains();
  if (emailDomain && blocked.has(emailDomain)) {
    return NextResponse.json(
      {
        error: "Please use a non-temporary email address so we can verify your identity.",
        fields: { "dataSubject.email": "Disposable email providers are not accepted." },
      },
      { status: 400 },
    );
  }

  // ── 4. Persist ───────────────────────────────────────────────────────
  const receivedAt = new Date();
  const estimatedCompletionAt = new Date(receivedAt.getTime() + THIRTY_DAYS_MS);

  const prisma = getPrisma();
  let record: DSRRequestRow;
  try {
    record = await prisma.dSRRequest.create({
      data: {
        // Prisma's @default(cuid()) fills this on the real client, but the
        // mock honours whatever we pass. Generating server-side keeps the
        // reference deterministic across both modes.
        referenceId: generateReferenceId(),
        fullName: data.dataSubject.fullName,
        email: data.dataSubject.email,
        requestType: data.requestType,
        identifierType: data.dataSubject.identifierType,
        identifierValue: data.dataSubject.identifierValue,
        description:
          typeof data.additionalInfo?.correction_details === "string"
            ? (data.additionalInfo.correction_details as string)
            : null,
        status: "received",
        receivedAt,
        estimatedCompletionAt,
      },
    });
  } catch (err) {
    // Persistence failure IS a data-loss problem — fail the request so the
    // consumer can retry.
    //
    // PII-safe logging: Prisma's error.meta frequently contains the failing
    // column VALUES (email, fullName, identifierValue). Don't spread `err`
    // here — pluck only the safe fields (code + truncated message).
    const safeErr = (() => {
      if (err instanceof Error) {
        // Prisma errors carry a `code` field on the error object.
        const code = (err as Error & { code?: string }).code;
        return {
          code: code ?? null,
          message: err.message.length > 200 ? `${err.message.slice(0, 200)}…` : err.message,
        };
      }
      return { code: null, message: String(err).slice(0, 200) };
    })();
    // eslint-disable-next-line no-console
    console.error("[dsr] persist failed:", safeErr);
    return NextResponse.json(
      { error: "We couldn't record your request. Please try again.", fields: {} },
      { status: 500 },
    );
  }

  // ── 5. Email (best-effort) ───────────────────────────────────────────
  try {
    await sendDsrConfirmationEmail({
      to: record.email,
      fullName: record.fullName,
      referenceId: record.referenceId,
      requestType: record.requestType,
      estimatedCompletionAt: record.estimatedCompletionAt,
    });
  } catch (err) {
    // Don't fail the request — the DSR is already recorded.
    // eslint-disable-next-line no-console
    console.warn(
      `[dsr] confirmation email failed for ref ${record.referenceId} — will need manual follow-up:`,
      err,
    );
  }

  // ── 6. Respond (matches NDPRSubjectRights `onSubmitSuccess` contract) ─
  return NextResponse.json(
    {
      referenceId: record.referenceId,
      status: record.status,
      estimatedCompletionAt: record.estimatedCompletionAt.toISOString(),
    },
    { status: 201 },
  );
}

function generateReferenceId(): string {
  // Short, user-visible reference. Production: prefer cuid/uuid v7.
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.floor(Math.random() * 36 ** 4)
    .toString(36)
    .toUpperCase()
    .padStart(4, "0");
  return `DSR-${t}-${r}`;
}
