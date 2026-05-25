# NDPR Toolkit — Remix SSR example

Minimal Remix (Vite) scaffold that demonstrates the **cookie-bridge pattern** for
rendering the `@tantainnovative/ndpr-toolkit` consent banner without a hydration flash.

## The pattern

- `app/root.tsx` exposes a `loader` that calls `readConsentFromRequest(request)` from
  `app/lib/parse-consent-cookie.ts`. The helper pulls `ndpr-consent` from
  `request.headers.get("cookie")`, decodes it, and validates the shape.
- The default `<App>` component reads the parsed value via `useLoaderData` and forwards it to
  `<ConsentRoot initialConsent={...} />`.
- `app/components/ConsentRoot.tsx` instantiates `cookieAdapter<ConsentSettings>("ndpr-consent")`
  and renders `<ConsentBanner show={!hasFreshConsent} manageStorage={false} ... />`. The
  adapter writes back through the same cookie on save, so the next SSR pass renders the banner
  closed.

## Cookie name

`ndpr-consent` — exported as `CONSENT_COOKIE` from `app/lib/parse-consent-cookie.ts`.

## Run it

```bash
pnpm install
pnpm dev
```

Then open http://localhost:3000.

## Why `manageStorage={false}`

`<ConsentBanner>` defaults to talking to `localStorage` directly. In this scaffold the
`cookieAdapter` owns persistence end to end, so we turn the banner's built-in storage off and
write through `adapter.save(settings)` from `onSave`. The same cookie is the canonical record
on both server and client.
