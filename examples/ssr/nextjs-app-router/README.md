# NDPR Toolkit — Next.js App Router SSR example

Minimal Next.js 15 + React 19 scaffold that demonstrates the **cookie-bridge pattern** for
rendering the `@tantainnovative/ndpr-toolkit` consent banner without a hydration flash.

## The pattern

- `app/layout.tsx` is a Server Component that reads `ndpr-consent` from the request via
  `cookies()` (from `next/headers`), parses it with the shared helper, and passes the parsed
  `ConsentSettings | null` as a prop to `app/ConsentRoot.tsx`.
- `app/ConsentRoot.tsx` is a client component that owns the `cookieAdapter` and renders
  `<ConsentBanner show={!hasFreshConsent} manageStorage={false} ... />`. The cookie name passed
  to `cookieAdapter` must match the name read on the server — both use the `CONSENT_COOKIE`
  constant from `app/lib/parse-consent-cookie.ts`.

The browser-side `cookieAdapter` writes back to the same cookie on save, so the next SSR pass
sees the user's choice and renders the banner closed.

## Cookie name

`ndpr-consent` — exported as `CONSENT_COOKIE` from `app/lib/parse-consent-cookie.ts`.

## Run it

```bash
pnpm install
pnpm dev
```

Then open http://localhost:3000. Accept or customize the banner; refresh; observe that the
banner does not flash open before disappearing.

## Why `manageStorage={false}`

`<ConsentBanner>` defaults to talking to `localStorage` directly. In this scaffold the
`cookieAdapter` owns persistence end to end, so we turn the banner's built-in storage off and
write through `adapter.save(settings)` from the `onSave` callback.
