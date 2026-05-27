#!/usr/bin/env node
/**
 * Pre-publish tarball verification.
 *
 * Builds the library, packs it with `npm pack`, installs the resulting
 * tarball into a throwaway sandbox, and verifies that every documented
 * subpath in `package.json` `exports` resolves via:
 *   1. ESM `import` (runtime resolution)
 *   2. CJS `require()` (runtime resolution, dual-mode check)
 *   3. TypeScript `tsc --noEmit` (type resolution)
 *
 * For each subpath, additionally asserts a known named export resolves to
 * something defined (not `undefined`) — catches a class of bugs where the
 * subpath resolves but the named export was dropped.
 *
 * Why this exists
 * ---------------
 * Versions 3.8.0 through 3.10.2 silently shipped with four subpath exports
 * (`/headless`, `/lawful-basis/lite`, `/cross-border/lite`, `/ropa/lite`)
 * MISSING from the root package.json `exports` map even though their dist
 * files were always built and included in the tarball. The publish
 * workflow's `Verify entry points` step only checked that the dist files
 * existed on disk — it never exercised Node's resolver against the actual
 * exports map. Consumers got `ERR_PACKAGE_PATH_NOT_EXPORTED` with no
 * upstream signal.
 *
 * This script closes that gap. Run before `npm publish`; if it fails, the
 * publish does not happen.
 *
 * Usage
 * -----
 *   node scripts/verify-tarball.mjs            # full check (~60-90s)
 *   node scripts/verify-tarball.mjs --skip-build  # reuse existing dist/
 *   node scripts/verify-tarball.mjs --skip-ts     # skip the tsc step (~30s faster)
 */

import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const PKG_NAME = "@tantainnovative/ndpr-toolkit";
const SKIP_BUILD = process.argv.includes("--skip-build");
const SKIP_TS = process.argv.includes("--skip-ts");

/**
 * Probe table — single source of truth for what we expect to import from
 * each subpath. A known named export from each entry. If a future change
 * removes one of these symbols, this script will catch it at publish time.
 *
 * Keys MUST match `package.json` `exports` keys (minus `./styles`, which is
 * a CSS file and has no JS export surface).
 */
const PROBES = {
  ".": ["ConsentBanner", "validateConsentStructured", "NDPRThemeProvider"],
  "./core": ["NDPRProvider", "validateConsentStructured", "getComplianceScore"],
  "./server": ["validateConsentStructured", "generatePolicyText", "getComplianceScore"],
  "./hooks": ["useConsent", "useDSR", "useDPIA"],
  "./headless": ["useConsent", "useDSR", "useDPIA"],
  "./adapters": ["cookieAdapter", "apiAdapter", "localStorageAdapter"],
  "./presets": ["NDPRConsent", "NDPRSubjectRights"],
  "./presets/consent": ["NDPRConsent"],
  "./presets/dsr": ["NDPRSubjectRights"],
  "./presets/policy": ["NDPRPrivacyPolicy"],
  "./consent": ["ConsentBanner"],
  "./dsr": ["DSRRequestForm"],
  "./dpia": ["DPIAQuestionnaire"],
  "./breach": ["BreachReportForm"],
  "./policy": ["PolicyGenerator"],
  "./lawful-basis": ["LawfulBasisTracker"],
  "./lawful-basis/lite": ["LawfulBasisTrackerLite"],
  "./cross-border": ["CrossBorderTransferManager"],
  "./cross-border/lite": ["CrossBorderTransferManagerLite"],
  "./ropa": ["ROPAManager"],
  "./ropa/lite": ["ROPAManagerLite"],
  "./unstyled": ["ConsentBanner"],
};

function subpathToImport(sub) {
  return sub === "." ? PKG_NAME : `${PKG_NAME}${sub.slice(1)}`;
}

function step(label) {
  console.log(`\n━━ ${label} ━━`);
}

function fail(msg) {
  console.error(`\n✗ FAIL: ${msg}`);
  process.exit(1);
}

/**
 * Run a command + args via spawnSync. Throws on non-zero unless `allowFail`
 * is set. Returns the trimmed stdout for capture cases.
 */
