# NDPR Toolkit — Astro SSR example

Minimal Astro 5 scaffold (server output, Node adapter) that demonstrates the **cookie-bridge
pattern** for rendering the `@tantainnovative/ndpr-toolkit` consent banner without a hydration
flash.

## The pattern

- `src/pages/index.astro` runs on the server. Its frontmatter calls
  `Astro.cookies.get("ndpr-consent")?.value`, then parses the value with the shared helper from
  `src/lib/parse-consent-cookie.ts`.
- The parsed `ConsentSettings | null` is passed as a prop into the React island
  `<ConsentRoot client:load initialConsent={...} />`. JSON survives the Astro → React boundary.
- `src/components/ConsentRoot.tsx` is a React component that owns the `cookieAdapter` and
  renders `<ConsentBanner show={!hasFreshConsent} manageStorage={false} ... />`. The adapter
  writes back through the same cookie on save.

Astro defaults to static output. This scaffold sets `output: "server"` in `astro.config.mjs`
because the cookie bridge requires a request — there is none at build time.

## Cookie name

`ndpr-consent` — exported as `CONSENT_COOKIE` from `src/lib/parse-consent-cookie.ts`.

## Run it

```bash
pnpm install
pnpm dev
```

Then open http://localhost:4321.

## Why `manageStorage={false}`

`<ConsentBanner>` defaults to talking to `localStorage` directly. In this scaffold the
`cookieAdapter` owns persistence end to end, so we disable the banner's built-in storage and
write through `adapter.save(settings)` from `onSave`.
