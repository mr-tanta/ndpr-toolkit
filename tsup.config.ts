import { defineConfig } from "tsup";

const PKG = "packages/ndpr-toolkit/src";

// Entries that must remain RSC-safe (no "use client" directive in the
// bundled output). Everything else carries the banner so consumers can
// import directly from a Server Component file without a wrapper.
const RSC_SAFE_ENTRIES = ["core", "server"];

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

    // ── Strip the "use client" banner from RSC-safe entries so they can
    //    be imported from a Server Component / Edge Function / Worker
    //    without dragging the importing file into the client bundle.
    const stripUseClient = (filePath: string) => {
      if (!fs.existsSync(filePath)) return;
      const original = fs.readFileSync(filePath, "utf8");
      // tsup's banner is a bare directive — match either quoted form, with
      // or without trailing semicolon, only at the very start of the file.
      const stripped = original.replace(
        /^["']use client["'];?\s*\n?/,
        "",
      );
      if (stripped !== original) {
        fs.writeFileSync(filePath, stripped, "utf8");
      }
    };

    for (const entry of RSC_SAFE_ENTRIES) {
      stripUseClient(path.join("dist", `${entry}.mjs`));
      stripUseClient(path.join("dist", `${entry}.js`));
    }
  },
});
