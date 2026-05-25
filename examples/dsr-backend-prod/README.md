# DSR backend — production reference

A runnable Next.js 15 reference implementation of a **production-grade DSR
submission backend** that pairs with the `NDPRSubjectRights` preset and its
typed `onSubmitSuccess` / `onSubmitError` callbacks (toolkit 3.6.0 + 3.8.1
contract).

The other examples (`ecommerce-starter`, `nextjs-app`, `ssr/*`) ship in-memory
toy `route.ts` snippets. This one shows the real thing: server-side
validation, Prisma persistence, and Resend email confirmation — with
zero-config mocks so it runs out of the box.

## Run it

```bash
pnpm install
pnpm dev
# open http://localhost:3000/dsr
```

Submit the form. You'll be redirected to `/dsr-confirmation?ref=...&eta=...`
and the confirmation email will be printed to the dev server's stdout (no
SMTP/Resend account needed).

## The four layers

| # | Layer | File | What it does |
|---|---|---|---|
| 1 | Toolkit form | `app/dsr/page.tsx` | Mounts `<NDPRSubjectRights submitTo="/api/dsr" onSubmitSuccess={...} onSubmitError={...} />`. The success handler narrows `body.referenceId` / `body.estimatedCompletionAt` and navigates to `/dsr-confirmation`. |
| 2 | Validation | `app/api/dsr/route.ts` | Calls `validateDsrSubmission` from `@tantainnovative/ndpr-toolkit/server`. Returns `400 { error, fields }` on failure. Adds a defense-in-depth email-domain blocklist. |
| 3 | Persistence | `prisma/schema.prisma` + `lib/prisma.ts` | Prisma `DSRRequest` model with `referenceId`, `estimatedCompletionAt` (received + 30 days per NDPA Part VI §34). Dual-mode shim falls back to an in-memory `Map` when `DATABASE_URL` is unset. |
| 4 | Email | `lib/resend.ts` + `lib/email-templates.ts` | Resend SDK with a stdout fallback when `RESEND_API_KEY` is unset. Best-effort: a failure logs a warning but never fails the request. |

## API contract

`POST /api/dsr` accepts the canonical `DSRFormSubmission` body
(`requestType`, `dataSubject.{ fullName, email, identifierType,
identifierValue }`, optional `additionalInfo`, `submittedAt`).

**On success (201):**

```json
{
  "referenceId": "DSR-XXX-YYYY",
  "status": "received",
  "estimatedCompletionAt": "2026-06-24T12:34:56.789Z"
}
```

This is exactly the shape `NDPRSubjectRights.onSubmitSuccess` consumers read
via `body` — see toolkit CHANGELOG 3.8.1.

**On validation failure (400):**

```json
{
  "error": "Validation failed.",
  "fields": {
    "dataSubject.email": "Email address format is invalid",
    "dataSubject.identifierValue": "Identifier value is required"
  }
}
```

The toolkit's `onSubmitError` receives a `Response` you can `await
response.json()` to surface field-level errors next to inputs.

## Swap mocks for production

### Real Prisma

```bash
# 1. Pick a database — SQLite is the schema default, swap to postgresql for prod.
echo 'DATABASE_URL="file:./dev.db"' >> .env.local

# 2. Generate the client and run the first migration.
pnpm prisma:generate
pnpm prisma:migrate
```

`lib/prisma.ts` checks `process.env.DATABASE_URL` at runtime and switches to
the real `@prisma/client` automatically. The mock prints
`[prisma] using in-memory MOCK`; the real client prints `[prisma] using real
@prisma/client`.

### Real Resend

```bash
# Verify a sender domain in Resend first.
echo 'RESEND_API_KEY="re_xxxxxxxx"' >> .env.local
echo 'DSR_FROM_EMAIL="privacy@yourdomain.example"' >> .env.local
```

`lib/resend.ts` switches transports the same way: present key → real Resend;
absent → stdout block.

## Environment variables

| Var | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | (unset) | Real Prisma when set; in-memory Map mock otherwise. |
| `RESEND_API_KEY` | (unset) | Real Resend when set; stdout mock otherwise. |
| `DSR_FROM_EMAIL` | `privacy@example.test` | Sender address for the confirmation email. |
| `DSR_BLOCKED_EMAIL_DOMAINS` | (empty) | Comma-separated domains rejected at validation (illustrative). |

See `.env.example`.

## File map

```
examples/dsr-backend-prod/
  README.md
  package.json                # ^3.10.0 of @tantainnovative/ndpr-toolkit
  tsconfig.json
  next.config.mjs
  .env.example
  prisma/
    schema.prisma             # DSRRequest model
  lib/
    prisma.ts                 # dual-mode Prisma client (real / Map mock)
    resend.ts                 # dual-mode Resend client (real / stdout mock)
    email-templates.ts        # confirmation email body
  app/
    layout.tsx
    page.tsx                  # landing — "this is a backend example"
    dsr/
      page.tsx                # NDPRSubjectRights mount + onSubmitSuccess
    dsr-confirmation/
      page.tsx                # reads ?ref=...&eta=...
    api/
      dsr/
        route.ts              # validate → persist → email → respond
```

## What this example deliberately does NOT do

- **Identity verification flow.** A real production handler would email a
  one-time link before allowing data access. This example records the request
  and stops — exactly what NDPA Section 34 considers "receipt".
- **Auth / rate-limiting.** Drop a middleware (`upstash/ratelimit`,
  `next-safe-action`, etc.) in front of the route in production.
- **Multi-tenant separation.** Add a `controllerId` column to `DSRRequest`
  and key it off the host/subdomain or session.
- **Audit log.** Wire `ComplianceAuditLog` from
  `@tantainnovative/ndpr-recipes` for tamper-evident records of who viewed
  the DSR after it landed.