function run(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, {
    stdio: opts.capture ? ["ignore", "pipe", "pipe"] : "inherit",
    cwd: opts.cwd,
    env: process.env,
  });
  if (result.status !== 0 && !opts.allowFail) {
    if (opts.capture) {
      console.error(result.stdout?.toString() ?? "");
      console.error(result.stderr?.toString() ?? "");
    }
    fail(
      `${cmd} ${args.join(" ")} exited ${result.status}${opts.cwd ? ` (cwd=${opts.cwd})` : ""}`,
    );
  }
  return opts.capture ? result.stdout.toString().trim() : "";
}

// ── 0. Sync check: every exports key must have a probe ─────────────────────
step("0. Sync probes with package.json exports");
const rootPkg = JSON.parse(readFileSync("package.json", "utf8"));
const exportKeys = Object.keys(rootPkg.exports).filter((k) => k !== "./styles");
const probeKeys = Object.keys(PROBES);

const missingProbes = exportKeys.filter((k) => !probeKeys.includes(k));
const orphanedProbes = probeKeys.filter((k) => !exportKeys.includes(k));

if (missingProbes.length) {
  fail(
    `package.json exports has subpaths with no probe — add to PROBES in scripts/verify-tarball.mjs:\n  ${missingProbes.join("\n  ")}`,
  );
}
if (orphanedProbes.length) {
  fail(
    `scripts/verify-tarball.mjs PROBES has entries that aren't in package.json exports — remove or fix:\n  ${orphanedProbes.join("\n  ")}`,
  );
}
console.log(`  ✓ ${exportKeys.length} exports keys, all have probes`);

// ── 1. Build (optional) ────────────────────────────────────────────────────
if (!SKIP_BUILD) {
  step("1. pnpm build:lib");
  run("pnpm", ["build:lib"]);
} else {
  step("1. pnpm build:lib (SKIPPED via --skip-build)");
  if (!existsSync("dist/index.mjs")) {
    fail("--skip-build was passed but dist/index.mjs does not exist");
  }
}

// ── 2. Pack ────────────────────────────────────────────────────────────────
step("2. npm pack");
const packJson = run("npm", ["pack", "--json"], { capture: true });
const tarFilename = JSON.parse(packJson)[0].filename;
const tarPath = path.resolve(tarFilename);
console.log(`  ✓ packed ${tarFilename}`);

