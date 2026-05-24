# Publishing `create-ndpr` (unscoped alias)

This package is a 30-line thin alias for `@tantainnovative/create-ndpr` that delegates via `npx`. It enables the idiomatic `npm create ndpr@latest` invocation. The actual scaffolder logic lives in the scoped package — this alias only re-exposes the bin under the canonical `create-ndpr` name.

It needs a **one-time manual publish** to register the name on npm, then a Trusted Publisher to handle subsequent updates automatically.

## One-time setup (5 minutes)

### 1. Verify the name is still available

```bash
curl -sI https://registry.npmjs.org/create-ndpr | head -1
```

`HTTP/2 404` means the name is free. Anything else means another package owns it — stop and re-evaluate.

### 2. Log in to npm with the maintainer account

```bash
npm whoami
# If not logged in:
npm login
```

### 3. Publish from the package directory

```bash
cd packages/create-ndpr-unscoped
npm publish --access public --provenance
```

`--provenance` requires Node 18+ and works locally as long as you're publishing manually (sigstore signs against your account). If you see `npm error code ENEEDAUTH`, run `npm login` first.

If `--provenance` fails locally (it sometimes does without a CI environment), drop it for the first publish:

```bash
npm publish --access public
```

You can re-publish with provenance from CI once the Trusted Publisher is registered (next step).

### 4. Verify the publish

```bash
npm view create-ndpr
```

Expect to see version `1.0.0`, `@tantainnovative/create-ndpr` listed in dependencies, and the GitHub repo URL.

Test the alias works:

```bash
# In a fresh empty directory
mkdir -p /tmp/test-ndpr-alias && cd /tmp/test-ndpr-alias
npm init -y
npm create ndpr@latest
```

Should boot the scaffolder. Quit at the first prompt — you only need to confirm the alias resolves.

### 5. Register a Trusted Publisher on npm

So future updates auto-publish via the existing GitHub Actions workflow:

1. Visit https://www.npmjs.com/package/create-ndpr/access
2. Scroll to "Trusted publishers" → "Add trusted publisher"
3. Choose **GitHub Actions** and fill in:
   - **Organization:** `mr-tanta`
   - **Repository:** `ndpr-toolkit`
   - **Workflow filename:** `publish.yml`
   - **Environment:** leave blank
4. Save.

### 6. (Optional) Wire the publish workflow

The existing `.github/workflows/publish.yml` publishes the main library on every release. If you want `create-ndpr` (unscoped) to follow, add this step after the main publish:

```yaml
- name: Publish create-ndpr (unscoped alias) to npm
  working-directory: packages/create-ndpr-unscoped
  run: npm publish --access public --provenance
```

This is opt-in. The alias rarely needs republishing because it delegates to `@latest` of the scoped package at runtime — bumping the scoped CLI automatically updates what `npm create ndpr` runs.

## When to bump this package's version

Only when:

- You change `bin/index.mjs` (e.g., new flag passthrough)
- You add CLI args that need to be forwarded
- The dependency on `@tantainnovative/create-ndpr` becomes incompatible (e.g., scoped CLI requires a flag this alias doesn't pass)

Day-to-day improvements to the scaffolder don't need an alias bump — `npx` always grabs the latest scoped CLI.

## Why a separate package?

npm's `npm create <name>` convention resolves to `create-<name>` (unscoped). For scoped packages it's `npm create @scope/<name>` → `@scope/create-<name>`. So:

- `npm create ndpr` → looks for **`create-ndpr`** (this package — unscoped)
- `npm create @tantainnovative/ndpr` → looks for `@tantainnovative/create-ndpr` (the canonical scoped package)

Without this alias, `npm create ndpr` and `npx create-ndpr` would both 404. Users have to remember the full scope name — which is the friction the toolkit's audit flagged.
