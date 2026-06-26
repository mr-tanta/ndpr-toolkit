# Publishing to npm

This repo publishes `@tantainnovative/ndpr-toolkit` from the repository root via
GitHub Releases and npm Trusted Publishing. Companion packages
(`@tantainnovative/create-ndpr`, `@tantainnovative/ndpr-recipes`, and the
unscoped `create-ndpr` alias) publish from their package directories when their
versions are new.

## Pre-release Checklist

- Confirm `package.json#version` matches the intended release tag.
- Run `pnpm verify:ci`.
- For docs-site changes, run `pnpm build`.
- Update `CHANGELOG.md` with the correct taxonomy: Features, Bug Fixes,
  Documentation, or Compliance Rule Changes.
- For compliance-sensitive changes, update affected legal citations, examples,
  tests, and the relevant docs page.
- Re-check `/docs/guides/legal-basis-and-citations` and
  `/docs/guides/legal-sources-governance` when NDPA, NDPC, GAID, DCPMI, CAR, or
  audit CLI behavior changes.
- Do not claim the toolkit is legally complete or always current; state the
  source, retrieval date or source version, and user responsibility to verify
  current NDPC guidance.

## Compliance Rule Release Policy

Use this policy when a change affects statutory assumptions, compliance
deadlines, NDPC filing expectations, legal citations, default thresholds, or
compliance scoring.

| Change type | Release level | Changelog heading |
| --- | --- | --- |
| Citation wording, docs clarification, examples, false-positive fixes, or non-breaking validator behavior | Patch | Documentation or Bug Fixes |
| New regulatory utility, new module coverage, new check, stricter optional validation, or configurable updated threshold | Minor | Features or Compliance Rule Changes |
| Removed export, changed required argument shape, materially different compliance assumption, or default behavior that can break existing workflows | Major | Breaking Changes and Compliance Rule Changes |

When in doubt, choose the more conservative release level and explain the
operational impact in the release notes.

## Build Commands

```bash
pnpm verify:ci
pnpm build
pnpm verify:tarball
```

`pnpm verify:ci` runs lint, typecheck, serial Jest tests, library build, and the
tarball verification gate. `pnpm build` verifies the public docs site and static
export.

## Release Steps

1. Merge the release PR after CI and CodeQL are green.
2. From `main`, create and push the annotated tag:

   ```bash
   git tag -a v<X.Y.Z> -m "v<X.Y.Z>"
   git push origin v<X.Y.Z>
   ```

3. Create the GitHub release:

   ```bash
   gh release create v<X.Y.Z> --title "v<X.Y.Z>" --notes-file /path/to/release-notes.md
   ```

4. The `Publish to npm` workflow runs on `release: published`, installs with the
   frozen lockfile, runs tests, builds the library, verifies every subpath, checks
   the tag/version match, and publishes with provenance.
5. Verify npm after the workflow completes:

   ```bash
   npm view @tantainnovative/ndpr-toolkit version
   npm view @tantainnovative/ndpr-toolkit dist-tags --json
   npm view @tantainnovative/ndpr-toolkit readme | head -25
   ```

## Companion Packages

The publish workflow also checks companion package versions:

- `packages/create-ndpr`
- `packages/ndpr-recipes`
- `packages/create-ndpr-unscoped`

Each companion publish is idempotent: if that version already exists on npm, the
step skips it. To publish only companion packages without a main-library release,
run the `Publish to npm` workflow manually with `publish_companions: true`.

## User-facing Release Notes

Every compliance-impacting release note should answer:

- What source changed or was clarified?
- Which modules are affected?
- Is this a docs-only clarification, an optional new check, or a behavior change?
- Do users need to update config, re-run audits, refresh evidence, or seek legal
  review?
- Which docs page contains the updated citation or migration guidance?

Users can watch GitHub Releases at
<https://github.com/mr-tanta/ndpr-toolkit/releases> and npm versions at
<https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit>.