let sbox;
let exitCode = 0;
try {
  // ── 3. Sandbox + install ────────────────────────────────────────────────
  step("3. Install tarball into fresh sandbox");
  sbox = mkdtempSync(path.join(tmpdir(), "ndpr-verify-tarball-"));
  console.log(`  sandbox: ${sbox}`);
  run("npm", ["init", "-y"], { cwd: sbox });
  // Install with react peers + typescript (for the type-resolution probe).
  // --no-fund --no-audit shaves noise.
  run(
    "npm",
    [
      "install",
      "--no-fund",
      "--no-audit",
      tarPath,
      "react",
      "react-dom",
      "typescript",
      "@types/react",
      "@types/react-dom",
      "@types/node",
    ],
    { cwd: sbox },
  );

  // ── 4. ESM probe ─────────────────────────────────────────────────────────
  step("4. ESM resolution probe");
  const esmScript =
    `const fails = [];\n` +
    `async function run() {\n` +
    Object.entries(PROBES)
      .map(([sub, syms]) => {
        const pkg = subpathToImport(sub);
        const symChecks = syms
          .map(
            (s) =>
              `    if (typeof mod.${s} === 'undefined') fails.push('${pkg}: named export ${s} is undefined');`,
          )
          .join("\n");
        return (
          `  try {\n` +
          `    const mod = await import('${pkg}');\n` +
          symChecks +
          `\n` +
          `  } catch (e) {\n` +
          `    fails.push('${pkg}: ESM import failed — ' + e.message);\n` +
          `  }`
        );
      })
      .join("\n") +
    `\n}\n` +
    `run().then(() => {\n` +
    `  if (fails.length) { console.error(fails.join('\\n')); process.exit(1); }\n` +
    `  console.log('  ✓ ESM: all ${probeKeys.length} subpaths resolved, all named exports defined');\n` +
    `});\n`;
  const esmFile = path.join(sbox, "esm-probe.mjs");
  writeFileSync(esmFile, esmScript);
  run("node", [esmFile]);

  // ── 5. CJS probe ─────────────────────────────────────────────────────────
  step("5. CJS resolution probe");
  const cjsScript =
    `const fails = [];\n` +
    Object.entries(PROBES)
      .map(([sub, syms]) => {
        const pkg = subpathToImport(sub);
        const symChecks = syms
          .map(
            (s) =>
              `  if (typeof mod.${s} === 'undefined') fails.push('${pkg}: named export ${s} is undefined in CJS');`,
          )
          .join("\n");
        return (
          `try {\n` +
          `  const mod = require('${pkg}');\n` +
          symChecks +
          `\n` +
          `} catch (e) {\n` +
          `  fails.push('${pkg}: CJS require failed — ' + e.message);\n` +
          `}`
        );
      })
      .join("\n") +
    `\n` +
    `if (fails.length) { console.error(fails.join('\\n')); process.exit(1); }\n` +
    `console.log('  ✓ CJS: all ${probeKeys.length} subpaths resolved, all named exports defined');\n`;
  const cjsFile = path.join(sbox, "cjs-probe.cjs");
  writeFileSync(cjsFile, cjsScript);
  run("node", [cjsFile]);

  // ── 6. /styles resolution ────────────────────────────────────────────────
  step("6. /styles resolution");
  const stylesScript =
    `const path = require('path');\n` +
    `try {\n` +
    `  const resolved = require.resolve('${PKG_NAME}/styles');\n` +
    `  if (!resolved.endsWith('.css')) {\n` +
    `    console.error('Expected .css, got ' + resolved);\n` +
    `    process.exit(1);\n` +
    `  }\n` +
    `  console.log('  ✓ /styles resolves to ' + path.basename(resolved));\n` +
    `} catch (e) {\n` +
    `  console.error('  ✗ /styles failed: ' + e.message);\n` +
    `  process.exit(1);\n` +
    `}\n`;
  const stylesFile = path.join(sbox, "styles-probe.cjs");
  writeFileSync(stylesFile, stylesScript);
  run("node", [stylesFile]);

  // ── 7. TypeScript probe (optional) ───────────────────────────────────────
  if (!SKIP_TS) {
    step("7. TypeScript resolution probe (tsc --noEmit)");
    const tsConfig = {
      compilerOptions: {
        target: "es2020",
        module: "esnext",
        moduleResolution: "bundler",
        jsx: "react-jsx",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        noEmit: true,
        types: [],
      },
      include: ["probe.ts"],
    };
    writeFileSync(
      path.join(sbox, "tsconfig.json"),
      JSON.stringify(tsConfig, null, 2),
    );

    // Alias every import to a unique name so the single probe.ts can pull
    // the same symbol (e.g. ConsentBanner) from multiple subpaths without
    // tripping TS2300 "Duplicate identifier" errors. The slug embeds the
    // subpath so a failure points at the source.
    const slug = (sub) =>
      sub === "."
        ? "_root"
        : "_" + sub.slice(2).replace(/[^A-Za-z0-9]/g, "_");
    const tsLines = Object.entries(PROBES).flatMap(([sub, syms]) => {
      const pkg = subpathToImport(sub);
      const tag = slug(sub);
      const aliased = syms.map((s) => `${s} as ${s}${tag}`).join(", ");
      // Reference each aliased symbol exactly once in an array literal so
      // TS sees a real use. `void` + comma operator is treated as suspicious
      // and trips TS2695 ("Left side of comma operator is unused").
      const used = `[${syms.map((s) => `${s}${tag}`).join(", ")}]`;
      return [
        `import { ${aliased} } from '${pkg}';`,
        `void ${used};`,
      ];
    });
    writeFileSync(path.join(sbox, "probe.ts"), tsLines.join("\n") + "\n");

    run("npx", ["--no-install", "tsc", "--noEmit", "-p", "tsconfig.json"], {
      cwd: sbox,
    });
    console.log(
      `  ✓ TypeScript: all ${probeKeys.length} subpaths resolved with their named exports typed`,
    );
  } else {
    step("7. TypeScript resolution probe (SKIPPED via --skip-ts)");
  }

  // ── Done ─────────────────────────────────────────────────────────────────
  step("VERIFICATION COMPLETE");
  console.log(
    `  ✓ Tarball ${tarFilename} is consumer-safe across ${probeKeys.length} subpaths.`,
  );
} catch (err) {
  console.error(`\n✗ Verification crashed: ${err.message}`);
  exitCode = 1;
} finally {
  // Always clean up the tarball + sandbox.
  try {
    if (existsSync(tarPath)) rmSync(tarPath);
  } catch {}
  try {
    if (sbox && existsSync(sbox)) rmSync(sbox, { recursive: true, force: true });
  } catch {}
}

process.exit(exitCode);
