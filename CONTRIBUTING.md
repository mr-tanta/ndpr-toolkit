# Contributing to `@tantainnovative/ndpr-toolkit`

Thanks for considering a contribution. This document is the practical "how do I get from zero to a merged PR" guide.

For interpersonal conduct, see [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md). For vulnerability reports, see [`SECURITY.md`](./SECURITY.md) — please don't open public issues for security bugs.

## Tooling

- **Node**: `>=20` (set via `package.json#engines`). The CI matrix tests 20.x and 22.x.
- **Package manager**: `pnpm 10`. `corepack enable && corepack prepare pnpm@10 --activate` if you don't have it.
- **Editor**: anything that speaks TypeScript. The repo's strict mode catches most issues at edit time.

## Setup

```bash
git clone https://github.com/mr-tanta/ndpr-toolkit.git
cd ndpr-toolkit
pnpm install
```

## Repo layout (the load-bearing bits)

```
/                                — docs site root (Next.js 15 App Router) + publishable package
├── README.md                    — what ships to npm
├── CHANGELOG.md                 — release history
├── package.json                 — the published manifest (root!)
├── tsup.config.ts               — library build config (used by `pnpm build:lib`)
├── scripts/
│   ├── verify-tarball.mjs       — pre-publish CI gate (see below)
│   └── rollup-dts.mjs           — dts-rollup post-build step
├── packages/
│   └── ndpr-toolkit/
│       ├── src/                 — the library source (THIS is what publishes)
│       │   ├── components/      — React components grouped by module
│       │   ├── hooks/           — React hooks
│       │   ├── adapters/        — pluggable storage
│       │   ├── presets/         — zero-config preset components
│       │   ├── utils/           — pure validators, generators, scoring
│       │   ├── types/           — shared TS interfaces
│       │   ├── locales/         — i18n locale files (en, yo, ig, ha, pcm)
│       │   ├── styles/          — CSS (BEM + CSS custom props)
│       │   └── __tests__/       — Jest + RTL test suites
│       └── package.json         — INNER manifest, marked `"private": true`, NOT published
├── src/                         — docs site (Next.js pages, components, blog)
└── examples/                    — runnable example apps
```

**Important:** The *root* `package.json` is the one that publishes. `packages/ndpr-toolkit/package.json` is marked `"private": true` and exists only as a drift surface; do not edit it for shipping purposes.

## Common tasks

### Run a single test file

```bash
pnpm test -- packages/ndpr-toolkit/src/__tests__/components/consent/ConsentBanner.test.tsx
```

### Run the full Jest suite

```bash
pnpm test
```

### Build the library

```bash
pnpm build:lib
```

Outputs `dist/` with the published shape (22+ subpath entry points × `.js` / `.mjs` / `.d.ts`, plus `dist/styles.css`).

### Run the docs site locally

```bash
pnpm dev
```

Opens at `http://localhost:3000`. Docs pages live at `src/app/docs/`; demos at `src/app/ndpr-demos/`.

### Pre-publish verification (the `verify:tarball` gate)

```bash
pnpm verify:tarball              # full (~90s) — build + pack + ESM + CJS + TS
pnpm verify:tarball --skip-ts    # ~30s faster
pnpm verify:tarball --skip-build # reuse existing dist/
```

This is the gate that prevents the 3.8.0–3.10.2 missing-exports class of bug. **If you add a new subpath to `package.json#exports`, you MUST also add a probe entry to the `PROBES` table in `scripts/verify-tarball.mjs`** — the script's sync-check fails the build if they drift.

### Typecheck the docs site

```bash
npx tsc --noEmit -p tsconfig.json
```

## Release flow (maintainers)

1. Branch: `fix/`, `feat/`, or `chore/` prefix per change type.
2. Update `package.json#version` AND `packages/ndpr-toolkit/package.json#version` (keep them in sync — both are bumped together).
3. Add a CHANGELOG entry at the top under the new version heading.
4. Open a PR. CI runs: tests on Node 20 + 22, type check, build, verify-tarball, CodeQL.
5. Admin-merge once green: `gh pr merge --admin --merge --delete-branch`.
6. From `main`: `git tag -a v<X.Y.Z> -m "..."` and `git push origin v<X.Y.Z>`.
7. `gh release create v<X.Y.Z> --title "..." --notes "..."`.
8. The `Publish to npm` workflow fires on `release: published`, runs the same checks plus `verify:tarball` again, then `npm publish --provenance`.
9. After publish completes, verify with `npm view @tantainnovative/ndpr-toolkit dist-tags --json` and read the npm README at `npm view @tantainnovative/ndpr-toolkit readme | head -25`.

The `verify:tarball` gate runs both on PR (via `ci.yml`) AND immediately before `npm publish` (via `publish.yml`). It's the safety net that catches broken subpath exports.

## Branch + commit conventions

- Prefix branches with `fix/<slug>`, `feat/<slug>`, `chore/<slug>`, `docs/<slug>`.
- Conventional commits in PR titles: `fix(...)`, `feat(...)`, `chore(...)`, etc.
- Multi-line commit messages welcome — describe the *why*, not just the *what*.
- Don't add `Co-Authored-By` trailers or `Generated with …` footers.

## What to include in a PR

- **Test for any bug fix.** Regression tests are how we know the fix sticks.
- **JSDoc `@example` block** if you add a new public hook or component.
- **CHANGELOG entry** under the upcoming version heading (decide patch / minor / major using the table below).
- If you add a new subpath to `package.json#exports`: a probe entry in `scripts/verify-tarball.mjs`.
- If you add a new docs page: a sidebar entry in `src/components/docs/DocLayout.tsx`.

### Patch / minor / major decision

| Change | Bump |
|---|---|
| Bug fix, internal refactor, no observable API change | **patch** (3.10.x) |
| New component / new prop (optional) / new hook / new adapter | **minor** (3.x.0) |
| Removed export, renamed prop, changed required-arg shape, dropped React version support | **major** (4.0.0+) |

If you're not sure, mark the PR and we'll calibrate together.

## i18n contributions

The toolkit ships 5 locale files (`en`, `yo`, `ig`, `ha`, `pcm`) under `packages/ndpr-toolkit/src/locales/`. To add a locale:

1. Copy `en.ts` to `<ISO 639-1 code>.ts`.
2. Translate the strings in place.
3. Add an entry to the locale type registry if it's not already covered by `NDPRLocale`.

Native speakers welcome — even partial coverage is useful (missing keys fall back to English).

## Questions

For design discussion: open a Discussion in the repo (linked from `.github/ISSUE_TEMPLATE/config.yml`). For specific bugs or feature requests: open an Issue using the appropriate template.

For security: see `SECURITY.md` → `security@tantainnovative.com`. **Don't** open a public issue for security bugs.
