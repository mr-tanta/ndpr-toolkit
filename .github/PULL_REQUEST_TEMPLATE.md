<!-- Thanks for contributing to @tantainnovative/ndpr-toolkit. -->

## Summary

<!-- 1-3 sentences. What does this PR change and why? -->

## Type of change

- [ ] Bug fix (patch release)
- [ ] New feature (minor release, additive)
- [ ] Breaking change (major release)
- [ ] Docs / examples / build only
- [ ] Other (describe below)

## Affected modules

- [ ] Consent (`/consent`, `/presets/consent`)
- [ ] DSR (`/dsr`, `/presets/dsr`)
- [ ] DPIA (`/dpia`)
- [ ] Breach (`/breach`)
- [ ] Privacy Policy (`/policy`, `/presets/policy`)
- [ ] Lawful Basis (`/lawful-basis`)
- [ ] Cross-Border (`/cross-border`)
- [ ] ROPA (`/ropa`)
- [ ] Adapters (`/adapters`)
- [ ] Server-side utilities (`/server`)
- [ ] Theme / styles
- [ ] Build / CI / repo hygiene
- [ ] Docs site (`/src/app/docs`)

## Test plan

<!-- How did you verify the change? -->

- [ ] `pnpm test` — full Jest suite passes
- [ ] `pnpm verify:tarball` — every documented subpath resolves (ESM + CJS + TS)
- [ ] `npx tsc --noEmit -p tsconfig.json` — docs site clean
- [ ] `pnpm typecheck:storybook && pnpm build:storybook` — consent stories compile and render
- [ ] Manually exercised the changed surface in `pnpm dev`

## Checklist

- [ ] CHANGELOG entry added (under the upcoming version)
- [ ] No `lockfile` drift (check `pnpm-lock.yaml` diff is minimal + intentional)
- [ ] No PII or secrets in test fixtures or example logs
- [ ] If a new subpath was added: it's in `package.json#exports` AND in `scripts/verify-tarball.mjs PROBES`
- [ ] If a public API changed: it's documented in `src/app/docs/`
- [ ] If a workflow was changed: untrusted inputs are passed via `env:`, not interpolated into `run:`

## Related

<!-- Issues / discussions / prior PRs this builds on. -->
