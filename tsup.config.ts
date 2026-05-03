import { defineConfig } from "tsup";

const PKG = "packages/ndpr-toolkit/src";

// Entries that must remain RSC-safe (no "use client" directive in the
// bundled output). Everything else carries the banner so consumers can
// import directly from a Server Component file without a wrapper.
const RSC_SAFE_ENTRIES = ["core", "server"];

// Entries that DO need the "use client" directive — components and hooks.
// We re-inject the directive in onSuccess because esbuild's minify pass
// strips bare directive expressions from the start of files, which is why
// the v3.4.0 build set `esbuildOptions.banner = '"use client"'` but
// shipped zero occurrences in the published bundle.
const CLIENT_ENTRIES = [
  "index",
  "hooks",
  "consent",
  "dsr",
  "dpia",
  "breach",
  "policy",
  "lawful-basis",
  "cross-border",
  "ropa",
  "presets",
  "unstyled",
];

export default defineConfig({
  entry: {
    index: `${PKG}/index.ts`,
    core: `${PKG}/core.ts`,
    server: `${PKG}/server.ts`,
    hooks: `${PKG}/hooks-entry.ts`,
    consent: `${PKG}/consent.ts`,
    dsr: `${PKG}/dsr.ts`,
    dpia: `${PKG}/dpia.ts`,
    breach: `${PKG}/breach.ts`,
    policy: `${PKG}/policy.ts`,
    "lawful-basis": `${PKG}/lawful-basis-entry.ts`,
    "cross-border": `${PKG}/cross-border-entry.ts`,
    ropa: `${PKG}/ropa-entry.ts`,
    adapters: `${PKG}/adapters-entry.ts`,
    presets: `${PKG}/presets-entry.ts`,
    // /unstyled lives at root so it can be a thin barrel re-exporting the
    // inner package's curated unstyled API while keeping the same public
    // entry path consumers expect.
    unstyled: "src/unstyled.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  external: [
    "react",
    "react-dom",
    "jspdf",
    "docx",
    "@radix-ui/react-label",
    "@radix-ui/react-slot",
    "@radix-ui/react-switch",
    "@radix-ui/react-tabs",
    "lucide-react",
    "class-variance-authority",
    "clsx",
    "tailwind-merge",
  ],
  minify: true,
  treeshake: true,
  target: "es2015",
  outDir: "dist",
  esbuildOptions(options) {
    // Default: tag every chunk as a client module. This is the right
    // default because most entries (components + hooks) DO need it. The
    // RSC-safe entries (/core, /server) get the banner stripped in
    // onSuccess so they can be imported safely from RSC code.
    options.banner = {
      js: '"use client"',
    };
  },
  onSuccess: async () => {
    const fs = await import("fs");
    const path = await import("path");

    // ── Ship the new BEM stylesheet (1442 lines, 210 rules covering all
    //    30+ migrated components). Falls back to the legacy 51-line
    //    animations.css only if the new file is missing — the new file
    //    IS the source of truth post-3.4.0.
    const newStyles = path.join(PKG, "styles", "styles.css");
    const legacyStyles = path.join(PKG, "styles", "animations.css");
    const stylesDest = path.join("dist", "styles.css");
    const stylesSource = fs.existsSync(newStyles) ? newStyles : legacyStyles;
    if (fs.existsSync(stylesSource)) {
      fs.copyFileSync(stylesSource, stylesDest);
    }

    // ── "use client" handling (v3.4.1 fix)
    //
    // esbuild's minify pass strips bare directive expressions from the
    // start of files. The `esbuildOptions.banner` we set above therefore
    // gets removed for every entry. To get the directive into the
    // published bundle we strip it (idempotent) then re-inject ONLY for
    // client entries, post-minify.

    const stripUseClient = (filePath: string) => {
      if (!fs.existsSync(filePath)) return;
      const original = fs.readFileSync(filePath, "utf8");
      const stripped = original.replace(/^["']use client["'];?\s*\n?/, "");
      if (stripped !== original) {
        fs.writeFileSync(filePath, stripped, "utf8");
      }
    };

    const injectUseClient = (filePath: string) => {
      if (!fs.existsSync(filePath)) return;
      const original = fs.readFileSync(filePath, "utf8");
      // Idempotent: don't double-prepend if a previous build (or the
      // banner that did survive on this entry by accident) already left
      // the directive in place.
      if (/^["']use client["']/.test(original)) return;
      fs.writeFileSync(filePath, `"use client";\n${original}`, "utf8");
    };

    // RSC-safe entries: ensure no directive — strip if present.
    for (const entry of RSC_SAFE_ENTRIES) {
      stripUseClient(path.join("dist", `${entry}.mjs`));
      stripUseClient(path.join("dist", `${entry}.js`));
    }

    // Client entries: ensure the directive IS present so consumers can
    // import these from a Server Component file without wrapping their
    // own client boundary.
    for (const entry of CLIENT_ENTRIES) {
      injectUseClient(path.join("dist", `${entry}.mjs`));
      injectUseClient(path.join("dist", `${entry}.js`));
    }
  },
});
